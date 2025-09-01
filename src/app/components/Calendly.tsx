"use client";
import { useEffect, useState } from "react";
import Script from "next/script";

type CalendlyProps = {
  bg?: string;
  text?: string;
  primary?: string;
};

export default function Calendly({
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
}: CalendlyProps) {
  const [height, setHeight] = useState(800); // altura inicial

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_sizing" && e.data?.payload?.height) {
        setHeight(e.data.payload.height);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const url = `https://calendly.com/bymarianaclean?background_color=${bg}&text_color=${text}&primary_color=${primary}`;

  return (
    <>
      <div className="w-full">
        <iframe
          src={url}
          className="w-full"
          style={{ minWidth: 320, height }}
          frameBorder="0"
          title="Calendly"
        />
      </div>

      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
    </>
  );
}
