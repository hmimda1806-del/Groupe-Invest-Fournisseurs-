import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { run } from "@/lib/db";
export async function POST() { const jar=await cookies(); const token=jar.get("supplier_session")?.value; if(token) run("DELETE FROM sessions WHERE token=?",token); const res=NextResponse.json({ok:true}); res.cookies.delete("supplier_session"); return res; }
