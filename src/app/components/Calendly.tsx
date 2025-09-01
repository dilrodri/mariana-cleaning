"use client";
import Script from "next/script";

type CalendlyProps = {
  height?: number;
  bg?: string;      // hex sin #
  text?: string;    // hex sin #
  primary?: string; // hex sin #
};

export default function Calendly({
  height = 1100,
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
}: CalendlyProps) {
  const url = `https://calendly.com/bymarianaclean?background_color=${bg}&text_color=${text}&primary_color=${primary}`;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden shadow"
        style={{ background: `#${bg}` }}  // para que no se vea “franja” distinta al cargar
      >
        <div
          className="calendly-inline-widget w-full h-[1250px] sm:h-[1200px] md:h-[1100px] lg:h-[1050px]"
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
