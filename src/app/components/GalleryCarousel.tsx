"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type GalleryItem = {
  name: string;     // nombre del archivo en la carpeta
  path: string;     // p.ej. "gallery/foto1.jpg"
  url: string;      // public/signed URL para mostrar
};

export type GalleryCarouselProps = {
  bucket: string;           // ej: "bymariana"
  prefix?: string;          // ej: "gallery"
  limit?: number;           // máx. de imágenes
  intervalMs?: number;      // autoplay (0 => desactivado)
  rounded?: string;         // tailwind (p.ej. "rounded-2xl")
  alt?: string;             // alt base
  className?: string;       // clases extra del wrapper
  objectFit?: "cover" | "contain";
};

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "server";
  const KEY = "photo-like-anonid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

export default function GalleryCarousel({
  bucket,
  prefix = "gallery",
  limit = 50,
  intervalMs = 0,
  rounded = "rounded-2xl",
  alt = "Foto",
  className,
  objectFit = "cover",
}: GalleryCarouselProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  // likes
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  const anonIdRef = useRef<string>(getOrCreateAnonId());
  const timerRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const normalizedPrefix = useMemo(() => prefix.replace(/^\/+|\/+$/g, ""), [prefix]);

  // --------- Carga de imágenes desde Supabase ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);

      const { data, error } = await supabase.storage
        .from(bucket)
        .list(normalizedPrefix || undefined, {
          limit,
          sortBy: { column: "name", order: "asc" },
        });

      if (error) {
        console.error("Supabase list error:", error.message);
        setItems([]);
        setLoading(false);
        return;
      }

      const supported = (data ?? []).filter((f) =>
        /\.(jpg|jpeg|png|webp|gif|avif)$/i.test(f.name)
      );

      const urls = await Promise.all(
        supported.map(async (f) => {
          const path = normalizedPrefix ? `${normalizedPrefix}/${f.name}` : f.name;
          // Intentar signed URL (bucket privado); fallback a public URL
          const signed = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
          if (!signed.error && signed.data?.signedUrl) {
            return { name: f.name, path, url: signed.data.signedUrl };
          }
          const pub = supabase.storage.from(bucket).getPublicUrl(path);
          return { name: f.name, path, url: pub.data.publicUrl };
        })
      );

      if (!alive) return;
      setItems(urls);
      setIdx(0);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [bucket, normalizedPrefix, limit]);

  const hasItems = items.length > 0;
  const current = items[idx];

  // --------- Autoplay opcional ----------
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0 || items.length <= 1) return;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    const id = window.setInterval(() => {
      if (!hoveringRef.current) setIdx((i) => (i + 1) % items.length);
    }, intervalMs);
    timerRef.current = id;
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [intervalMs, items.length]);

  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length);
  const next = () => setIdx((i) => (i + 1) % items.length);

  // --------- Likes: cargar conteo + si yo likeé la foto actual ----------
  const refreshLikes = useCallback(async (path: string) => {
    const { count } = await supabase
      .from("photo_likes")
      .select("*", { count: "exact", head: true })
      .eq("path", path);
    setLikeCount(count ?? 0);

    const { data: mine } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("path", path)
      .eq("anon_id", anonIdRef.current)
      .limit(1);
    setLiked(!!mine && mine.length > 0);
  }, []);

  useEffect(() => {
    if (current) refreshLikes(current.path);
  }, [current, refreshLikes]);

  // --------- Toggle like (optimista) ----------
  const toggleLike = useCallback(async () => {
    if (!current) return;
    const path = current.path;

    // Optimista
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? Math.max(0, c - 1) : c + 1));

    if (!liked) {
      const { error } = await supabase.from("photo_likes").insert({
        path,
        anon_id: anonIdRef.current,
      });
      if (error) {
        // revertir si falla
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from("photo_likes")
        .delete()
        .eq("path", path)
        .eq("anon_id", anonIdRef.current);
      if (error) {
        // revertir si falla
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    }
  }, [current, liked]);

  // --------- Render ----------
  if (loading) {
    return (
      <div className={["relative w-full bg-[var(--rose)]/20 grid place-items-center", rounded, className].join(" ")}>
        Cargando fotos…
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className={["relative w-full bg-[var(--rose)]/20 grid place-items-center", rounded, className].join(" ")}>
        No hay imágenes en {bucket}/{normalizedPrefix}.
      </div>
    );
  }

  return (
    <div
      className={["relative w-full overflow-hidden", rounded, className].join(" ")}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      {/* Imagen actual */}
      <div className="relative w-full aspect-[16/9] bg-[var(--cream)]">
        <Image
          key={current.path}
          src={current.url}
          alt={`${alt}: ${current.name}`}
          fill
          className={objectFit === "cover" ? "object-cover" : "object-contain"}
          sizes="(max-width: 768px) 100vw, 1024px"
          priority={true}
          unoptimized
        />
      </div>

      {/* Flechas */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          >
            <ChevronRight />
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {items.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${i === idx ? "bg-black/80" : "bg-black/30"}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Like + contador */}
      <button
        onClick={toggleLike}
        className={`absolute bottom-3 right-3 px-3 py-2 rounded-full shadow flex items-center gap-2 transition
                    ${liked ? "bg-pink-600 text-white" : "bg-white/80 hover:bg-white text-black"}`}
        aria-label={liked ? "Quitar like" : "Dar like"}
        title={liked ? "Te gusta esta foto" : "Dar like"}
      >
        <Heart className="h-5 w-5" />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>
    </div>
  );
}