import { NextResponse } from "next/server";
import { row } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await row<{id:string;name:string;email:string;role:string;status:string;password_hash:string}>("SELECT * FROM users WHERE email=?", String(email ?? "").trim().toLowerCase());
  if (!user || user.status !== "Active" || !verifyPassword(String(password ?? ""), user.password_hash)) return NextResponse.json({error:"Email or password is incorrect."},{status:401});
  const session = await createSession(user.id); const res = NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  res.cookies.set("supplier_session",session.token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV === "production",expires:new Date(session.expires),path:"/"}); return res;
}
