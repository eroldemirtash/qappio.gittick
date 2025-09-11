import { NextRequest, NextResponse } from "next/server";

function withCors(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get("url");
    if (!target) {
      return withCors(NextResponse.json({ error: "Missing url" }, { status: 400 }));
    }

    const resp = await fetch(target, { redirect: "follow" });
    if (!resp.ok) {
      return withCors(NextResponse.json({ error: `Upstream HTTP ${resp.status}` }, { status: 502 }));
    }
    const html = await resp.text();

    // Simple meta tag extraction
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i);
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i);

    const image = ogMatch?.[1] || twMatch?.[1] || null;
    return withCors(NextResponse.json({ image }));
  } catch (err: any) {
    return withCors(NextResponse.json({ error: err?.message || "parse_failed" }, { status: 500 }));
  }
}



