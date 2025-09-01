// src/app/components/Calendly.tsx
"use client";
import Script from "next/script";
import { useMemo } from "react";

type Props = {
  bg?: string;       // SIN #, ej "FFFFFF"
  text?: string;     // SIN #, ej "2B2B2B"
  primary?: string;  // SIN #, ej "D4AF37"
  // puedes ajustar estos si aún ves scroll
  hMobile?: number;
  hTablet?: number;
  hDesktop?: number;
};

export default function Calendly({
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
  hMobile = 1120,      // ↑ súbelo/bájalo de 20 en 20 si hace falta
  hTablet = 1060,
  hDesktop = 980,
}: Props) {
  const url = useMemo(
    () =>
      `https://calendly.com/bymarianaclean?background_color=${bg}&text_color=${text}&primary_color=${primary}`,
    [bg, text, primary]
  );

  return (
    <>
      <div className="w-full grid place-items-center overflow-visible">
        <div
          className="
            calendly-inline-widget w-full max-w-[820px]
            h-[1120px] sm:h-[1060px] lg:h-[980px]
          "
          data-url={url}
          style={{
            minWidth: 320,
            // si quieres usar los props numéricos en lugar de las clases:
            // height: hDesktop, // (no mezclar con las clases de arriba)
          }}
        />
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
