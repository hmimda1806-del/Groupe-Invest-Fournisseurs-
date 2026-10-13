import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Supplier Management System",description:"Supplier directory and purchasing workspace"};
export default function RootLayout({children}:{children:ReactNode}){return <html lang="en"><body>{children}</body></html>;}
