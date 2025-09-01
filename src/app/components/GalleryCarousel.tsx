"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
// import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GalleryItem = { name: string; url: string };

export type GalleryCarouselProps = {
  /** Nombre del bucket en Supabase Storage */
  bucket: string;
  /** Carpeta opcional dentro del bucket (sin “/” inicial) */
  prefix?: string;
  /** Máximo de imágenes a traer */
  limit?: number;
  /** Autoplay en ms. 0 = desactivar */
  intervalMs?: number;
  /** Alt base para las imágenes */
  alt?: string;
  /** Clases para alto/ancho del carrusel */
  className?: string;
  /** Radio de borde (Tailwind) */
  rounded?: string;
};

export default function GalleryCarousel({
  bucket,
  prefix,
  limit = 30,
  intervalMs = 4500,
  alt = "Galería",
  className = "h-[380px] md:h-[520px] w-full",
  rounded = "rounded-2xl",
}: GalleryCarouselProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hoveringRef = useRef(false);

  // 1) Cargar imágenes públicas del bucket/carpeta
  useEffect(() => {
    let isMounted = true;
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
          const fullPath = path ? `${path}/${f.name}` : f.name;
          const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
          return { name: f.name, url: pub.publicUrl };
        });

        if (isMounted) setItems(mapped);
      } catch (e: any) {
        console.error(e);
        if (isMounted) setError(e?.message || "No se pudo cargar la galería.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [bucket, prefix, limit]);

  // 2) Autoplay
  useEffect(() => {
    if (!intervalMs || items.length < 2) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!hoveringRef.current) {
        setIndex((i) => (i + 1) % items.length);
      }
    }, intervalMs);
    return () => { timerRef.current && clearInterval(timerRef.current); };
  }, [intervalMs, items.length]);

  const go = (dir: number) => {
    if (!items.length) return;
    setIndex((i) => (i + dir + items.length) % items.length);
  };

  if (loading) {
    return (
      <div className={`${className} ${rounded} bg-[var(--rose)]/30 animate-pulse`} />
    );
  }

  if (error || !items.length) {
    return (
      <div className="rounded-xl bg-[var(--rose)]/20 p-4">
        {error ?? "No hay imágenes para mostrar aún."}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className} ${rounded} bg-white shadow`}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      {/* Slides */}
      {items.map((item, i) => (
        <div
          key={item.name}
          className={`absolute inset-0 transition-opacity duration-500
            ${i === index ? "opacity-100" : "opacity-0"}`}
        >
          <Image
            src={item.url}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover"
            unoptimized
            priority={i === 0}
          />
        </div>
      ))}

      {/* Flechas */}
      <button
        aria-label="Prev"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Next"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
      >
        <ChevronRight />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition
              ${i === index ? "bg-white" : "bg-white/60 hover:bg-white/80"}`}
            aria-label={`Ir a la imagen ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
