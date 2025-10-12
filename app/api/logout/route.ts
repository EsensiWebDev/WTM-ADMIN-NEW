import { bffFetch } from "@/lib/bff-client";
import { NextResponse } from "next/server";

export async function POST() {
  const response = await bffFetch("/logout", { method: "POST" });
  const text = await response.text();

  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    return NextResponse.json(payload ?? { message: "Failed to logout" }, {
      status: response.status,
    });
  }

  return NextResponse.json(
    payload ?? {
      status: 200,
      message: "Logout successfully",
      data: "",
    },
    { status: 200 }
  );
}
