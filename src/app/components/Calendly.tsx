// src/app/components/Calendly.tsx
"use client";
import Script from "next/script";
import { useMemo } from "react";

type Props = {
  bg?: string;       // hex SIN #
  text?: string;     // hex SIN #
  primary?: string;  // hex SIN #
};

export default function Calendly({
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
}: Props) {
  const url = useMemo(
    () =>
      `https://calendly.com/bymarianaclean?background_color=${bg}&text_color=${text}&primary_color=${primary}`,
    [bg, text, primary]
  );

  return (
    <>
      {/* Contenedor sin fondo ni sombra; centra el iframe */}
      <div className="w-full grid place-items-center">
        <div
          className="
            calendly-inline-widget
            w-full
            max-w-[780px]
            h-[740px] sm:h-[780px] lg:h-[720px]
          "
          data-url={url}
          style={{ minWidth: 320 }}
        />
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
