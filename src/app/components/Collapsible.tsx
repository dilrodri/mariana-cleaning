"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;      // clases para el contenedor interior
};

export default function Collapsible({
  title,
  children,
  defaultOpen = true,
  className = "",
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="relative my-6">
      {/* Pestaña */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`absolute -top-4 left-6 z-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-t-xl
                    bg-[var(--rose)] text-white shadow-md hover:opacity-90`}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Caja */}
      <div className="rounded-2xl border border-[var(--rose)]/25 bg-white shadow-sm">
        <motion.div
          initial={false}
          animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ overflow: "hidden" }}
        >
          <div className={`p-6 ${className}`}>{children}</div>
        </motion.div>
      </div>
    </div>
  );
}