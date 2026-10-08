"use client";

import { type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";

const spring = { stiffness: 100, damping: 20 };

export function MagneticLink({ href, children, light = false }: { href: string; children: ReactNode; light?: boolean }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  return <motion.a href={href} style={{ x: sx, y: sy }} whileTap={reduced ? undefined : { scale: .98 }}
    onPointerMove={event => {
      if (reduced || event.pointerType !== "mouse") return;
      const rect = event.currentTarget.getBoundingClientRect();
      x.set((event.clientX - rect.left - rect.width / 2) * .06);
      y.set((event.clientY - rect.top - rect.height / 2) * .1);
    }} onPointerLeave={() => { x.set(0); y.set(0); }}
    className={`taste:inline-flex taste:min-h-13 taste:items-center taste:justify-between taste:gap-9 taste:rounded-full taste:px-6 taste:py-3 taste:text-[13px] taste:font-medium ${light ? "taste:bg-paper taste:text-ink taste:hover:bg-wash" : "taste:bg-ink taste:text-white taste:hover:bg-accent"}`}>
    {children}<ArrowTopRightIcon width={18} height={18} aria-hidden="true" />
  </motion.a>;
}

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  return <motion.div initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }}
    animate={reduced ? undefined : { opacity: [0.6, 1], y: [12, 0] }} transition={{ type: "spring", ...spring, delay }} className={className}>{children}</motion.div>;
}

