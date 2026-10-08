"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Главная" },
  { href: "/landing", label: "Лендинг" },
  { href: "/iaas", label: "IaaS · h3llo cloud" },
  { href: "/iaas-taste", label: "IaaS · Taste Skill" },
  { href: "/brand", label: "Бренд" },
  { href: "/cells", label: "Ячейки" },
  { href: "/effects/", label: "Эффекты" },
];

export function SiteLogoMenu({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className="site-logo-menu" data-theme={dark ? "dark" : "light"} ref={containerRef}>
      <button
        className="site-header__logo"
        type="button"
        aria-label="Открыть меню разделов"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <img src="/_logo.svg" alt="h3llo cloud" />
      </button>
      {open && (
        <nav className="site-logo-menu__panel" aria-label="Разделы сайта">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
