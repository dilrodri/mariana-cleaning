"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Si ya tienes un cliente compartido, puedes importar desde src/lib/supabaseClient
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type GalleryCarouselProps = {
  bucket: string;          // nombre del bucket (bymariana)
  prefix?: string;         // carpeta (p.ej. "gallery")
  limit?: number;          // máximo de imágenes
  intervalMs?: number;     // autoplay en ms (0 para desactivar)
  rounded?: string;        // clases tailwind (rounded-2xl, etc.)
  alt?: string;            // alt base
  className?: string;      // alto/ancho del carrusel (tailwind)
};

export default function GalleryCarousel({
  bucket,
  prefix,
  limit = 20,
  intervalMs = 4500,
  rounded = "rounded-2xl",
  alt = "Galería",
  className = "h-[360px] md:h-[480px] w-full",
}: GalleryCarouselProps) {
  const [items, setItems] = useState<{ name: string; url: string }[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hoveringRef = useRef(false);

  // Carga pública desde Supabase Storage
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const path = prefix ? prefix.replace(/^\/+|\/+$/g, "") : "";
        const { data, error } = await supabase.storage
          .from(bucket)
          .list(path || undefined, {
            limit,
            sortBy: { column: "name", order: "asc" },
          });

        if (error) throw error;

        const files = (data || []).filter((f) =>
          ["jpg", "jpeg", "png", "webp", "avif"].some((ext) =>
            f.name.toLowerCase().endsWith(ext)
          )
        );

        const mapped = files.map((f) => {
          const full = path ? `${path}/${f.name}` : f.name;
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(full);
          return { name: f.name, url: pub.publicUrl };
        });

        if (alive) setItems(mapped);
      } catch (e: any) {
        if (alive) setError(e?.message || "No se pudo cargar la galería");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [bucket, prefix, limit]);

  // autoplay
  useEffect(() => {
    if (!intervalMs || intervalMs <= 0) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!hoveringRef.current && items.length > 1) {
        setIndex((i) => (i + 1) % items.length);
      }
    }, intervalMs);
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, [intervalMs, items.length]);

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  if (loading) {
    return (
      <div className={`grid place-items-center ${className} ${rounded} bg-[var(--rose)]/20`}>
        Cargando galería…
      </div>
    );
  }
  if (error) {
    return (
      <div className={`grid place-items-center ${className} ${rounded} bg-red-50`}>
        Error: {error}
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className={`grid place-items-center ${className} ${rounded} bg-[var(--rose)]/20`}>
        No hay imágenes en {bucket}/{prefix || ""}
      </div>
    );
  }

  const current = items[index];

  return (
    <div
      className={`relative overflow-hidden ${className} ${rounded}`}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
      style={{ background: "var(--cream)" }}
    >
      {/* Imagen actual */}
      <Image
        src={current.url}
        alt={`${alt}: ${current.name}`}
        fill
        className="object-cover"
        unoptimized
        priority
      />

      {/* Botones */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
        aria-label="Anterior"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
        aria-label="Siguiente"
      >
        <ChevronRight />
      </button>

      {/* Paginación */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-black/80" : "bg-black/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
