import { useFrame, useThree } from '@react-three/fiber'
import { useMemo } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, ConeGeometry, DoubleSide, MathUtils, ShaderMaterial, Vector3 } from 'three'
import { rig } from './rig'

const NOISE = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float value = 0.0, amplitude = 0.5;
    for (int i = 0; i < 4; i++) { value += noise(p) * amplitude; p = p * 2.03 + 11.0; amplitude *= 0.5; }
    return value;
  }
`

export const steamMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying float vSeed;
    void main() {
      vUv = uv;
      vSeed = modelMatrix[3].x * 7.0 + modelMatrix[3].z * 3.0;
      // Billboard around the vertical axis so a wisp always faces the camera.
      vec4 origin = modelViewMatrix * vec4(0.0, position.y, 0.0, 1.0);
      float width = length(modelMatrix[0].xyz);
      origin.x += position.x * width;
      gl_Position = projectionMatrix * origin;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uTime;
    varying vec2 vUv;
    varying float vSeed;
    ${NOISE}
    void main() {
      float rise = vUv.y;
      float t = uTime * 0.22;
      float bend = (fbm(vec2(rise * 1.8 - t, vSeed)) - 0.5) * 0.7 * rise;
      float wisp = fbm(vec2((vUv.x + bend) * 3.4 + vSeed, rise * 2.2 - t * 1.6));
      float column = 1.0 - smoothstep(0.04, 0.42, abs(vUv.x - 0.5 + bend));
      float alpha = column * smoothstep(0.34, 0.74, wisp) * smoothstep(0.0, 0.1, rise) * (1.0 - smoothstep(0.35, 1.0, rise));
      gl_FragColor = vec4(vec3(1.0, 0.94, 0.86), alpha * 0.5);
    }
  `,
})

export function Steam({ position, height = 0.34 }: { position: Vector3; height?: number }) {
  return (
    <mesh
      position={[position.x, position.y + height / 2, position.z]}
      scale={[height * 0.62, height, 1]}
      material={steamMaterial}
      renderOrder={5}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}

const coneMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  side: DoubleSide,
  blending: AdditiveBlending,
  uniforms: { uStrength: { value: 0.07 } },
  vertexShader: /* glsl */ `
    varying float vFall;
    varying float vEdge;
    void main() {
      vFall = 1.0 - uv.y;
      vec3 normalView = normalize(normalMatrix * normal);
      vec4 view = modelViewMatrix * vec4(position, 1.0);
      vEdge = abs(dot(normalView, normalize(-view.xyz)));
      gl_Position = projectionMatrix * view;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform float uStrength;
    varying float vFall;
    varying float vEdge;
    void main() {
      float beam = pow(clamp(vEdge, 0.0, 1.0), 3.2) * pow(clamp(1.0 - vFall, 0.0, 1.0), 2.2) * smoothstep(0.0, 0.08, vFall);
      gl_FragColor = vec4(vec3(1.0, 0.72, 0.42) * beam * uStrength, 1.0);
    }
  `,
})

const coneGeometry = new ConeGeometry(1, 1, 32, 1, true)
coneGeometry.translate(0, -0.5, 0)

/** Soft shafts of haze under the lamps, which give the rooms their depth. */
export function LightCones({ lamps }: { lamps: { position: [number, number, number]; length: number; radius: number }[] }) {
  return lamps.map(({ position, length, radius }) => (
    <mesh
      key={position.join()}
      geometry={coneGeometry}
      material={coneMaterial}
      position={position}
      scale={[radius, length, radius]}
      renderOrder={4}
    />
  ))
}

const DUST_BOX = 7

const dustMaterial = new ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: AdditiveBlending,
  uniforms: { uTime: { value: 0 }, uCamera: { value: new Vector3() }, uBox: { value: DUST_BOX }, uPixelRatio: { value: 1 } },
  vertexShader: /* glsl */ `
    uniform float uTime, uBox, uPixelRatio;
    uniform vec3 uCamera;
    attribute float aSeed;
    varying float vFade;
    void main() {
      vec3 drift = vec3(sin(uTime * 0.1 + aSeed * 40.0), sin(uTime * 0.07 + aSeed * 90.0) + uTime * 0.03, cos(uTime * 0.09 + aSeed * 70.0)) * 0.5;
      // Motes wrap around the camera, so the air is full everywhere it flies.
      vec3 wrapped = mod(position + drift - uCamera + uBox * 0.5, uBox) - uBox * 0.5;
      vec3 world = uCamera + wrapped;
      vec4 view = viewMatrix * vec4(world, 1.0);
      vFade = (1.0 - smoothstep(uBox * 0.2, uBox * 0.5, length(wrapped))) * (0.45 + 0.55 * sin(uTime * 0.6 + aSeed * 100.0) * 0.5 + 0.28);
      gl_PointSize = uPixelRatio * (1.0 + aSeed * 1.4) * (4.0 / max(-view.z, 0.8));
      gl_Position = projectionMatrix * view;
    }
  `,
  fragmentShader: /* glsl */ `
    varying float vFade;
    void main() {
      float glow = 1.0 - smoothstep(0.0, 0.5, length(gl_PointCoord - 0.5));
      gl_FragColor = vec4(vec3(1.0, 0.8, 0.56) * glow * vFade * 0.22, 1.0);
    }
  `,
})

export function Dust({ count }: { count: number }) {
  const gl = useThree((state) => state.gl)
  const geometry = useMemo(() => {
    const next = new BufferGeometry()
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * DUST_BOX
      positions[i * 3 + 1] = Math.random() * DUST_BOX
      positions[i * 3 + 2] = Math.random() * DUST_BOX
      seeds[i] = Math.random()
    }

    next.setAttribute('position', new BufferAttribute(positions, 3))
    next.setAttribute('aSeed', new BufferAttribute(seeds, 1))
    return next
  }, [count])

  useFrame(({ clock, camera }) => {
    dustMaterial.uniforms.uTime.value = clock.elapsedTime
    dustMaterial.uniforms.uCamera.value.copy(camera.position)
    dustMaterial.uniforms.uPixelRatio.value = gl.getPixelRatio()
    steamMaterial.uniforms.uTime.value = clock.elapsedTime
  })

  return <points geometry={geometry} material={dustMaterial} frustumCulled={false} renderOrder={6} />
}

/** Smoothly fades a number towards a goal, frame-rate independently. */
export function approach(current: number, goal: number, speed: number, delta: number) {
  return MathUtils.damp(current, goal, speed, delta)
}

export const rigIsNear = (from: number, to: number, margin: number) =>
  MathUtils.smoothstep(rig.position, from - margin, from) * (1 - MathUtils.smoothstep(rig.position, to, to + margin))
