"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    Calendly?: any;
  }
}

export default function Calendly() {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => document.body.removeChild(s);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden shadow">
      <div
        className="
          calendly-inline-widget
          w-full
          h-[1250px]   /* <-- aumentado para que no aparezca la barra */
          sm:h-[1200px]
          md:h-[1100px]
          lg:h-[1050px]
        "
        data-url="https://calendly.com/bymarianaclean?background_color=#F6E6DA&text_color=#2B2B2B&primary_color=D4AF37"
      />
    </div>
  );
}