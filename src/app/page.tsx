"use client";

import { motion } from "framer-motion";
import { Calendar, Phone, Play, Star, FileText } from "lucide-react";
import Image from "next/image";
import Calendly from "./components/Calendly";
import GalleryCarousel from "./components/GalleryCarousel";

export default function Home() {
  const palette = {
    rose: "var(--rose)",
    cream: "var(--cream)",
    charcoal: "var(--charcoal)",
    gold: "var(--gold)",
  };

  return (
    <main className="w-full">
      {/* HERO */}
      <section style={{ background: "var(--rose)" }}>
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-14 md:py-16 grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm" style={{ background: "var(--cream)" }}>
              <span>Free Estimates</span>
            </div>

            <h1 className="mt-5 text-4xl md:text-5xl font-semibold leading-tight">
              Mariana Aular <span className="font-normal">Cleaning Services</span>
            </h1>

            <p className="mt-4 text-lg md:text-xl">
              Limpieza profesional de hogares, Airbnb y post-construcción. Agenda tu visita para presupuesto y deja tu lugar brillante ✨
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

          {/* FOTO HERO */}
          <div className="relative">
            <div className="aspect-[4/5] w-full rounded-3xl shadow-xl overflow-hidden" style={{ background: "var(--cream)" }}>
              <Image
                src="https://gfddvghfqgaijwdtjgsa.supabase.co/storage/v1/object/public/bymariana/hero/mariana.png"
                alt="Mariana Aular - Cleaning Services"
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-12 md:py-14">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Servicios</h2>
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
      </section>

      {/* GALERÍA */}
      <section className="py-14" style={{ background: "var(--cream)" }}>
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Antes y Después</h2>
          <p className="mt-2 opacity-80">Fotos reales de limpieza (carpeta <code>bymariana/gallery/</code> en Supabase).</p>
          <div className="mt-6">
            <GalleryCarousel
              bucket="bymariana"
              prefix="gallery"
              limit={30}
              intervalMs={4500}
              alt="Antes y después - Mariana"
              className="h-[380px] md:h-[520px] w-full"
            />
          </div>
        </div>
      </section>

      {/* CALENDARIO */}
      <section id="booking" className="py-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Agenda disponibilidad</h2>
          <p className="mt-2 opacity-80">Selecciona un día disponible para una visita de presupuesto en tu hogar.</p>
          <div className="mt-6 mx-auto max-w-[840px] rounded-2xl overflow-hidden shadow bg-white">
            <Calendly />
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="py-16" style={{ background: "var(--cream)" }}>
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Testimonios</h2>
          <p className="mt-2 opacity-80">Los clientes pueden dejar reseñas y dar “like”.</p>
        </div>
      </section>

      {/* VIDEOS */}
      <section id="videos" className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Videos</h2>
        <p className="mt-2 opacity-80">Aquí insertaremos los reels y videos de limpieza.</p>
        <div className="mt-6 rounded-2xl overflow-hidden shadow-lg">
          <video className="w-full h-auto" controls playsInline preload="metadata">
            <source src="https://gfddvghfqgaijwdtjgsa.supabase.co/storage/v1/object/public/bymariana/videos/bymariana1-2.mp4" type="video/mp4" />
            Tu navegador no soporta el tag de video.
          </video>
        </div>
      </section>

      {/* SOBRE MARIANA */}
      <section id="cv" className="py-16" style={{ background: "var(--cream)" }}>
        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold">Sobre Mariana</h2>
          <p className="mt-2 opacity-80">“Limpieza profesional que transforma tu hogar en salud, bienestar y cuidado real.”</p>
          <a href="#" className="inline-block mt-4 underline">Ver CV (pronto)</a>
        </div>
      </section>

      {/* CONTACTO */}
      <section className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-semibold">Contacto</h2>
        <p className="mt-2">
          Tampa Bay, FL — Tel: <a className="underline" href="tel:+18138179146">813 8179146</a>
        </p>
        <div className="mt-4 flex gap-3">
          <a href="https://wa.me/18138179146" className="rounded-full px-4 py-2 text-white" style={{ background: "#25D366" }}>WhatsApp</a>
          <a href="tel:+18138179146" className="rounded-full px-4 py-2 text-white" style={{ background: "var(--charcoal)" }}>Llamar</a>
        </div>
      </section>
    </main>
  );
}
