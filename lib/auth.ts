import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { row, run } from "@/lib/db";

export type User = { id: string; name: string; email: string; role: "Admin" | "Purchasing Department"; status: string };
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get("supplier_session")?.value;
  if (!token) return null;
  const session = row<{ user_id: string; expires_at: string }>("SELECT user_id,expires_at FROM sessions WHERE token=?", token);
  if (!session || session.expires_at < new Date().toISOString()) return null;
  return row<User>("SELECT id,name,email,role,status FROM users WHERE id=? AND status='Active'", session.user_id) ?? null;
}
export function verifyPassword(input: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  const candidate = scryptSync(input, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
}
export function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  run("INSERT INTO sessions(token,user_id,expires_at) VALUES(?,?,?)", token, userId, expires);
  return { token, expires };
}
