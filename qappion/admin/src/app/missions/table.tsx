"use client";

import * as React from "react";

// Mini fetch yardımcıları (bağımsız çalışsın diye buraya koydum)
async function jget<T = any>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
async function jpatch<T = any>(url: string, body: any): Promise<T> {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

type Row = {
  id: string;
  title: string;
  published: boolean;
  is_qappio_of_week: boolean;
  cover_url?: string | null;
  brand?: { name?: string | null; brand_profiles?: { avatar_url?: string | null } | null } | null;
};

export default function MissionsTable() {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [q, setQ] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "on" | "off">("all");
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await jget<{ items: Row[] }>("/api/missions");
        setRows(data.items ?? []);
      } catch (e: any) {
        setErr(e?.message || "Liste yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = rows
    .filter((r) => r.title.toLowerCase().includes(q.toLowerCase()))
    .filter((r) => (status === "all" ? true : status === "on" ? r.published : !r.published));

  async function toggle(id: string, field: "published" | "is_qappio_of_week", curr: boolean) {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: !curr } : r)));
    try {
      await jpatch(`/api/missions/${id}`, { [field]: !curr });
    } catch {
      setRows(prev);
      alert("Kaydedilemedi");
    }
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          className="h-10 w-64 px-3 rounded-xl border border-slate-200 bg-white"
          placeholder="Görev ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="h-10 w-48 px-3 rounded-xl border border-slate-200 bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">Tümü</option>
          <option value="on">Yayında</option>
          <option value="off">Taslak</option>
        </select>
      </div>

      {loading && <div className="card p-6">Yükleniyor…</div>}
      {err && <div className="card p-6 text-red-600">Hata: {err}</div>}
      {!loading && !err && filtered.length === 0 && <div className="card p-6">Henüz görev yok.</div>}

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {m.cover_url ? (
                <img src={m.cover_url} className="h-16 w-28 rounded-xl object-cover" alt="" />
              ) : (
                <div className="h-16 w-28 rounded-xl bg-slate-200" />
              )}
              <div>
                <div className="font-semibold">{m.title}</div>
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  {m.brand?.brand_profiles?.avatar_url ? (
                    <img
                      src={m.brand.brand_profiles.avatar_url}
                      className="h-5 w-5 rounded-full"
                      alt=""
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-slate-200" />
                  )}
                  <span>{m.brand?.name ?? "—"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggle(m.id, "published", m.published)}
                className={`px-3 py-1.5 rounded-xl text-sm ${
                  m.published ? "bg-slate-200" : "bg-green-600 text-white"
                }`}
              >
                {m.published ? "Yayından Al" : "Yayınla"}
              </button>
              <button
                onClick={() => toggle(m.id, "is_qappio_of_week", m.is_qappio_of_week)}
                className={`px-3 py-1.5 rounded-xl text-sm ${
                  m.is_qappio_of_week ? "bg-slate-200" : "bg-indigo-600 text-white"
                }`}
              >
                Haftanın Qappio'su
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}