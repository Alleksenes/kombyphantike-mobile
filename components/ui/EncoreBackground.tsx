import { BackdropBlur, Canvas, Fill, Image, Rect, Shader, Skia, SkImage, useCanvasRef } from '@shopify/react-native-skia';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Easing, useDerivedValue, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const COSMIC_SHADER = `
uniform vec2 resolution;
uniform float time;

// -- ENCORE PALETTE (Desaturated & Professional) --
// Zinc-950 (Deep Void)
const vec3 C_BASE    = vec3(0.035, 0.035, 0.043);
// Slate-900 (Cool Depth)
const vec3 C_MID     = vec3(0.059, 0.090, 0.165);
// Muted Indigo (The "Encore" Accent - Low Saturation)
const vec3 C_ACCENT  = vec3(0.12, 0.10, 0.22);
// Stone-900 (Subtle Warmth, replacing bright Gold)
const vec3 C_WARM    = vec3(0.10, 0.09, 0.08);

// -- UTILS --
// Simple hash for dither
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
}

// -- MAIN RENDER --
vec4 main(vec2 xy) {
    // Normalize coordinates
    vec2 uv = xy / resolution.xy;
    
    // Fix aspect ratio for shape consistency
    float aspect = resolution.x / resolution.y;
    vec2 st = uv;
    st.x *= aspect;

    // -- MOTION (Low Frequency / "Breathing") --
    // We remove FBM loops to eliminate "pixelation" and "grain".
    // We use slow sine waves for "Soft Mesh" movement.
    // OPTIMIZATION: Scaled by 0.01 for sub-perceptual movement
    float t = time * 0.0005;

    // Create 3 large, soft "Orb" influences

    // Orb 1: The Deep Cool (Slate) - Moves slowly bottom-left to center
    vec2 p1 = vec2(0.2, 0.3) + vec2(sin(t*0.8), cos(t*0.9)) * 0.2;
    float d1 = length(st - p1);
    // Smooth, large falloff (No sharp edges)
    float mask1 = smoothstep(0.8, 0.0, d1);

    // Orb 2: The Warmth (Stone) - Hovers top-right
    vec2 p2 = vec2(0.8 * aspect, 0.7) + vec2(cos(t*0.7), sin(t*0.6)) * 0.25;
    float d2 = length(st - p2);
    float mask2 = smoothstep(0.9, 0.0, d2);

    // Orb 3: The Accent (Indigo) - Deep background pulse
    vec2 p3 = vec2(0.5 * aspect, 0.5) + vec2(sin(t*0.5), cos(t*0.4)) * 0.4;
    float d3 = length(st - p3);
    float mask3 = smoothstep(1.2, 0.0, d3);

    // -- COLOR MIXING (Soft Mesh) --
    // Start with Void
    vec3 color = C_BASE;

    // Blend in the orbs additively but softly
    color = mix(color, C_MID, mask1 * 0.6);
    color = mix(color, C_WARM, mask2 * 0.5);
    color = mix(color, C_ACCENT, mask3 * 0.4);

    // -- DITHERING (Anti-Banding) --
    // Critical for dark gradients to look smooth on mobile screens
    float noise = random(uv + t);
    color += (noise - 0.5) * 0.015;

    // -- VIGNETTE (Subtle) --
    // Keeps focus in the center, strictly per Encore guidelines
    float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y) * 15.0;
    color *= mix(0.8, 1.0, pow(vig, 0.2));

    return vec4(color, 1.0);
}
`;

const EncoreBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);
  const canvasRef = useCanvasRef();
  const [snapshot, setSnapshot] = useState<SkImage | null>(null);

  useEffect(() => {
    time.value = withRepeat(
      withTiming(100, { duration: 100000, easing: Easing.linear }),
      -1
    );
  }, [time]);

  // -- RASTERIZATION GUARD --
  // Capture the shader once it stabilizes to save GPU resources (16.6ms/frame).
  useEffect(() => {
    if (Platform.OS === 'web') return;

    // Reset snapshot to force re-render of the live canvas when dimensions change
    setSnapshot(null);

    // Small delay to ensure the first frame (with shader + blur) is rendered
    const timeout = setTimeout(() => {
      const image = canvasRef.current?.makeImageSnapshot();
      if (image) {
        console.log("[EncoreBackground] Snapshot created");
        setSnapshot(image);
      }
    }, 150);

    return () => clearTimeout(timeout);
  }, [width, height]); // Re-snapshot if dimensions change

  const uniforms = useDerivedValue(() => {
    return {
      resolution: [width, height],
      time: time.value,
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

  // Tiered Rendering: Display cached bitmap if available
  if (snapshot) {
    return (
      <Canvas style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
        <Image
          image={snapshot}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      </Canvas>
    );
  }

  if (!shader) {
    return null;
  }

  // Live Rendering (Initial state)
  return (
    <Canvas
      ref={canvasRef}
      style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
      pointerEvents="none"
    >
      <Rect x={0} y={0} width={width} height={height}>
        <Shader source={shader} uniforms={uniforms} />
      </Rect>
      {/* Full-screen BackdropBlur for Encore soft-focus aesthetic */}
      <BackdropBlur blur={60} clip={{ x: 0, y: 0, width, height }}>
        <Fill color="transparent" />
      </BackdropBlur>
    </Canvas>
  );
};

export default EncoreBackground;
