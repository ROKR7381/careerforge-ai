import { prisma } from "./prisma";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-not-for-production"
);

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscriptionPlan: string;
  subscriptionStatus: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: SessionUser): Promise<string> {
  return new SignJWT({ sub: user.id, ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("careerforge_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function requirePremium(): Promise<SessionUser> {
  const session = await requireAuth();
  // Premium check disabled for testing — all users treated as premium
  return session;
}

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });
  return user;
}
