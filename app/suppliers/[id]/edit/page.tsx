"use client";
import { useEffect,useState } from "react";
import { SupplierForm } from "@/components/suppliers/supplier-form";
export default function EditSupplier({params}:{params:Promise<{id:string}>}){const[id,setId]=useState("");useEffect(()=>{params.then(p=>setId(p.id))},[params]);return id?<SupplierForm supplierId={id}/>:<div>Loading…</div>;}
