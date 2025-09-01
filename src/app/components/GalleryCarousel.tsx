"use client";


import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { ChevronLeft, ChevronRight } from "lucide-react";


// ✅ Si ya tienes src/lib/supabaseClient.ts, importa desde allí y elimina esto
const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);


export type GalleryCarouselProps = {
/** Nombre del bucket en Supabase Storage */
bucket: string;
/** Carpeta opcional dentro del bucket (por ejemplo: "gallery/antes"). Sin "/" inicial */
prefix?: string;
/** Máximo de imágenes a traer */
limit?: number;
/** Autoplay en ms. Pon 0 para desactivar */
intervalMs?: number;
/** Radio de borde utilitario (tailwind). Ej: "rounded-2xl" */
rounded?: string;
/** Alt base para las imágenes */
alt?: string;
/** Alto en px del carrusel (responsive usando clases Tailwind) */
className?: string;
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


// Carga de imágenes desde Supabase Storage (archivos públicos)
useEffect(() => {
let isMounted = true;
(async () => {
try {
setLoading(true);
setError(null);
const path = prefix ? prefix.replace(/^\/+|\/+$/g, "") : ""; // normaliza
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
if (isMounted) setError(e?.message || "No se pudo cargar la galería");
} finally {
if (isMounted) setLoading(false);
}
})();
return () => {
isMounted = false;
};
}
