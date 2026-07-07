export function CircuitBackground() {
  return (
    <div className="hero-circuit-bg">
      <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {/* Chip package */}
        <rect x="320" y="140" width="160" height="120" rx="4" fill="none" stroke="#673AB7" strokeWidth="1.5" />
        <line x1="400" y1="150" x2="400" y2="250" stroke="#673AB7" strokeWidth="0.4" />
        <line x1="330" y1="200" x2="470" y2="200" stroke="#673AB7" strokeWidth="0.4" />
        <circle cx="400" cy="200" r="8" fill="none" stroke="#673AB7" strokeWidth="0.6" />
        <circle cx="330" cy="150" r="3" fill="#673AB7" />

        {/* Top/Bottom pins */}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={`tb-${i}`}>
            <line x1={335 + i * 18} y1="140" x2={335 + i * 18} y2={95 - i * 4} stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx={335 + i * 18} cy={95 - i * 4} r="2" fill="#00e5ff" />
            <line x1={335 + i * 18} y1="260" x2={335 + i * 18} y2={305 + i * 4} stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx={335 + i * 18} cy={305 + i * 4} r="2" fill="#00e5ff" />
          </g>
        ))}

        {/* Left/Right pins */}
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={`lr-${i}`}>
            <line x1="320" y1={155 + i * 18} x2={275 - i * 4} y2={155 + i * 18} stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx={275 - i * 4} cy={155 + i * 18} r="2" fill="#00e5ff" />
            <line x1="480" y1={155 + i * 18} x2={525 + i * 4} y2={155 + i * 18} stroke="#00e5ff" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx={525 + i * 4} cy={155 + i * 18} r="2" fill="#00e5ff" />
          </g>
        ))}

        {/* PCB traces */}
        {[
          'M 275 155 L 180 155 L 180 70 L 80 70',
          'M 275 173 L 160 173 L 160 110 L 50 110',
          'M 525 155 L 620 155 L 620 70 L 720 70',
          'M 525 173 L 640 173 L 640 110 L 750 110',
          'M 335 95 L 335 55 L 180 55',
          'M 418 95 L 418 35 L 620 35',
          'M 353 305 L 353 350 L 180 350',
          'M 436 305 L 436 370 L 650 370',
          'M 275 200 L 220 200 L 220 280 L 100 280',
          'M 525 200 L 580 200 L 580 280 L 700 280',
        ].map((d, i) => (
          <path key={`trace-${i}`} d={d} fill="none" stroke="#673AB7" strokeWidth="0.5" strokeLinecap="round" />
        ))}

        {/* End pads */}
        {[[80, 70], [50, 110], [720, 70], [750, 110], [100, 280], [700, 280]].map(([x, y], i) => (
          <rect key={`pad-${i}`} x={x - 3} y={y - 3} width="6" height="6" rx="1" fill="none" stroke="#00e5ff" strokeWidth="0.5" />
        ))}
      </svg>
    </div>
  );
}
