"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@cloud/ui";
import { ThemeControls } from "./ThemeControls";
import styles from "./DesignLabHeader.module.css";
const items=[{label:"UI",href:"/ui/foundation/variables/semantic/background",match:"/ui"},{label:"UX",href:"/ux/patterns",match:"/ux"},{label:"Backlog",href:"/backlog",match:"/backlog"},{label:"Docs",href:"/docs/product/overview",match:"/docs"}];
export function DesignLabHeader(){const pathname=usePathname();return <header className={styles.header}><Link className={styles.logo} href="/ui/foundation/variables/semantic/background"><Logo/></Link><nav aria-label="Рабочие области">{items.map(item=><Link key={item.href} href={item.href} className={pathname.startsWith(item.match)?styles.active:undefined}>{item.label}</Link>)}</nav><ThemeControls/></header>;}
