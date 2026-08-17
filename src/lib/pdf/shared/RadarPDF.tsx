import { Svg, Polygon, Line, Circle, Text as SvgText, G } from '@react-pdf/renderer';
import { COLORS } from './theme';

interface RadarPDFProps {
  scores: {
    bloc1: number;
    bloc2: number;
    bloc3: number;
    bloc4: number;
    bloc5: number;
    bloc6: number;
  };
  size?: number;
}

const LABELS = [
  { key: 'bloc1', short: 'Sing./Pluriel' },
  { key: 'bloc2', short: 'Conjugaison' },
  { key: 'bloc3', short: 'Part. passé' },
  { key: 'bloc4', short: 'Lexical' },
  { key: 'bloc5', short: 'Syntaxe' },
  { key: 'bloc6', short: 'Compréhension' },
] as const;

export default function RadarPDF({ scores, size = 320 }: RadarPDFProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.32;
  const labelRadius = radius * 1.32;

  const axes = LABELS.map((label, i) => {
    const angle = -Math.PI / 2 + (i * (2 * Math.PI)) / 6;
    return {
      ...label,
      angle,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      labelX: cx + Math.cos(angle) * labelRadius,
      labelY: cy + Math.sin(angle) * labelRadius,
      value: scores[label.key as keyof typeof scores],
    };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const dataPoints = axes
    .map((a) => {
      const r = radius * a.value;
      return `${cx + Math.cos(a.angle) * r},${cy + Math.sin(a.angle) * r}`;
    })
    .join(' ');

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => {
        const points = axes
          .map((a) => {
            const r = radius * level;
            return `${cx + Math.cos(a.angle) * r},${cy + Math.sin(a.angle) * r}`;
          })
          .join(' ');
        return (
          <Polygon
            key={level}
            points={points}
            fill="none"
            stroke={COLORS.line}
            strokeWidth={level === 1 ? 1 : 0.5}
          />
        );
      })}

      {axes.map((a, i) => (
        <Line
          key={i}
          x1={cx}
          y1={cy}
          x2={a.x}
          y2={a.y}
          stroke={COLORS.line}
          strokeWidth={0.5}
        />
      ))}

      <Polygon
        points={dataPoints}
        fill={COLORS.accent}
        fillOpacity={0.15}
        stroke={COLORS.accent}
        strokeWidth={1.5}
      />

      {axes.map((a, i) => {
        const r = radius * a.value;
        const x = cx + Math.cos(a.angle) * r;
        const y = cy + Math.sin(a.angle) * r;
        return (
          <G key={i}>
            <Circle cx={x} cy={y} r={4} fill={COLORS.white} stroke={COLORS.accent} strokeWidth={1.5} />
            <Circle cx={x} cy={y} r={2} fill={COLORS.accent} />
          </G>
        );
      })}

      {axes.map((a, i) => {
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (a.labelX < cx - 3) textAnchor = 'end';
        else if (a.labelX > cx + 3) textAnchor = 'start';
        return (
          <G key={`lbl-${i}`}>
            <SvgText
              x={a.labelX}
              y={a.labelY}
              textAnchor={textAnchor}
              style={{ fontSize: 8, fill: COLORS.ink, fontFamily: 'Helvetica-Bold' }}
            >
              {a.short}
            </SvgText>
            <SvgText
              x={a.labelX}
              y={a.labelY + 10}
              textAnchor={textAnchor}
              style={{ fontSize: 7, fill: COLORS.muted, fontFamily: 'Times-Italic' }}
            >
              {`${(a.value * 8).toFixed(1).replace('.0', '')}/8`}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}
