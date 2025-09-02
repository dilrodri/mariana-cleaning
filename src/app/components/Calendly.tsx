"use client";
import { useEffect } from "react";

type Props = {
  height?: number;
  bg?: string;
  text?: string;
  primary?: string;
};

export default function Calendly({
  height = 1050,
  bg = "FFFFFF",
  text = "2B2B2B",
  primary = "D4AF37",
}: Props) {
  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      document.body.removeChild(s);
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget"
      data-url={`https://calendly.com/bymarianaclean?background_color=${bg}&text_color=${text}&primary_color=${primary}`}
      style={{ minWidth: 320, height }}
    />
  );
}