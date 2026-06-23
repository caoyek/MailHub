"use client";

import { useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════
   连续笔触效果 — 毛笔划过纸面，墨迹自然消散
   
   核心思路：
   · 每次 mousemove 都记录轨迹点（无间隔）
   · 用贝塞尔曲线连接相邻点形成连续笔触
   · 线宽与速度成反比（慢=粗，快=细）
   · 每个点根据自身年龄独立淡出
   ═══════════════════════════════════════════════ */

interface TrailPoint {
  x: number;
  y: number;
  width: number;
  born: number;
}

const FADE_MS = 800; // 每个点 0.8 秒后完全消失

export default function InkSplash() {
  const cvsRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<TrailPoint[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, speed: 0, hasMoved: false });
  const rafRef = useRef(0);

  /* ─── 根据速度计算线宽 ─── */
  const calcWidth = (speed: number) => {
    if (speed < 3) return 14 + Math.random() * 3;
    if (speed < 10) return 8 + Math.random() * 4;
    if (speed < 25) return 4 + Math.random() * 3;
    return 2 + Math.random() * 1.5;
  };

  /* ─── 鼠标移动处理 — 每次移动都记录 ─── */
  const onMove = useCallback((e: MouseEvent) => {
    const m = mouseRef.current;
    m.px = m.x;
    m.py = m.y;
    m.x = e.clientX;
    m.y = e.clientY;

    // 首次移动时初始化位置
    if (!m.hasMoved) {
      m.hasMoved = true;
      return;
    }

    const dx = m.x - m.px;
    const dy = m.y - m.py;
    m.speed = Math.sqrt(dx * dx + dy * dy);

    // 只要有移动就记录（不限制间隔）
    if (m.speed < 0.5) return;

    const now = performance.now();
    trailRef.current.push({
      x: m.x,
      y: m.y,
      width: calcWidth(m.speed),
      born: now,
    });
  }, []);

  useEffect(() => {
    const cvs = cvsRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = window.innerWidth + "px";
      cvs.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      const now = performance.now();
      const trail = trailRef.current;

      // 移除已过期的点
      while (trail.length > 0 && now - trail[0].born > FADE_MS) {
        trail.shift();
      }

      if (trail.length < 2) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 逐段绘制，每段根据自身年龄计算透明度
      for (let i = 1; i < trail.length; i++) {
        const prev = trail[i - 1];
        const curr = trail[i];

        // 用两个端点的平均年龄计算透明度
        const avgAge = ((now - prev.born) + (now - curr.born)) / 2;
        const lifeRatio = Math.min(avgAge / FADE_MS, 1);
        const opacity = (1 - lifeRatio) * 0.6;

        if (opacity <= 0.01) continue;

        const avgWidth = (prev.width + curr.width) / 2;

        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);

        // 使用贝塞尔曲线平滑连接
        if (i < trail.length - 1) {
          const next = trail[i + 1];
          const cpX = (curr.x + next.x) / 2;
          const cpY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(curr.x, curr.y, cpX, cpY);
        } else {
          ctx.lineTo(curr.x, curr.y);
        }

        // 墨色
        ctx.strokeStyle = `rgba(10, 10, 10, ${opacity})`;
        ctx.lineWidth = avgWidth;
        ctx.stroke();
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [onMove]);

  return (
    <canvas
      ref={cvsRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
    />
  );
}
