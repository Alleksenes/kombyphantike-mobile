import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

/**
 * The Cosmic Background.
 * Replaces the deprecated Atmosphere component.
 */
const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

// Palette (The Sacred Pigments)
// #0f0518 (Obsidian Void) -> vec3(15, 5, 24) / 255.0
const vec3 C_VOID   = vec3(0.059, 0.020, 0.094);
// #3e0a15 (Oxblood Ink) -> vec3(62, 10, 21) / 255.0
const vec3 C_INK    = vec3(0.243, 0.039, 0.082);
// #1a0b2e (Deep Plum) -> vec3(26, 11, 46) / 255.0
const vec3 C_PLUM   = vec3(0.102, 0.043, 0.180);
// #C5A059 (Liquid Gold) -> vec3(197, 160, 89) / 255.0
const vec3 C_GOLD   = vec3(0.773, 0.627, 0.349);

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

const int OCTAVES = 5;

float fbm(vec2 st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotate to reduce axial bias
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < OCTAVES; ++i) {
        v += a * noise(st);
        st = rot * st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 xy) {
    vec2 st = xy / resolution.xy;
    st.x *= resolution.x/resolution.y;

    // Geological Time Scale: Slow movement over 120s loop
    float t = time * 0.05;

    // Domain Warping Pattern
    vec2 q = vec2(0.0);
    q.x = fbm( st + 0.01*t );
    q.y = fbm( st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm( st + 4.0*q + vec2(1.7,9.2)+ 0.15*t );
    r.y = fbm( st + 4.0*q + vec2(8.3,2.8)+ 0.126*t);

    float f = fbm( st + 4.0*r );

    // Color Mixing
    // Start with Deep Void
    vec3 color = mix(C_VOID, C_INK, clamp((f*f)*4.0, 0.0, 1.0));

    // Mix in Deep Plum based on intermediate warp 'q'
    color = mix(color, C_PLUM, clamp(length(q), 0.0, 1.0));

    // Add Liquid Gold highlights sparingly
    // Use the final warp 'r' and high frequency details
    float goldMask = smoothstep(0.8, 1.0, r.x * r.y * f);
    color = mix(color, C_GOLD, goldMask * 0.4);

    // Dithering: High frequency noise to prevent banding
    // "Pigmented paper feel"
    float dither = (random(xy + time) - 0.5) * 0.03;
    color += dither;

    // Subtle Vignette for depth
    vec2 uv = xy / resolution.xy;
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
      true // Reverse for seamless flow
    );
  }, [time]);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: time.value,
  }));

  const shader = useMemo(() => {
    if (Platform.OS === 'web') return null;
    return Skia.RuntimeEffect.Make(COSMIC_SHADER);
  }, []);

  // Web Fallback
  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f0518' }]} />;
  }

  if (!shader) return null;

  return (
    <Canvas
      style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      pointerEvents="none"
    >
      <Rect x={0} y={0} width={width} height={height}>
        <Shader source={shader} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
};

export default CosmicBackground;
