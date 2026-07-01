import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get("url");

    if (!target) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const imageRes = await fetch(target);
    if (!imageRes.ok) {
      return NextResponse.json({ error: `Upstream returned ${imageRes.status}` }, { status: imageRes.status });
    }

    const contentType = imageRes.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imageRes.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("[PROXY_IMAGE_ERROR]", error);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
