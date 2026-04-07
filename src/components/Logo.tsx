import React from 'react';

export function Logo({ 
  className = "h-16", 
  variant = "white",
  mode = "text"
}: { 
  className?: string, 
  variant?: "white" | "blue",
  mode?: "image" | "text"
}) {
  const colorClass = variant === "white" ? "text-white" : "text-[#050249]";
  return (
    <span className={`font-montserrat font-[900] italic uppercase tracking-tighter block ${colorClass} ${className}`}>
      CEDEXX
    </span>
  );
}
