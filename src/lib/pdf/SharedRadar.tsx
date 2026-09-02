import React from 'react';
import { Svg, Polygon, Line, Circle, Text as SvgText } from '@react-pdf/renderer';

export interface SharedRadarBlock {
  label: string;
  score: number; // 0..1
}

export interface SharedRadarColors {
  accent: string;
  panel: string;
  lineSoft: string;
  ink: string;
  muted: string;
}

export interface SharedRadarProps {
  blocks: SharedRadarBlock[];
  size?: number;
  colors: SharedRadarColors;
  masteryColor: (score: number) => string;
  showPercent?: boolean;
}

export function SharedRadar({
  blocks,
  size = 240,
  colors,
  masteryColor,
  showPercent = true,
}: SharedRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = 80;
  const levels = [0.25, 0.5, 0.75, 1];
  const angleStep = (Math.PI * 2) / blocks.length;

  const points = blocks.map((b, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    return {
      x: cx + Math.cos(angle) * radius * b.score,
      y: cy + Math.sin(angle) * radius * b.score,
      angle,
      block: b,
    };
  });

  const labelPoints = blocks.map((_, i) => {
    const angle = -Math.PI / 2 + i * angleStep;
    const labelR = radius + 18;
    return {
      x: cx + Math.cos(angle) * labelR,
      y: cy + Math.sin(angle) * labelR,
      angle,
    };
  });

  const gridPolygons = levels.map((lvl) =>
    blocks
      .map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return `${cx + Math.cos(angle) * radius * lvl},${cy + Math.sin(angle) * radius * lvl}`;
      })
      .join(' ')
  );

  const dataPolygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size + 30}>
      {gridPolygons.map((poly, i) => (
        <Polygon
          key={`grid-${i}`}
          points={poly}
          fill="none"
          stroke={colors.lineSoft}
          strokeWidth={0.5}
        />
      ))}
      {blocks.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep;
        return (
          <Line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(angle) * radius}
            y2={cy + Math.sin(angle) * radius}
            stroke={colors.lineSoft}
            strokeWidth={0.5}
          />
        );
      })}
      <Polygon
        points={dataPolygon}
        fill={colors.accent}
        fillOpacity={0.12}
        stroke={colors.accent}
        strokeWidth={1.2}
      />
      {points.map((p, i) => (
        <Circle
          key={`pt-${i}`}
          cx={p.x}
          cy={p.y}
          r={4}
          fill={masteryColor(p.block.score)}
          stroke={colors.panel}
          strokeWidth={1.2}
        />
      ))}
      {labelPoints.map((lp, i) => (
        <SvgText
          key={`lbl-${i}`}
          x={lp.x}
          y={lp.y}
          style={{ fontSize: 7.5, fill: colors.muted }}
          textAnchor="middle"
        >
          {blocks[i].label}
        </SvgText>
      ))}
      {showPercent &&
        points.map((p, i) => {
          const pct = Math.round(p.block.score * 100);
          const offX = Math.cos(p.angle) * 11;
          const offY = Math.sin(p.angle) * 11;
          return (
            <SvgText
              key={`pct-${i}`}
              x={p.x + offX}
              y={p.y + offY + 2}
              style={{ fontSize: 6.5, fill: colors.ink, fontFamily: 'Helvetica-Bold' }}
              textAnchor="middle"
            >
              {`${pct}%`}
            </SvgText>
          );
        })}
    </Svg>
  );
}
