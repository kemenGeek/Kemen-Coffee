import { useFrame } from '@react-three/fiber'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, ToneMapping, Vignette, Noise } from '@react-three/postprocessing'
import { BlendFunction, Effect, EffectAttribute, ToneMappingMode, type DepthOfFieldEffect } from 'postprocessing'
import { forwardRef, useMemo, useRef } from 'react'
import { Uniform, Vector2 } from 'three'
import { focusPoint } from './Director'
import type { QualitySettings } from './quality'
import { travelAmount } from './rig'

const fragment = /* glsl */ `
  uniform float uAmount;
  uniform float uTime;

  float wisp(vec2 p) {
    return sin(p.x * 4.0 + sin(p.y * 3.1 + uTime) * 1.4) * sin(p.y * 5.0 - uTime * 0.7 + sin(p.x * 2.3)) ;
  }

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 centre = uv - 0.5;
    float edge = smoothstep(0.1, 0.75, length(centre));
    vec2 warp = vec2(wisp(uv * 2.0), wisp(uv.yx * 2.0 + 3.0)) * 0.012 * uAmount * edge;
    vec3 color = vec3(0.0);
    const int TAPS = 8;

    for (int i = 0; i < TAPS; i++) {
      float reach = float(i) / float(TAPS) * 0.085 * uAmount * edge;
      color += texture2D(inputBuffer, uv + warp - centre * reach).rgb;
    }

    color /= float(TAPS);
    // Bloom would smear a single invalid pixel across the frame, so none get past here.
    if (any(isnan(color)) || any(isinf(color))) color = vec3(0.0);
    color = clamp(color, 0.0, 32.0);
    // Warm light leaks in from the edges of the frame during flight.
    color += vec3(0.32, 0.16, 0.06) * edge * edge * uAmount * 0.5;
    outputColor = vec4(color, inputColor.a);
  }
`

class TravelTransitionEffect extends Effect {
  constructor() {
    super('TravelTransitionEffect', fragment, {
      attributes: EffectAttribute.CONVOLUTION,
      uniforms: new Map<string, Uniform<number>>([
        ['uAmount', new Uniform(0)],
        ['uTime', new Uniform(0)],
      ]),
    })
  }
}

const TravelTransition = forwardRef<TravelTransitionEffect>(function TravelTransition(_, ref) {
  const effect = useMemo(() => new TravelTransitionEffect(), [])

  useFrame(({ clock }) => {
    effect.uniforms.get('uAmount')!.value = travelAmount() ** 1.5
    effect.uniforms.get('uTime')!.value = clock.elapsedTime
  })

  return <primitive ref={ref} object={effect} dispose={null} />
})

const aberration = new Vector2(0.00025, 0.00025)

export function PostFX({ quality }: { quality: QualitySettings }) {
  const focusRef = useRef<DepthOfFieldEffect>(null)

  useFrame(() => {
    focusRef.current?.target?.copy(focusPoint)
  })

  return (
    <EffectComposer multisampling={quality.multisampling} enableNormalPass={false}>
      <>{quality.depthOfField && <DepthOfField ref={focusRef} target={[0, 1, 0]} worldFocusRange={1.4} bokehScale={2.6} />}</>
      <TravelTransition />
      <>{quality.bloom && <Bloom mipmapBlur intensity={0.5} luminanceThreshold={1} luminanceSmoothing={0.2} />}</>
      <ChromaticAberration offset={aberration} radialModulation={false} modulationOffset={0} />
      <>{quality.grain && <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.3} />}</>
      <Vignette offset={0.3} darkness={0.62} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  )
}
