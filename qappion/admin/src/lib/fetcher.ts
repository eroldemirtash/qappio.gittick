export async function jget<T=any>(url: string, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: "no-store", ...init });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
export async function jpost<T=any>(url: string, body: any, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), ...init });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
export async function jpatch<T=any>(url: string, body: any, init?: RequestInit): Promise<T> {
  const r = await fetch(url, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body), ...init });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}