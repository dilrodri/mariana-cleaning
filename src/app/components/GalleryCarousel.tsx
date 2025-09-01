"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Conecta Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Gallery() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function loadImages() {
      // 🚨 Ojo: el bucket se llama "bymariana" y dentro está la carpeta "gallery"
      const { data, error } = await supabase.storage
        .from("bymariana")
        .list("gallery");

      if (error) {
        console.error("Error al listar imágenes:", error.message);
        return;
      }

      if (data) {
        // Obtenemos la URL pública de cada archivo
        const urls = data.map((file) =>
          supabase.storage.from("bymariana").getPublicUrl(`gallery/${file.name}`)
            .data.publicUrl
        );
        setImages(urls);
      }
    }

    loadImages();
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Antes y Después</h2>

      {images.length === 0 ? (
        <p className="text-gray-500">No hay imágenes aún.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url) => (
            <div key={url} className="aspect-[4/3] rounded-xl overflow-hidden shadow">
              <Image
                src={url}
                alt="Foto de limpieza"
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
