'use client';

import React from 'react';
import { getContrastColor } from '@/lib/contrast-guard';
import { cn } from '@/lib/utils';
import { HTMLMotionProps, motion } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  bgColor?: string;
  children: React.ReactNode;
  delay?: number;
}

export function GlassCard({ bgColor = 'rgba(30, 30, 30, 0.6)', children, className, delay = 0, ...props }: GlassCardProps) {
  // Extract hex from rgba if possible, or just use a default heuristic.
  // For simplicity, if it's a solid hex, we use contrast guard.
  const textColor = bgColor.startsWith('#') ? getContrastColor(bgColor) : '#F0F0F0';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'glass-card p-6 relative overflow-hidden',
        className
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
      {...props}
    >
      {/* Subtle gradient overlay for extra depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
