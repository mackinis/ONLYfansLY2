
import type { SVGProps } from 'react';

export function AppLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-auto" // Adjust size as needed
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path d="M10 40 Q20 10 40 25 T70 40" stroke="url(#logoGradient)" strokeWidth="3" />
      <path d="M30 15 Q40 45 60 30 T90 15" stroke="url(#logoGradient)" strokeWidth="3" />
      <text
        x="80"
        y="37"
        fontFamily="Belleza, sans-serif"
        fontSize="30"
        fill="hsl(var(--foreground))"
        className="font-headline"
      >
        ONLYfansLY
      </text>
    </svg>
  );
}
