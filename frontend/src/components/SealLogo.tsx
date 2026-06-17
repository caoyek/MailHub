/**
 * SealLogo.tsx - 印章 Logo 组件
 * 支持 variant: "dark"（默认，浅色背景用深色印章）/ "light"（深色背景用浅色印章）
 */

interface SealLogoProps {
  variant?: "dark" | "light";
  size?: number;
}

export default function SealLogo({ variant = "dark", size = 36 }: SealLogoProps) {
  const isLight = variant === "light";
  const bgColor = isLight ? "#C0392B" : "#C0392B";
  const textColor = "#FFFFFF";

  return (
    <div
      className="inline-flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 外框 */}
        <rect
          x="0.5"
          y="0.5"
          width="35"
          height="35"
          stroke={bgColor}
          strokeWidth="1.5"
          fill={bgColor}
        />
        {/* 内框（双线效果） */}
        <rect
          x="3.5"
          y="3.5"
          width="29"
          height="29"
          stroke={textColor}
          strokeWidth="0.8"
          fill="none"
        />
        {/* 文字 */}
        <text
          x="18"
          y="22"
          textAnchor="middle"
          fill={textColor}
          fontSize="15"
          fontFamily="Noto Serif SC, serif"
          fontWeight="700"
        >
          驿
        </text>
      </svg>
    </div>
  );
}
