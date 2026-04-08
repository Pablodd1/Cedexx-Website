import logoWhite from '../assets/logo-final-white.png';
import logoBlue from '../assets/logo-final-blue.png';

export function Logo({ 
  className = "h-16", 
  variant = "white",
  mode = "image"
}: { 
  className?: string, 
  variant?: "white" | "blue",
  mode?: "image" | "text"
}) {
  if (mode === "text") {
    const colorClass = variant === "white" ? "text-white" : "text-[#050249]";
    return (
      <span className={`font-montserrat font-[900] italic uppercase tracking-tighter block ${colorClass} ${className}`}>
        CEDEXX
      </span>
    );
  }

  const imgSrc = variant === "white" ? logoWhite : logoBlue;
  return (
    <img 
      src={imgSrc} 
      alt="Cedexx" 
      className={`object-contain transition-transform group-hover:scale-105 ${className}`}
    />
  );
}


