import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { row, rows, run, randomUUID, transaction } from "@/lib/db";

export const runtime = "nodejs";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  if (!await currentUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const supplier = await row<any>("SELECT s.*,c.name category_name,w.name wilaya_name FROM suppliers s LEFT JOIN categories c ON c.id=s.category_id LEFT JOIN wilayas w ON w.id=s.wilaya_id WHERE s.id=?", id);
  if (!supplier) return NextResponse.json({ error: "Not found" }, { status: 404 });
  supplier.products = await rows("SELECT * FROM supplier_products WHERE supplier_id=? ORDER BY created_at", id);
  return NextResponse.json({ supplier });
}

export async function PUT(req: Request, { params }: Ctx) {
  if (!await currentUser()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params, b = await req.json();
  if (!b.name?.trim() || !b.category_id || !b.wilaya_id) return NextResponse.json({ error: "Supplier name, category and Wilaya are required." }, { status: 400 });
  if (await row("SELECT id FROM suppliers WHERE lower(name)=lower(?) AND id<>?", b.name.trim(), id)) return NextResponse.json({ error: "A supplier with this name already exists." }, { status: 409 });
  const now = new Date().toISOString();
  await transaction(async query => {
    await query(`UPDATE suppliers SET name=?,legal_name=?,logo_url=?,description=?,supplier_type=?,category_id=?,contact_person=?,phone=?,mobile=?,email=?,wilaya_id=?,address=?,website=?,facebook=?,internal_notes=?,previously_dealt=?,status=?,updated_at=? WHERE id=?`,b.name.trim(),b.legal_name||"",b.logo_url||"",b.description||"",b.supplier_type||"Distributor",b.category_id,b.contact_person||"",b.phone||"",b.mobile||"",b.email||"",b.wilaya_id,b.address||"",b.website||"",b.facebook||"",b.internal_notes||"",b.previously_dealt?1:0,b.status||"Active",now,id);
    await query("DELETE FROM supplier_products WHERE supplier_id=?", id);
    for (const p of b.products || []) if (p.product_name?.trim()) await query("INSERT INTO supplier_products(id,supplier_id,product_name,category,description,created_at) VALUES(?,?,?,?,?,?)",randomUUID(),id,p.product_name.trim(),p.category||"",p.description||"",now);
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "Admin") return NextResponse.json({ error: "Only administrators can delete suppliers." }, { status: 403 });
  const { id } = await params;
  await run("DELETE FROM suppliers WHERE id=?", id);
  return NextResponse.json({ ok: true });
}
