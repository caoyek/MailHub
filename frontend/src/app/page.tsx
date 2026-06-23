"use client";

import { useState, useCallback } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import DataBelt from "@/components/landing/DataBelt";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
import InkSplash from "@/components/landing/InkSplash";
import { InkDropEffect } from "@/components/landing/VisualEffects";

export default function Home() {
  const [inkDrops, setInkDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const drop = { id: Date.now(), x: e.clientX, y: e.clientY };
    setInkDrops(prev => [...prev, drop]);
  }, []);

  const removeDrop = useCallback((id: number) => {
    setInkDrops(prev => prev.filter(d => d.id !== id));
  }, []);

  return (
    <main 
      className="min-h-screen bg-[#F8F5F0] cursor-default selection:bg-[#C41E3A]/30"
      onClick={handleClick}
    >
      {/* 鼠标移动泼墨效果 */}
      <InkSplash />

      {/* 点击水墨扩散效果 */}
      {inkDrops.map(drop => (
        <InkDropEffect
          key={drop.id}
          x={drop.x}
          y={drop.y}
          onComplete={() => removeDrop(drop.id)}
        />
      ))}

      {/* 宣纸纹理 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("https://www.transparenttextures.com/patterns/p6.png")`,
          zIndex: 0,
        }}
      />

      {/* 主内容 */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <Hero />
        <DataBelt />
        <HowItWorks />
        <Features />
        <Footer />
      </div>

      {/* 侧边装饰文字 */}
      <div className="fixed left-4 md:left-8 bottom-24 hidden xl:block opacity-30 vertical-text font-calligraphy-xingcao text-xl text-[#999] pointer-events-none tracking-[1.2em]">
        笔墨本无情 · 意在笔先 · 气韵生动
      </div>
    </main>
  );
}
