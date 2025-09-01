"use client";
import Script from "next/script";

type CalendlyProps = {
  height?: number;        // alto del iframe
  bg?: string;            // SIN el #   (ej: "FFFFFF")
  text?: string;          // SIN el #   (ej: "2B2B2B")
  primary?: string;       // SIN el #   (ej: "D4AF37")
};

export default function Calendly({
  height = 1100,
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
}: CalendlyProps) {
  const url = `https://calendly.com/bymarianaclean?background_color=FFFFFF&text_color=2B2B2B&primary_color=D4AF37`;

  return (
    <>
      {/* El wrapper también blanco para que no haya “franja” distinta */}
      <div className="rounded-none overflow-hidden" style={{ background: "#FFFFFF" }}>
        <div
          className="calendly-inline-widget w-full"
          style={{ minWidth: 320, height }}
          data-url={url}
        />
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
