export function GuillocheBackground() {
  // Generate wavy horizontal lines
  const generateWavePath = (y: number, amplitude: number, frequency: number, phase: number) => {
    const points = [];
    const width = 800;
    const steps = 100;
    
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * width;
      const wave = y + amplitude * Math.sin((x / width) * frequency * Math.PI * 2 + phase);
      points.push(`${i === 0 ? 'M' : 'L'} ${x},${wave}`);
    }
    
    return points.join(' ');
  };

  const lines = [];
  const lineSpacing = 8;
  const numLines = 50;
  
  for (let i = 0; i < numLines; i++) {
    const y = i * lineSpacing;
    // Alternate between different wave patterns for variety
    const amplitude = 20 + (i % 3) * 5;
    const frequency = 2 + (i % 2) * 0.5;
    const phase = (i * 0.3) % (Math.PI * 2);
    
    lines.push({
      path: generateWavePath(y, amplitude, frequency, phase),
      color: i % 2 === 0 ? 'text-purple-200' : 'text-pink-200',
    });
  }

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.3 }}
      preserveAspectRatio="none"
      viewBox="0 0 800 400"
    >
      <defs>
        <pattern
          id="guilloche-wave-pattern"
          x="0"
          y="0"
          width="800"
          height="400"
          patternUnits="userSpaceOnUse"
        >
          {lines.map((line, index) => (
            <path
              key={index}
              d={line.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
              strokeLinecap="round"
              className={line.color}
            />
          ))}
        </pattern>
      </defs>
      
      <rect width="100%" height="100%" fill="url(#guilloche-wave-pattern)" />
    </svg>
  );
}