import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { rows } from "@/lib/db";
export async function GET(){if(!await currentUser())return NextResponse.json({error:"Unauthorized"},{status:401});const[categories,wilayas]=await Promise.all([rows("SELECT c.*,count(s.id) supplier_count FROM categories c LEFT JOIN suppliers s ON s.category_id=c.id GROUP BY c.id ORDER BY c.name"),rows("SELECT w.*,count(s.id) supplier_count FROM wilayas w LEFT JOIN suppliers s ON s.wilaya_id=w.id GROUP BY w.id ORDER BY CAST(w.code AS INTEGER)")]);return NextResponse.json({categories,wilayas});}
