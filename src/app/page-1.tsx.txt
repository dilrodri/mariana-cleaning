"use client";

import { motion } from "framer-motion";
import { Calendar, Phone, Play, Star, FileText, MessageSquarePlus } from "lucide-react";
import Image from "next/image";
import Calendly from "./components/Calendly";
import GalleryCarousel from "./components/GalleryCarousel";
import VideoCarousel from "./components/VideoCarousel";
import TestimonialsUploader from "./components/TestimonialsUploader";
import TestimonialsFeed from "./components/TestimonialsFeed";
import Collapsible from "./components/Collapsible";

export default function Home() {
  const palette = {
    rose: "var(--rose)",
    cream: "var(--cream)",
    charcoal: "var(--charcoal)",
    gold: "var(--gold)",
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--rose)" }}>
        <div className="mx-auto max-w-6xl px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          {/* Texto */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm" style={{ background: "var(--cream)" }}>
              <span>Free Estimates</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-semibold leading-tight">
              Mariana Aular <span className="font-normal">Cleaning Services</span>
            </h1>

            <p className="mt-4 text-lg md:text-xl">
              Limpieza profesional de hogares, Airbnb y post-construcción. Agenda tu visita
              para presupuesto y deja tu lugar brillante ✨
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#booking" className="rounded-2xl px-5 py-3 text-white shadow" style={{ background: palette.charcoal }}>
                <Calendar className="inline mr-2 h-5 w-5" /> Reservar visita
              </a>

              <a href="tel:+18138179146" className="rounded-2xl px-5 py-3 border-2" style={{ borderColor: palette.charcoal, color: palette.charcoal }}>
                <Phone className="inline mr-2 h-5 w-5" /> Llamar 813 8179146
              </a>

              <a href="#videos" className="rounded-2xl px-5 py-3 border-2" style={{ borderColor: palette.charcoal, color: palette.charcoal }}>
                <Play className="inline mr-2 h-5 w-5" /> Ver videos
              </a>

              <a href="#testimonios" className="rounded-2xl px-5 py-3 border-2" style={{ borderColor: palette.charcoal, color: palette.charcoal }}>
                <MessageSquarePlus className="inline mr-2 h-5 w-5" /> Dejar testimonio
              </a>
            </div>

            <div className="mt-4 text-sm opacity-80 flex items-center gap-2">
              <Star /> <span>Calidad, puntualidad y confianza.</span>
            </div>

            <div className="mt-6">
              <a href="#cv" className="underline" style={{ color: palette.charcoal }}>
                <FileText className="inline h-4 w-4 mr-1" /> Ver CV de Mariana
              </a>
            </div>
          </motion.div>

          {/* Foto Hero */}
          <div className="relative">
            <div className="aspect-[4/5] w-full rounded-3xl shadow-xl overflow-hidden" style={{ background: "transparent" }}>
              <Image
                src="https://gfddvghfqgaijwdtjgsa.supabase.co/storage/v1/object/public/bymariana/hero/mariana.png"
                alt="Mariana Aular - Cleaning Services"
                width={600}
                height={750}
                className="w-full h-full object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <Collapsible title="Servicios" defaultOpen>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              ["Casas & Apartamentos", "Limpieza profunda y de mantenimiento."],
              ["Airbnb / Alquileres", "Check-in/out, reposición básica y fotos."],
              ["Post-Construcción", "Retiro de polvo fino y acabados."],
              ["Move-In / Move-Out", "Listo para entrar o entregar."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl p-5 shadow-sm" style={{ background: "var(--cream)" }}>
                <div className="font-semibold">{t}</div>
                <p className="mt-1 text-sm opacity-80">{d}</p>
              </li>
            ))}
          </ul>
        </Collapsible>
      </section>

      {/* CALENDARIO (espacio reducido) */}
      <section id="booking" className="pt-10 pb-4" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-5xl px-6">
          <Collapsible title="Agenda disponibilidad" defaultOpen>
            <p className="opacity-80 mb-4">
              Selecciona un día disponible para una visita de presupuesto en tu hogar.
            </p>
            <Calendly bg="FFFFFF" text="2B2B2B" primary="D4AF37" />
          </Collapsible>
        </div>
      </section>

      {/* MEDIA: GALERÍA + VIDEOS (lado a lado) */}
      <section id="videos" className="mx-auto max-w-6xl px-6 py-12">
        <Collapsible title="Antes y Después & Videos" defaultOpen>
          <div className="grid gap-8 md:grid-cols-2 items-start">
            {/* Galería */}
            <div>
              <h3 className="text-xl font-semibold">Antes y Después</h3>
              <p className="mt-1 opacity-80">
                Fotos reales de limpieza. Sube imágenes a <code>bymariana/gallery/</code> en Supabase.
              </p>
              <div className="mt-4">
                <GalleryCarousel
                  bucket="bymariana"
                  prefix="gallery"
                  limit={40}
                  intervalMs={0}
                  rounded="rounded-2xl"
                  alt="Fotos reales de limpieza"
                  className="w-full h-[340px] md:h-[420px]"
                />
              </div>
            </div>

            {/* Videos */}
            <div>
              <h3 className="text-xl font-semibold">Videos</h3>
              <p className="mt-1 opacity-80">Reels y demostraciones de limpieza.</p>
              <div className="mt-4">
                <VideoCarousel
                  bucket="bymariana"
                  prefix="videos"
                  postersPrefix="videos-posters"
                  intervalMs={0}
                  className="w-full h-[340px] md:h-[420px]"
                  rounded="rounded-2xl"
                />
              </div>
            </div>
          </div>
        </Collapsible>
      </section>

      {/* TESTIMONIOS: franja crema + pestaña */}
      <section id="testimonios" className="py-14" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <Collapsible title="Testimonios" defaultOpen>
            <div className="mx-auto max-w-xl">
              <div className="p-6 rounded-2xl bg-white shadow-md border border-[var(--rose)]">
                <h3 className="text-lg font-semibold mb-2 text-[var(--charcoal)]">✨ Comparte tu testimonio</h3>
                <p className="text-sm text-neutral-600 mb-4">
                  Arrastra tu archivo o haz click en el botón. Aceptamos <b>fotos</b> y <b>videos</b>.
                </p>

                <TestimonialsUploader />

                <p className="text-xs mt-3 text-neutral-500">
                  Publicaciones con ofensas se rechazan automáticamente.
                </p>
              </div>

              <div className="h-10" />

              <div className="grid gap-6 md:grid-cols-2">
                <TestimonialsFeed />
              </div>
            </div>
          </Collapsible>
        </div>
      </section>

      {/* SOBRE MARIANA — ahora FONDO BLANCO */}
      <section id="cv" className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <Collapsible title="Sobre Mariana" defaultOpen>
            <p className="opacity-80">
              “Limpieza profesional que transforma tu hogar en salud, bienestar y cuidado real.”
            </p>
            <a href="#" className="inline-block mt-4 underline">Ver CV (pronto)</a>
          </Collapsible>
        </div>
      </section>

      {/* CONTACTO — ahora FONDO CREMA */}
      <section className="py-16" style={{ background: "var(--cream)" }}>
        <div className="mx-auto max-w-6xl px-6">
          <Collapsible title="Contacto" defaultOpen>
            <p className="mt-1">
              Tampa Bay, FL — Tel:{" "}
              <a className="underline" href="tel:+18138179146">813 8179146</a>
            </p>
            <div className="mt-4 flex gap-3">
              <a href="https://wa.me/18138179146" className="rounded-full px-4 py-2 text-white" style={{ background: "#25D366" }}>
                WhatsApp
              </a>
              <a href="tel:+18138179146" className="rounded-full px-4 py-2 text-white" style={{ background: "var(--charcoal)" }}>
                Llamar
              </a>
            </div>
          </Collapsible>
        </div>
      </section>
    </main>
  );
}