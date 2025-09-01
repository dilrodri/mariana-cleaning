// src/app/components/GalleryCarousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";

// Si ya tienes src/lib/supabaseClient.ts, importa eso y elimina este createClient
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GalleryItem = {
  name: string;
  url: string;
  label?: "ANTES" | "DESPUÉS";
};

export default function GalleryCarousel() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      // Lista archivos en el bucket `bymariana`, carpeta `gallery`
      const { data, error } = await supabase.storage
        .from("bymariana")
        .list("gallery", { sortBy: { column: "name", order: "asc" } });

      if (error) {
        console.error("Error listando imágenes:", error);
        setErr(error.message);
        setLoading(false);
        return;
      }

      const files = data ?? [];
      const mapped: GalleryItem[] = files
        .filter((f) => /\.(png|jpe?g|webp|gif|svg)$/i.test(f.name))
        .map((f) => {
          // AQUÍ estaba el bug: hay que usar storage.from(...).getPublicUrl(...)
          const { data: pub } = supabase.storage
            .from("bymariana")
            .getPublicUrl(`gallery/${f.name}`);

          const n = f.name.toLowerCase();
          const label =
            n.includes("before") || n.includes("antes")
              ? "ANTES"
              : n.includes("after") || n.includes("despues")
              ? "DESPUÉS"
              : undefined;

          return { name: f.name, url: pub.publicUrl, label };
        });

      setItems(mapped);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <p className="mt-6 text-gray-500">Cargando galería…</p>;
  if (err) return <p className="mt-6 text-red-600">Error: {err}</p>;
  if (!items.length)
    return (
      <p className="mt-6 text-gray-500">
        No hay imágenes en <code>bymariana/gallery</code>.
      </p>
    );

  // Grid simple y estable
  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((it) => (
        <figure
          key={it.url}
          className="relative rounded-xl overflow-hidden shadow bg-white"
        >
          <Image
            src={it.url}
            alt={it.name}
            width={600}
            height={450}
            className="w-full h-full object-cover"
            unoptimized // para no exigir dominio en next.config
          />
          {it.label && (
            <figcaption
              className="absolute top-2 left-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "#F6E6DA", color: "#2B2B2B" }}
            >
              {it.label}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
