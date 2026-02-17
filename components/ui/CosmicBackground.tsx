import { Canvas, Rect, Shader, Skia } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

// --- PALETTE 1: ROYAL PURPLE (The Throne) ---
const vec3 r_base = vec3(0.165, 0.039, 0.180); // #2a0a2e (Deep Purple)
const vec3 r_mid  = vec3(0.290, 0.102, 0.369); // #4a1a5e (Plum)
const vec3 r_high = vec3(0.831, 0.686, 0.216); // #d4af37 (Byzantine Gold)

// --- PALETTE 2: BURNING LIBRARY (The Catastrophe) ---
const vec3 f_base = vec3(0.110, 0.020, 0.020); // #1c0505 (Charcoal/Ember)
const vec3 f_mid  = vec3(0.600, 0.100, 0.050); // #99190d (Oxblood Red)
const vec3 f_high = vec3(1.000, 0.500, 0.000); // #ff8000 (Fire Orange)

// --- PALETTE 3: AEGEAN SEA (The Rebirth) ---
const vec3 w_base = vec3(0.000, 0.129, 0.255); // #002141 (Deep Sea)
const vec3 w_mid  = vec3(0.000, 0.412, 0.580); // #006994 (Aegean Blue)
const vec3 w_high = vec3(0.400, 0.900, 0.900); // #66e6e6 (Seafoam)

float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm ( vec2 st ) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 4; ++i) {
        v += a * noise(st);
        st = rot * st * 2.0;
        a *= 0.5;
    }
    return v;
}

vec4 main(vec2 xy) {
    vec2 st = xy / resolution.xy;
    st.x *= resolution.x/resolution.y;

    // MACRO CYCLE: 0 -> 3 -> 0
    // Controls the shift between Palettes
    float cycle = mod(time * 0.1, 3.0); 
    
    vec3 c1, c2, c3;

    // Interpolate Palettes based on cycle
    // We use mix() to bleed one era into the next
    if (cycle < 1.0) {
        float t = smoothstep(0.0, 1.0, cycle);
        c1 = mix(r_base, f_base, t);
        c2 = mix(r_mid,  f_mid,  t);
        c3 = mix(r_high, f_high, t);
    } else if (cycle < 2.0) {
        float t = smoothstep(0.0, 1.0, cycle - 1.0);
        c1 = mix(f_base, w_base, t);
        c2 = mix(f_mid,  w_mid,  t);
        c3 = mix(f_high, w_high, t);
    } else {
        float t = smoothstep(0.0, 1.0, cycle - 2.0);
        c1 = mix(w_base, r_base, t);
        c2 = mix(w_mid,  r_mid,  t);
        c3 = mix(w_high, r_high, t);
    }

    // FLUID DYNAMICS (The Paint)
    float t_flow = time * 0.5;
    vec2 flow = vec2((st.x + st.y) * 2.0 + t_flow);
    float n = fbm(st * 3.0 - t_flow * 0.2);
    float pos = flow.x + n;

    // Apply the Dynamic Palette
    vec3 color = mix(c1, c2, sin(pos * 1.5) * 0.5 + 0.5);
    // Add the Highlights (Gold/Fire/Foam) sparingly
    color = mix(color, c3, smoothstep(0.6, 1.0, sin(pos * 2.0 + n)));

    // Deep Grain
    float grain = random(st * 150.0 + time) * 0.04;
    color += vec3(grain);

    // Vignette
    vec2 centred = (xy / resolution.xy) * 2.0 - 1.0;
    color *= (1.0 - smoothstep(0.4, 1.5, length(centred)));

    return vec4(color, 1.0);
}
`;

const CosmicBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    // 600s loop allows for slow, imperceptible color shifts
    time.value = withRepeat(withTiming(600, { duration: 600000, easing: Easing.linear }), -1);
  }, []);

  const uniforms = useDerivedValue(() => ({
    resolution: [width, height],
    time: time.value
  }));

  const shader = useMemo(() => (Platform.OS === 'web' ? null : Skia.RuntimeEffect.Make(COSMIC_SHADER)), []);

  if (Platform.OS === 'web' || !shader) {
    return <View style={[StyleSheet.absoluteFill, { backgroundColor: '#1a0b2e' }]} />;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Canvas style={{ flex: 1 }}>
        <Rect x={0} y={0} width={width} height={height}>
          <Shader source={shader} uniforms={uniforms} />
        </Rect>
      </Canvas>
    </View>
  );
};

export default CosmicBackground;