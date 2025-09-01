"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

type ImgItem = {
  url: string;
  name: string;   // nombre de archivo
  tag?: "Antes" | "Después" | undefined;
};

const BUCKET = "bymariana";
const FOLDER = "gallery"; // subcarpeta dentro del bucket

function supabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

export default function GalleryCarousel() {
  const [items, setItems] = useState<ImgItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<ImgItem | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // leer imágenes de Supabase Storage
  useEffect(() => {
    (async () => {
      try {
        const sb = supabaseClient();
        const { data, error } = await sb.storage
          .from(BUCKET)
          .list(FOLDER, { limit: 100, sortBy: { column: "name", order: "asc" } });

        if (error) throw error;

        const imgs =
          (data ?? [])
            .filter(
              (f) =>
                f.name.match(/\.(png|jpe?g|webp|gif)$/i) && !f.name.endsWith("/")
            )
            .map((f) => {
              const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`);
              const tag =
                /antes/i.test(f.name)
                  ? "Antes"
                  : /desp(u|ú)es/i.test(f.name)
                  ? "Después"
                  : undefined;
              return { url: pub.publicUrl, name: f.name, tag } as ImgItem;
            });

        setItems(imgs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    // Opcional: agrupar por base-name si usas nombres tipo baño-antes.jpg / baño-despues.jpg
    // Aquí solo devolvemos en el orden natural
    return items;
  }, [items]);

  const scrollByCard = (dir: "left" | "right") => {
    if (!scroller.current) return;
    const w = scroller.current.clientWidth;
    scroller.current.scrollBy({ left: dir === "left" ? -w : w, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] rounded-xl bg-[var(--rose)]/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!grouped.length) {
    return <p className="mt-4 opacity-80">Aún no hay fotos en la galería.</p>;
  }

  return (
    <div className="mt-6 relative">
      {/* Botones */}
      <button
        aria-label="Anterior"
        onClick={() => scrollByCard("left")}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-white/80 shadow"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        aria-label="Siguiente"
        onClick={() => scrollByCard("right")}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 bg-white/80 shadow"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Carrusel */}
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {grouped.map((img) => (
          <figure
            key={img.url}
            className="min-w-[68%] sm:min-w-[45%] md:min-w-[32%] lg:min-w-[24%] snap-start"
          >
            <div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[var(--cream)] shadow"
            >
              <img
                src={img.url}
                alt={img.name}
                className="h-full w-full object-cover"
                onClick={() => setLightbox(img)}
              />
              {/* etiqueta Antes/Después si el nombre lo contiene */}
              {img.tag && (
                <span className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs bg-black/70 text-white">
                  {img.tag}
                </span>
              )}
              {/* icono zoom */}
              <button
                className="absolute right-2 bottom-2 rounded-full bg-white/85 p-1 shadow"
                onClick={() => setLightbox(img)}
                aria-label="Ampliar"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
            <figcaption className="mt-2 text-sm opacity-80 truncate">{img.name}</figcaption>
          </figure>
        ))}
      </div>

      {/* Lightbox simple */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 grid place-items-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox.url}
            alt={lightbox.name}
            className="max-h-[90vh] max-w-[95vw] rounded-xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
