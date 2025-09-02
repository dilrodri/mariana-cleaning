"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Upload, Image as ImgIcon, Video, X } from "lucide-react";

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "server";
  const KEY = "anon-id";
  let v = localStorage.getItem(KEY);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(KEY, v); }
  return v;
}

const ACCEPTED_IMG = ["image/jpeg","image/png","image/webp","image/avif","image/gif"] as const;
const ACCEPTED_VID = ["video/mp4","video/webm","video/quicktime","video/x-m4v"] as const;
const MAX_MB = 200;

export default function TestimonialsUploader() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPick = (f: File | null) => setFile(f);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    onPick(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onPick(e.dataTransfer.files[0]);
    }
  };

  const onUpload = async () => {
    if (!file) { alert("Selecciona una foto o video"); return; }

    const isImg = ACCEPTED_IMG.includes(file.type as (typeof ACCEPTED_IMG)[number]);
    const isVid = ACCEPTED_VID.includes(file.type as (typeof ACCEPTED_VID)[number]);
    if (!isImg && !isVid) { alert("Formato no soportado"); return; }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_MB) { alert(`Archivo muy grande (${sizeMB.toFixed(1)} MB). Máximo ${MAX_MB} MB.`); return; }

    setBusy(true);
    try {
      const kind: "image" | "video" = isImg ? "image" : "video";
      const ext = (file.name.split(".").pop() || (isImg ? "jpg" : "mp4")).toLowerCase();
      const uid = crypto.randomUUID();
      const yyyy_mm = new Date().toISOString().slice(0,7);
      const path = `ugc/${yyyy_mm}/${uid}/${uid}.${ext}`;

      const { error: upErr } = await supabase.storage.from("bymariana").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;

      const anon_id = getOrCreateAnonId();

      // 🔧 FIX: usar upsert en vez de insert().onConflict().ignore()
      await supabase
        .from("anon_visitors")
        .upsert({ anon_id }, { onConflict: "anon_id", ignoreDuplicates: true });

      const { error: insErr } = await supabase.from("posts").insert({
        anon_id,
        kind,
        storage_path: path,
        caption: caption || null,
        status: "approved", // cambia a 'pending' cuando actives moderación
      });
      if (insErr) throw insErr;

      setCaption("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      alert("¡Tu testimonio fue publicado!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      alert(msg || "Error subiendo testimonio");
    } finally {
      setBusy(false);
    }
  };

  const acceptAttr = [...ACCEPTED_IMG, ...ACCEPTED_VID].join(",");

  return (
    <div className="space-y-4">
      {/* Dropzone grande y obvia */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={[
          "w-full rounded-2xl border-2 border-dashed transition p-6 md:p-8 text-center",
          dragOver
            ? "border-[var(--rose)] bg-[var(--rose)]/5"
            : "border-[var(--rose)]/60 bg-white hover:bg-[var(--rose)]/5",
        ].join(" ")}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl p-3 bg-[var(--rose)] text-white shadow">
            <Upload className="h-6 w-6" />
          </div>
          <div className="text-[var(--charcoal)] font-medium">
            Arrastra aquí tu archivo o <span className="text-[var(--rose)] underline">haz click para seleccionar</span>
          </div>
          <div className="text-xs text-neutral-500">
            Fotos (JPG/PNG/WEBP/GIF) · Videos (MP4/WEBM/MOV) · Máx {MAX_MB} MB
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            onChange={onFileInput}
            className="hidden"
            id="testimonials-file"
          />
          <label
            htmlFor="testimonials-file"
            className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-xl bg-[var(--rose)] text-white font-semibold cursor-pointer hover:opacity-90"
          >
            Seleccionar archivo
          </label>

          {/* Vista del archivo seleccionado */}
          {file && (
            <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-white border border-[var(--rose)]/40 px-3 py-2">
              <div className="rounded-lg bg-[var(--rose)]/10 p-2">
                {ACCEPTED_IMG.includes(file.type as (typeof ACCEPTED_IMG)[number]) ? (
                  <ImgIcon className="h-5 w-5" />
                ) : (
                  <Video className="h-5 w-5" />
                )}
              </div>
              <div className="text-sm max-w-[60vw] truncate">{file.name}</div>
              <button
                type="button"
                onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="ml-2 p-1 rounded-md hover:bg-neutral-100"
                aria-label="Quitar archivo"
                title="Quitar archivo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Caption + botón enviar */}
      <textarea
        className="w-full p-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
        placeholder="Escribe una descripción (sin ofensas, por favor)"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        maxLength={300}
        rows={3}
      />
      <button
        onClick={onUpload}
        disabled={busy || !file}
        className="w-full py-3 rounded-xl bg-[var(--rose)] text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? "Subiendo…" : "Publicar testimonio"}
      </button>

      <p className="text-xs text-neutral-500">
        Evita lenguaje ofensivo. Publicaciones con ofensas se rechazan automáticamente.
      </p>
    </div>
  );
}