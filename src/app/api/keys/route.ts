import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-32-char-key-not-for-prod!";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const keys = await req.json();

    const operations = Object.entries(keys).map(([provider, key]) => {
      if (!key) return;
      return prisma.apiKey.upsert({
        where: { userId_provider: { userId: session.id, provider } },
        update: { keyValue: encrypt(key as string) },
        create: { userId: session.id, provider, keyValue: encrypt(key as string) },
      });
    });

    await Promise.all(operations.filter(Boolean));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
