"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type VideoItem = {
  name: string;
  path: string;     // videos/archivo.mp4
  url: string;      // public URL del video
  poster?: string;  // poster verificado
};

export type VideoCarouselProps = {
  bucket: string;             // "bymariana"
  prefix?: string;            // "videos"
  postersPrefix?: string;     // "videos-posters" (opcional)
  limit?: number;
  intervalMs?: number;        // autoplay de carrusel (0=off)
  className?: string;
  rounded?: string;
  previewMode?: "poster" | "autoplay"; // cómo “previsualizar”
};

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "server";
  const KEY = "video-like-anonid";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

async function urlExists(url: string) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}

export default function VideoCarousel({
  bucket,
  prefix = "videos",
  postersPrefix,
  limit = 20,
  intervalMs = 0,
  className = "w-full max-w-5xl h-[380px] md:h-[520px]",
  rounded = "rounded-2xl",
  previewMode = "poster", // por defecto mostramos poster
}: VideoCarouselProps) {
  const [items, setItems] = useState<VideoItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);
  const hoveringRef = useRef(false);
  const anonIdRef = useRef<string>(getOrCreateAnonId());

  // ---------- Carga de videos + posters verificados ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const folder = prefix.replace(/^\/+|\/+$/g, "");
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder || undefined, { limit, sortBy: { column: "name", order: "asc" } });

      if (error) {
        setItems([]);
        setLoading(false);
        return;
      }

      const videoFiles = (data ?? []).filter(f =>
        ["mp4", "webm", "mov", "m4v"].some(ext => f.name.toLowerCase().endsWith(ext))
      );

      const posterFolder = (postersPrefix ?? prefix).replace(/^\/+|\/+$/g, "");

      const mapped: VideoItem[] = [];
      for (const f of videoFiles) {
        const path = folder ? `${folder}/${f.name}` : f.name;
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);

        // poster con el mismo basename .jpg/.png verificado con HEAD
        const base = f.name.replace(/\.(mp4|webm|mov|m4v)$/i, "");
        const posterCandidates = [
          `${posterFolder}/${base}.jpg`,
          `${posterFolder}/${base}.png`,
        ];

        let poster: string | undefined;
        for (const c of posterCandidates) {
          const { data: p } = supabase.storage.from(bucket).getPublicUrl(c);
          if (p?.publicUrl && (await urlExists(p.publicUrl))) {
            poster = p.publicUrl;
            break;
          }
        }

        mapped.push({ name: f.name, path, url: pub.publicUrl, poster });
      }

      if (!alive) return;
      setItems(mapped);
      setIdx(0);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [bucket, prefix, postersPrefix, limit]);

  // ---------- Autoplay del carrusel (opcional) ----------
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0 || items.length <= 1) return;
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    const id = window.setInterval(() => {
      if (!hoveringRef.current) setIdx(i => (i + 1) % items.length);
    }, intervalMs);
    timerRef.current = id;
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [intervalMs, items.length]);

  const current = items[idx];

  // ---------- Cargar conteo de likes + si yo le di like ----------
  const refreshLikes = useCallback(async (path: string) => {
    // count exact (HEAD=true para no traer filas)
    const { count } = await supabase
      .from("video_likes")
      .select("*", { count: "exact", head: true })
      .eq("path", path);

    setLikeCount(count ?? 0);

    // verifico si este anon_id ya likeó
    const { data: mine } = await supabase
      .from("video_likes")
      .select("id")
      .eq("path", path)
      .eq("anon_id", anonIdRef.current)
      .limit(1);

    setLiked(!!mine && mine.length > 0);
  }, []);

  useEffect(() => {
    if (!current) return;
    refreshLikes(current.path);
  }, [current, refreshLikes]);

  // ---------- Toggle like (servidor) ----------
  const toggleLike = useCallback(async () => {
    if (!current) return;
    const path = current.path;

    // Optimista
    setLiked(v => !v);
    setLikeCount(c => (liked ? Math.max(0, c - 1) : c + 1));

    if (!liked) {
      // dar like => insert
      const { error } = await supabase.from("video_likes").insert({
        path,
        anon_id: anonIdRef.current,
      });
      if (error) {
        // revertir si falla
        setLiked(false);
        setLikeCount(c => Math.max(0, c - 1));
      }
    } else {
      // quitar like => delete
      const { error } = await supabase
        .from("video_likes")
        .delete()
        .eq("path", path)
        .eq("anon_id", anonIdRef.current);
      if (error) {
        // revertir si falla
        setLiked(true);
        setLikeCount(c => c + 1);
      }
    }
  }, [current, liked]);

  const prev = () => setIdx(i => (i - 1 + items.length) % items.length);
  const next = () => setIdx(i => (i + 1) % items.length);

  // ---------- Render ----------
  if (loading)
    return (
      <div className={`grid place-items-center ${className} ${rounded} bg-[var(--rose)]/20`}>
        Cargando videos…
      </div>
    );

  if (!items.length)
    return (
      <div className={`grid place-items-center ${className} ${rounded} bg-[var(--rose)]/20`}>
        No hay videos en {bucket}/{prefix}.
      </div>
    );

  return (
    <div
      className={`relative overflow-hidden ${className} ${rounded} bg-[var(--cream)]`}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      <video
        key={current.url}
        className="w-full h-full object-cover"
        controls
        playsInline
        preload="metadata"
        poster={current.poster}
        // Si prefieres preview en movimiento sin click:
        {...(previewMode === "autoplay" && { autoPlay: true, muted: true, loop: true })}
      >
        <source src={current.url} type="video/mp4" />
      </video>

      {/* Flechas */}
      {items.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            aria-label="Anterior"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
            aria-label="Siguiente"
          >
            <ChevronRight />
          </button>
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
        title={liked ? "Te gusta este video" : "Dar like"}
      >
        <Heart className="h-5 w-5" />
        <span className="text-sm font-medium">{likeCount}</span>
      </button>
    </div>
  );
}