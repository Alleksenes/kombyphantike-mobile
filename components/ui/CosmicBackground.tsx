import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * THE COSMIC BACKGROUND — Obsidian Encore Palette
 *
 * SkSL Compliance Rules (hard-won lessons):
 *   - No #define macros. Use const declarations.
 *   - No non-const loop bounds. Loops are fully unrolled (5 octaves → 5 explicit steps).
 *   - All colors are vec3, not hex strings.
 *   - Shader is guarded: if Make() returns null, we fall back to a solid View.
 *
 * Palette:
 *   Obsidian Void  #0f0518  → vec3(0.059, 0.020, 0.094)
 *   Oxblood Ink    #3e0a15  → vec3(0.243, 0.039, 0.082)
 *   Deep Plum      #1a0b2e  → vec3(0.102, 0.043, 0.180)
 *   Liquid Gold    #C5A059  → vec3(0.773, 0.627, 0.349)
 */
const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

// ── Palette (Sacred Pigments) ─────────────────────────────────────────────────
const vec3 C_VOID = vec3(0.059, 0.020, 0.094);
const vec3 C_INK  = vec3(0.243, 0.039, 0.082);
const vec3 C_PLUM = vec3(0.102, 0.043, 0.180);
const vec3 C_GOLD = vec3(0.773, 0.627, 0.349);

// ── Value Noise ───────────────────────────────────────────────────────────────
float random(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x)
         + (c - a) * u.y * (1.0 - u.x)
         + (d - b) * u.x * u.y;
}

// ── FBM — 5 octaves, fully unrolled (no dynamic loop bound) ──────────────────
float fbm(vec2 st) {
    // Rotation matrix to reduce axial bias
    float ca = cos(0.5);
    float sa = sin(0.5);
    mat2 rot = mat2(ca, sa, -sa, ca);
    vec2 shift = vec2(100.0);

    float v = 0.0;
    float a = 0.5;

    // Octave 1
    v  += a * noise(st);
    st  = rot * st * 2.0 + shift;
    a  *= 0.5;

    // Octave 2
    v  += a * noise(st);
    st  = rot * st * 2.0 + shift;
    a  *= 0.5;

    // Octave 3
    v  += a * noise(st);
    st  = rot * st * 2.0 + shift;
    a  *= 0.5;

    // Octave 4
    v  += a * noise(st);
    st  = rot * st * 2.0 + shift;
    a  *= 0.5;

    // Octave 5
    v  += a * noise(st);

    return v;
}

// ── Main ──────────────────────────────────────────────────────────────────────
vec4 main(vec2 xy) {
    vec2 st = xy / resolution;
    st.x *= resolution.x / resolution.y;

    float t = time * 0.05;

    // Domain warping: two layers of warp
    vec2 q;
    q.x = fbm(st + 0.01 * t);
    q.y = fbm(st + vec2(1.0, 0.0));

    vec2 r;
    r.x = fbm(st + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = fbm(st + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t);

    float f = fbm(st + 4.0 * r);

    // ── Color mixing ──────────────────────────────────────────────────────────
    // Base: deep void blended toward oxblood on high warp
    vec3 color = mix(C_VOID, C_INK, clamp(f * f * 4.0, 0.0, 1.0));

    // Add plum warmth from intermediate warp magnitude
    color = mix(color, C_PLUM, clamp(length(q), 0.0, 1.0));

    // Sparse liquid-gold highlights: only where all warp channels converge
    float goldMask = smoothstep(0.8, 1.0, r.x * r.y * f);
    color = mix(color, C_GOLD, goldMask * 0.4);

    // Dithering: breaks up colour banding — "pigmented paper" texture
    float dither = (random(xy + time) - 0.5) * 0.03;
    color += dither;

    // Vignette: draws the eye to centre
    vec2 uv = xy / resolution;
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y) * 15.0;
    color *= mix(0.7, 1.0, pow(vig, 0.2));

    return vec4(color, 1.0);
}
`;

const CosmicBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(120, { duration: 120000, easing: Easing.linear }),
      -1,
      true, // reverse for seamless loop
    );
  }, [time]);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: time.value,
  }));

  // Guarded: Make() can return null if the SkSL fails to compile.
  // Fallback to solid void colour — never a red screen.
  const shader = useMemo(() => {
    if (Platform.OS === 'web') return null;
    try {
      const effect = Skia.RuntimeEffect.Make(COSMIC_SHADER);
      return effect ?? null;
    } catch {
      return null;
    }
  }, []);

  if (Platform.OS === 'web') {
    return <View style={styles.fallback} />;
  }

  if (!shader) {
    // Shader failed to compile — show the void colour so layout still works
    return <View style={styles.fallback} />;
  }

  return (
    <Canvas style={styles.canvas} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <Shader source={shader} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
};

export default CosmicBackground;

const styles = StyleSheet.create({
  canvas: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f0518',
    zIndex: -1,
  },
});
