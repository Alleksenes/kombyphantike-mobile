import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const COSMIC_SHADER = `
uniform float2 u_resolution;
uniform float u_time;

// -- PALETTE (THEME: COSMIC PIGMENT) --
// Deep Void (Background)
const vec3 C_VOID     = vec3(0.06, 0.02, 0.10); 
// Oxblood / Crimson (The "Bruise")
const vec3 C_CRIMSON  = vec3(0.35, 0.04, 0.08); 
// Deep Violet / Ink
const vec3 C_INK      = vec3(0.18, 0.05, 0.28); 
// Faint Gold (Starlight/Dust)
const vec3 C_GOLD     = vec3(0.85, 0.70, 0.40); 

// -- UTILS --
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
const int OCTAVES = 5;
float fbm(vec2 st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    // Rotation matrix to reduce grid artifacts
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < OCTAVES; ++i) {
        v += a * noise(st);
        st = rot * st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 pos) {
    // Normalize coordinates
    vec2 st = pos / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Slow, geological time
    float t = u_time * 0.15;

    // -- DOMAIN WARPING (THE LIQUID EFFECT) --
    // We distort the coordinate space 'st' recursively.
    
    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.00 * t);
    q.y = fbm(st + vec2(1.0));

    vec2 r = vec2(0.0);
    r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);

    float f = fbm(st + r);

    // -- COLOR MIXING (THE PIGMENT) --
    // Base: Void mixed with Ink
    vec3 color = mix(C_VOID, C_INK, clamp((f*f)*4.0, 0.0, 1.0));

    // Mid: Crimson bleeds in based on the warped value 'q'
    color = mix(color, C_CRIMSON, clamp(length(q), 0.0, 1.0));

    // High: Gold dust at the peaks of the noise
    color = mix(color, C_GOLD, clamp(length(r.x), 0.0, 1.0) * 0.15); // Low opacity gold

    // -- POST-PROCESSING --
    // 1. Vignette (Darken corners)
    vec2 uv = pos / u_resolution.xy;
    float vig = uv.x * uv.y * 15.0 * (1.0 - uv.x) * (1.0 - uv.y);
    color *= pow(vig, 0.15); // Soft vignette

    // 2. Grain (The "Paper" Texture)
    // High frequency noise to simulate vellum/paper grain
    float grain = random(uv * t) * 0.05; 
    color += grain;

    // 3. Contrast Boost (Deepen the blacks)
    color = pow(color, vec3(1.1)); 

    return vec4(color, 1.0);
}
`;

const CosmicBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1
    );
  }, [time]);

  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: time.value,
      u_color1: [0.059, 0.020, 0.094], // #0f0518
      u_color2: [0.227, 0.078, 0.294], // #3a144b
      u_color3: [0.384, 0.157, 0.525], // #622886
      u_color4: [0.404, 0.298, 0.502], // #674c80
      u_color5: [0.243, 0.039, 0.082], // #3e0a15
      u_color6: [0.314, 0.188, 0.071], // #503012
      u_color7: [0.494, 0.439, 0.263], // #7e7043
      u_color8: [0.102, 0.043, 0.180], // #1a0b2e
    };
  }, [width, height]);

  const shader = useMemo(() => {
    if (Platform.OS === 'web') {
      return null;
    }
    return Skia.RuntimeEffect.Make(COSMIC_SHADER);
  }, []);

  if (Platform.OS === 'web') {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0f0518' }]} />;
  }

  if (!shader) {
    return null;
  }

  return (
    <Canvas style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height}>
        <Shader source={shader} uniforms={uniforms} />
      </Rect>
    </Canvas>
  );
};

export default CosmicBackground;
