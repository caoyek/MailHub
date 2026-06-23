"use client";

import { useState, useEffect } from "react";

/* ═══════════════════════════════════════════════
   水墨视觉核心组件
   
   · InkSplashSVG — SVG 墨迹装饰
   · BrushStroke — 毛笔笔触分隔线
   · Seal — 印章组件
   · InkDropEffect — 点击水墨扩散效果
   ═══════════════════════════════════════════════ */

/* ─── SVG 墨迹装饰 ─── */
export const InkSplashSVG = ({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 200 200" className={className} style={style}>
    <defs>
      <filter id="inkBlur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
      </filter>
    </defs>
    <path
      d="M100,40 C150,30 180,60 170,100 C190,140 150,180 100,170 C50,190 20,150 30,110 C10,70 50,30 100,40"
      fill="currentColor"
      filter="url(#inkBlur)"
      opacity="0.5"
    />
  </svg>
);

/* ─── 毛笔笔触分隔线 ─── */
export const BrushStroke = ({ width = 200, height = 12, className = "" }: { width?: number; height?: number; className?: string }) => (
  <svg viewBox={`0 0 ${width} ${height}`} className={className} style={{ width, height }}>
    <defs>
      <filter id="brushTexture">
        <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="4" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
      </filter>
    </defs>
    <path
      d={`M4,${height / 2} C${width * 0.3},${height * 0.05} ${width * 0.6},${height * 0.95} ${width - 4},${height / 2}`}
      stroke="currentColor"
      strokeWidth={height * 0.5}
      fill="none"
      strokeLinecap="round"
      filter="url(#brushTexture)"
    />
  </svg>
);

/* ─── 印章组件 ─── */
export const Seal = ({ 
  text, 
  variant = "square", 
  size = 60, 
  className = "" 
}: { 
  text: string; 
  variant?: "square" | "round"; 
  size?: number; 
  className?: string;
}) => (
  <div
    className={`flex items-center justify-center p-1 select-none shadow-lg transition-all duration-500 hover:rotate-0 ${className}`}
    style={{
      width: size,
      height: size,
      backgroundColor: "#C41E3A",
      borderRadius: variant === "square" ? "1px" : "50%",
      boxShadow: "inset 0 0 15px rgba(0,0,0,0.3)",
      transform: `rotate(${Math.random() * 6 - 3}deg)`,
    }}
  >
    <span
      className="text-white leading-none text-center font-bold"
      style={{
        fontSize: size * 0.38,
        writingMode: "vertical-rl",
        textOrientation: "upright",
        fontFamily: '"ZCOOL KuaiLe", cursive',
        filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))",
      }}
    >
      {text}
    </span>
  </div>
);

/* ─── 点击水墨扩散效果 ─── */
interface InkDropEffectProps {
  x: number;
  y: number;
  onComplete: () => void;
}

export const InkDropEffect = ({ x, y, onComplete }: InkDropEffectProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const timer = setTimeout(onComplete, 1400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: x - 60,
        top: y - 60,
        width: 120,
        height: 120,
        background: "radial-gradient(circle, rgba(26,26,26,0.4) 0%, transparent 75%)",
        transform: active ? "scale(4)" : "scale(0.1)",
        opacity: active ? 0 : 0.7,
        transition: "transform 1.2s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out",
        filter: "blur(8px)",
      }}
    />
  );
};

/* ─── 竖排文字 ─── */
export const VerticalText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`vertical-text ${className}`}>
    {children}
  </div>
);
