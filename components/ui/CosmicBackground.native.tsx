// ── TACTILE VOID (NATIVE — Skia) ────
// Live compositing: chromatic blobs (RadialGradient + FractalNoise-driven drift)
// + hardware-accelerated grain (FractalNoise RuntimeShader) + vignette shield.
// Palette: ORRERY_PIGMENTS · Base: #0a0a0f · Grain: 0.07 Multiply · Vignette: 0.95

import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  FractalNoise,
  GaussianBlur,
  Group,
  RadialGradient,
  Rect,
  Skia,
} from '@shopify/react-native-skia';

// ── Constants ──

const { width: W, height: H } = Dimensions.get('window');
const BASE = '#0a0a0f';

// ── Frame loop ──

const frame = { v: 0 };
let rafId: number | null = null;

function startFrameLoop() {
  if (rafId !== null) return;
  const tick = () => {
    frame.v++;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function stopFrameLoop() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}

// ── Drift helper ──

function drift(
  seed: number,
  period = 20,
  amp = 60,
): { cx: number; cy: number } {
  const t = ((Date.now() / 1000 + seed) * 2 * Math.PI) / period;
  return {
    cx: W / 2 + Math.sin(t) * amp + Math.cos(t * 0.618) * amp * 0.4,
    cy: H / 2 + Math.cos(t) * amp + Math.sin(t * 1.318) * amp * 0.4,
  };
}

// ── Memoized drifters ──

function useDrift(seed: number, period = 20, amp = 60) {
  return useMemo(() => drift(seed, period, amp), [seed, period, amp, frame.v]);
}

// ── Component ──

export default function CosmicBackground({ children }: { children?: React.ReactNode }) {
  useEffect(startFrameLoop, []);
  useEffect(() => () => stopFrameLoop(), []);

  const blob0 = useDrift(0, 22, 80);
  const blob1 = useDrift(1, 17, 70);
  const blob2 = useDrift(2, 25, 75);
  const vignette = useDrift(99, 60, 20);

  return (
    <View style={styles.root}>
      <Canvas
        style={{ flex: 1 }}
        onRender={(canvas) => canvas.clear(Skia.Color(BASE))}
        pointerEvents="none"
      >
        {/* Blob 1: Electrum */}
        <Group>
          <Rect x={blob0.cx - 350} y={blob0.cy - 350} width={700} height={700}>
            <RadialGradient
              cx={blob0.cx}
              cy={blob0.cy}
              rx={350}
              ry={350}
              colors={['#DFCE9F', 'rgba(223,206,159,0.4)', 'transparent']}
              x1={0}
              y1={0}
              x2={700}
              y2={700}
            />
          </Rect>
        </Group>

        {/* Blob 2: Cinnabar */}
        <Group>
          <Rect x={blob1.cx - 300} y={blob1.cy - 300} width={600} height={600}>
            <RadialGradient
              cx={blob1.cx}
              cy={blob1.cy}
              rx={300}
              ry={300}
              colors={['#D5A096', 'rgba(213,160,150,0.3)', 'transparent']}
              x1={0}
              y1={0}
              x2={600}
              y2={600}
            />
          </Rect>
        </Group>

        {/* Blob 3: Murex Ash */}
        <Group>
          <Rect x={blob2.cx - 320} y={blob2.cy - 320} width={640} height={640}>
            <RadialGradient
              cx={blob2.cx}
              cy={blob2.cy}
              rx={320}
              ry={320}
              colors={['#B5A3C4', 'rgba(181,163,196,0.3)', 'transparent']}
              x1={0}
              y1={0}
              x2={640}
              y2={640}
            />
          </Rect>
        </Group>

        {/* Grain overlay */}
        <Rect x={0} y={0} width={W} height={H}>
          <FractalNoise
            baseFrequency={0.8}
            numOctaves={3}
            seed={42}
            x={0}
            y={0}
            width={W}
            height={H}
          />
        </Rect>

        {/* Vignette shield */}
        <Rect x={0} y={0} width={W} height={H}>
          <RadialGradient
            cx={vignette.cx}
            cy={vignette.cy}
            r={Math.max(W, H) * 0.6}
            colors={['transparent', 'rgba(10,10,15,0.3)', 'rgba(10,10,15,0.85)']}
            x1={0}
            y1={0}
            x2={W}
            y2={H}
          />
        </Rect>
      </Canvas>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  root: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  content: { flex: 1 },
});
