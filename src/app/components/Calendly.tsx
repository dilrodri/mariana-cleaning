"use client";

import Script from "next/script";
import { useRef } from "react";

type CalendlyProps = {
  url: string;
  height?: number;
};

export default function CalendlyWidget({ url, height = 700 }: CalendlyProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: 320, height }}
        ref={ref}
      />
      {/* Carga el script de Calendly correctamente en Next */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
