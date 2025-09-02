"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Heart, Flag } from "lucide-react";

function getOrCreateAnonId() {
  if (typeof window === "undefined") return "server";
  const KEY = "anon-id";
  let v = localStorage.getItem(KEY);
  if (!v) {
    v = crypto.randomUUID();
    localStorage.setItem(KEY, v);
  }
  return v;
}

const BAD = ["groseria1", "groseria2", "insulto1"];

function cleanOk(text: string) {
  const t = (text || "").toLowerCase();
  return !BAD.some((w) => t.includes(w));
}

type Post = {
  id: string;
  kind: "image" | "video";
  storage_path: string;
  caption: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
};

export default function TestimonialsFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const anonId = useMemo(() => getOrCreateAnonId(), []);
  const likeBusy = useRef<Record<string, boolean>>({});

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, kind, storage_path, caption, like_count, comment_count, created_at"
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    setLoading(false);
    if (!error && data) setPosts(data as Post[]);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = async (postId: string) => {
    if (likeBusy.current[postId]) return;
    likeBusy.current[postId] = true;
    try {
      const { data: mine } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("anon_id", anonId)
        .limit(1);

      if (mine && mine.length) {
        await supabase.from("post_likes").delete().eq("id", mine[0].id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, anon_id: anonId });
      }

      const { data: post } = await supabase
        .from("posts")
        .select(
          "id, like_count, comment_count, kind, storage_path, caption, created_at"
        )
        .eq("id", postId)
        .single();

      if (post) setPosts((arr) => arr.map((p) => (p.id === postId ? (post as Post) : p)));
    } finally {
      likeBusy.current[postId] = false;
    }
  };

  const reportPost = async (postId: string) => {
    const reason = typeof window !== "undefined" ? window.prompt("¿Motivo del reporte?") : "";
    if (!reason) return;
    await supabase.from("post_reports").insert({ post_id: postId, anon_id: anonId, reason });
    if (typeof window !== "undefined") window.alert("Gracias. Revisaremos este contenido.");
  };

  const mediaUrl = (path: string) =>
    supabase.storage.from("bymariana").getPublicUrl(path).data.publicUrl;

  if (loading) return <div className="py-8 text-center">Cargando testimonios…</div>;

  return (
    <div className="space-y-6">
      {posts.map((p) => (
        <article key={p.id} className="rounded-2xl border bg-white overflow-hidden">
          <div className="relative w-full h-[520px] bg-[var(--cream)]">
            {p.kind === "image" ? (
              <Image
                src={mediaUrl(p.storage_path)}
                alt={p.caption ?? "Testimonio"}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, (max-width:1200px) 100vw, 1200px"
                priority={false}
              />
            ) : (
              <video className="w-full h-full object-cover" controls playsInline preload="metadata">
                <source src={mediaUrl(p.storage_path)} />
              </video>
            )}
          </div>

          <div className="p-4">
            {p.caption && <p className="mb-3 text-sm">{p.caption}</p>}

            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleLike(p.id)}
                className="px-3 py-2 rounded-full bg-[var(--gold)]/20 hover:bg-[var(--gold)]/30 flex items-center gap-2"
              >
                <Heart className="h-5 w-5" />
                <span className="text-sm">{p.like_count}</span>
              </button>

              <button
                onClick={() => reportPost(p.id)}
                className="px-3 py-2 rounded-full bg-red-100 hover:bg-red-200 flex items-center gap-2 text-red-700"
                title="Reportar contenido"
              >
                <Flag className="h-5 w-5" />
                <span className="text-sm">Reportar</span>
              </button>
            </div>

            <Comments postId={p.id} count={p.comment_count} onNew={fetchPosts} />
          </div>
        </article>
      ))}
    </div>
  );
}

function Comments({
  postId,
  count,
  onNew,
}: {
  postId: string;
  count: number;
  onNew: () => void;
}) {
  const [items, setItems] = useState<{ id: number; body: string; created_at: string }[]>([]);
  const [input, setInput] = useState("");
  const anonId = useMemo(() => getOrCreateAnonId(), []);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("id, body, created_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(50);
    setItems(data ?? []);
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!input.trim()) return;
    if (!cleanOk(input)) {
      if (typeof window !== "undefined") window.alert("Evita lenguaje ofensivo.");
      return;
    }
    const { error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, anon_id: anonId, body: input.trim() });
    if (!error) {
      setInput("");
      await load();
      onNew();
    } else if (typeof window !== "undefined") {
      window.alert(error.message);
    }
  };

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold mb-2">Comentarios ({count})</h4>
      <div className="space-y-2 mb-3 max-h-48 overflow-auto pr-1">
        {items.map((c) => (
          <div key={c.id} className="text-sm p-2 bg-neutral-50 rounded-lg">
            {c.body}
          </div>
        ))}
        {!items.length && (
          <div className="text-xs text-neutral-500">Sé el primero en comentar.</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 text-sm"
          placeholder="Escribe un comentario respetuoso"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={240}
        />
        <button onClick={send} className="px-3 py-2 rounded-lg bg-[var(--gold)] text-black">
          Enviar
        </button>
      </div>
    </div>
  );
}
