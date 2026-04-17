import { useEffect, useMemo, useRef, Suspense, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, OrbitControls, Decal } from '@react-three/drei'
import * as THREE from 'three'

/* ── CAMERA ── */
function CameraController({ view }) {
  const { camera } = useThree()
  
  useEffect(() => {
    // 360 Degree View Controller
    // OrbitControls controls the target, so we only need to snap the camera position!
    if (view === 'front') camera.position.set(0, 0, 3.5)
    else if (view === 'back') camera.position.set(0, 0, -3.5)
    else if (view === 'left') camera.position.set(-3.5, 0, 0)
    else if (view === 'right') camera.position.set(3.5, 0, 0)
    else if (view === 'top') camera.position.set(0, 3.5, 0)
    else if (view === 'bottom') camera.position.set(0, -3.5, 0)
  }, [view, camera])

  useEffect(() => {
    // Listen for custom zoom events from HTML buttons
    const handleZoomIn = () => {
      camera.translateZ(-0.5)
      if (Math.abs(camera.position.z) < 1.5) camera.position.z = Math.sign(camera.position.z) * 1.5
    }
    const handleZoomOut = () => {
      camera.translateZ(0.5)
      if (Math.abs(camera.position.z) > 6) camera.position.z = Math.sign(camera.position.z) * 6
    }
    window.addEventListener('ZOOM_IN', handleZoomIn)
    window.addEventListener('ZOOM_OUT', handleZoomOut)
    return () => {
      window.removeEventListener('ZOOM_IN', handleZoomIn)
      window.removeEventListener('ZOOM_OUT', handleZoomOut)
    }
  }, [camera])

  return null
}

/* ── LOGO STYLE ── */
function getLogoStyle(style, side) {
  // Push the logo slightly outward depending on front or back to avoid clipping
  // The shirt's absolute X/Y/Z bounds dictate the exact surface depth:
  // Front chest peaks around Z ≈ +0.038
  // Back peaks around Z ≈ -0.150
  const isFront = side === 'front'
  const z  = isFront ? 0.043 : -0.156     // Flush against chest / back
  const rx = isFront ? -0.05 : 0.05       // Slight tilt for the chest/back slope
  const ry = isFront ? 0 : Math.PI        // Face front or face back
  
  // Z scale is kept at 1 because planes are flat
  const styles = {
    // Exact center NX = -0.0165
    // "box type full length t-shirt" (covers the whole front body)
    box:        { position: [-0.0165, 0.20],  scale: [0.30, 0.40] },
    
    // "heart like zest side" (classic small left chest, appears on right side of screen)
    zest:       { position: [0.0500, 0.33],  scale: [0.08, 0.08] },
    heart:      { position: [0.0500, 0.33],  scale: [0.08, 0.08] },
    small:      { position: [0.0500, 0.33],  scale: [0.08, 0.08] },
    
    // "vertical in any corner" (center vertical)
    vertical:   { position: [-0.0165, 0.20],  scale: [0.12, 0.38] },
    // "horizontal in center" (classic chest logo)
    horizontal: { position: [-0.0165, 0.28],  scale: [0.28, 0.12] },
  }
  
  // Default to full box if style missing or using old 'full'
  return styles[style] || styles[style?.toLowerCase()] || styles.box
}

/*
 * ─── EXACT BOUNDS (from inspect-glb.mjs on test.glb) ───────────────────────
 *   X : -0.201 → 0.168   xRange = 0.369
 *   Y :  0.004 → 0.459   yRange = 0.455
 *   Z : -0.155 → 0.041   zRange = 0.196   zCenter = -0.057
 * ────────────────────────────────────────────────────────────────────────── */
const MODEL = Object.freeze({
  X_MIN: -0.201, X_MAX: 0.168, X_RNG: 0.369,
  Y_MIN: 0.004,  Y_MAX: 0.459, Y_RNG: 0.455,
  Z_CTR: -0.100, // shifted deeper than geometric center
})

// ── Helper: Find connected components (islands) in mesh ──────────────────────
function buildVertexColors(geometry, safeColors) {
  const pos = geometry.attributes.position?.array
  const idx = geometry.getIndex()?.array
  if (!pos || !idx) return null

  const vertexCount = pos.length / 3
  const faceCount = idx.length / 3

  const parent = new Int32Array(vertexCount)
  for (let i = 0; i < vertexCount; i++) parent[i] = i

  function find(i) {
    let root = i; while (root !== parent[root]) root = parent[root]
    let curr = i; while (curr !== root) { let nxt = parent[curr]; parent[curr] = root; curr = nxt }
    return root
  }
  function union(i, j) {
    const rootI = find(i); const rootJ = find(j)
    if (rootI !== rootJ) parent[rootI] = rootJ
  }

  for (let f = 0; f < faceCount; f++) {
    const a = idx[f * 3], b = idx[f * 3 + 1], c = idx[f * 3 + 2]
    union(a, b); union(b, c)
  }

  const islands = new Map()
  for (let i = 0; i < vertexCount; i++) {
    const root = find(i); if (!islands.has(root)) islands.set(root, [])
    islands.get(root).push(i)
  }

  const buf = new Float32Array(vertexCount * 3)
  const NX = (MODEL.X_MIN + MODEL.X_MAX) / 2
  const NZ = MODEL.Z_CTR

  islands.forEach((vertIndices, root) => {
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, zMin = Infinity, zMax = -Infinity
    vertIndices.forEach(v => {
      const ix = v * 3, x = pos[ix], y = pos[ix + 1], z = pos[ix + 2]
      if (x < xMin) xMin = x; if (x > xMax) xMax = x; if (y < yMin) yMin = y; if (y > yMax) yMax = y; if (z < zMin) zMin = z; if (z > zMax) zMax = z
    })
    const cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cz = (zMin + zMax) / 2
    let cStr
    if (cy > MODEL.Y_MIN + MODEL.Y_RNG * 0.85 && Math.abs(cx - NX) < 0.08) cStr = safeColors.collar
    else if (cx < MODEL.X_MIN + MODEL.X_RNG * 0.25 || cx > MODEL.X_MAX - MODEL.X_RNG * 0.25) cStr = safeColors.sleeve
    else if (cz > MODEL.Z_CTR) cStr = safeColors.front
    else cStr = safeColors.back
    const c = new THREE.Color(cStr)
    vertIndices.forEach(v => { const ix = v * 3; buf[ix] = c.r; buf[ix + 1] = c.g; buf[ix + 2] = c.b })
  })
  return buf
}

/* ── MODEL COMPONENT ── */
function TShirtModel({ colors = {}, logos = {}, logoStyle = {} }) {
  const { scene: originalScene } = useGLTF('/test.glb')
  const scene = useMemo(() => originalScene.clone(), [originalScene])
  const textureLoader = useRef(new THREE.TextureLoader())

  const [frontTex, setFrontTex] = useState(null)
  const [backTex, setBackTex] = useState(null)

  const safeColors = useMemo(() => ({
    front: colors.front || '#ffffff',
    back: colors.back || '#ffffff',
    sleeve: colors.sleeve || '#cccccc',
    collar: colors.collar || '#999999',
  }), [colors.front, colors.back, colors.sleeve, colors.collar])

  /* ── SHADER UNIFORMS ── */
  const uniforms = useMemo(() => ({
    mapLogoFront:  { value: null },
    logoFrontPos:  { value: new THREE.Vector2(0, 0) },
    logoFrontSize: { value: new THREE.Vector2(1, 1) },
    hasLogoFront:  { value: false },

    mapLogoBack:   { value: null },
    logoBackPos:   { value: new THREE.Vector2(0, 0) },
    logoBackSize:  { value: new THREE.Vector2(1, 1) },
    hasLogoBack:   { value: false },
  }), [])

  // Sync textures and sizes into Shader
  useEffect(() => {
    uniforms.mapLogoFront.value = frontTex
    uniforms.hasLogoFront.value = !!frontTex
    if (frontTex) {
      const style = getLogoStyle(logoStyle?.front, 'front')
      uniforms.logoFrontPos.value.set(style.position[0], style.position[1])
      uniforms.logoFrontSize.value.set(style.scale[0], style.scale[1])
    }

    uniforms.mapLogoBack.value = backTex
    uniforms.hasLogoBack.value = !!backTex
    if (backTex) {
      const style = getLogoStyle(logoStyle?.back, 'back')
      uniforms.logoBackPos.value.set(style.position[0], style.position[1])
      uniforms.logoBackSize.value.set(style.scale[0], style.scale[1])
    }
  }, [frontTex, backTex, logoStyle, uniforms])

  /* ── APPLY VERTEX COLORS & SHADERS ── */
  useEffect(() => {
    const meshes = []
    scene.traverse(obj => { if (obj.isMesh) meshes.push(obj) })
    if (!meshes.length) return

    meshes.forEach(mesh => {
      const geo = mesh.geometry
      geo.computeVertexNormals()

      const buf = buildVertexColors(geo, safeColors)
      if (!buf) return

      geo.setAttribute('color', new THREE.BufferAttribute(buf, 3))
      geo.attributes.color.needsUpdate = true

      const originalMap = mesh.material.map || null

      mesh.material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        bumpMap: originalMap,
        bumpScale: 0.015,
        roughness: 0.85,
        metalness: 0.05,
        side: THREE.DoubleSide,
      })

      // The magic happens here: we 'paint' the logo directly onto the fabric surface using WebGL
      mesh.material.onBeforeCompile = (shader) => {
        shader.uniforms.mapLogoFront = uniforms.mapLogoFront
        shader.uniforms.logoFrontPos = uniforms.logoFrontPos
        shader.uniforms.logoFrontSize = uniforms.logoFrontSize
        shader.uniforms.hasLogoFront = uniforms.hasLogoFront
        
        shader.uniforms.mapLogoBack = uniforms.mapLogoBack
        shader.uniforms.logoBackPos = uniforms.logoBackPos
        shader.uniforms.logoBackSize = uniforms.logoBackSize
        shader.uniforms.hasLogoBack = uniforms.hasLogoBack

        shader.vertexShader = `
          varying vec3 vLocalPos;
          ${shader.vertexShader}
        `.replace(
          `#include <worldpos_vertex>`,
          `#include <worldpos_vertex>
           vLocalPos = transformed;`
        )

        shader.fragmentShader = `
          uniform sampler2D mapLogoFront;
          uniform vec2 logoFrontPos;
          uniform vec2 logoFrontSize;
          uniform bool hasLogoFront;

          uniform sampler2D mapLogoBack;
          uniform vec2 logoBackPos;
          uniform vec2 logoBackSize;
          uniform bool hasLogoBack;

          varying vec3 vLocalPos;
          ${shader.fragmentShader}
        `.replace(
          `vec4 diffuseColor = vec4( diffuse, opacity );`,
          `vec4 diffuseColor = vec4( diffuse, opacity );
          
          float Z_CTR = -0.100;
          
          // Front Logo Projection
          // Only map to front mesh (z > Z_CTR) and strictly prevent mapping to collar area (y < 0.410)
          if (hasLogoFront && vLocalPos.z > Z_CTR && vLocalPos.y < 0.410) {
             // flipY is false in our loader, meaning UV v=0 is the top, so we reverse Y logic
             vec2 uv = vec2(
               (vLocalPos.x - logoFrontPos.x) / logoFrontSize.x + 0.5,
               - (vLocalPos.y - logoFrontPos.y) / logoFrontSize.y + 0.5
             );
             if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
                vec4 logoC = texture2D(mapLogoFront, uv);
                // Pre-multiply alpha to prevent white ghosting around PNG borders
                diffuseColor.rgb = mix(diffuseColor.rgb, logoC.rgb, logoC.a);
             }
          }
          
          // Back Logo Projection
          // Back is looked at from behind, so the X axis flips structurally
          if (hasLogoBack && vLocalPos.z <= Z_CTR && vLocalPos.y < 0.410) {
             vec2 uv = vec2(
               - (vLocalPos.x - logoBackPos.x) / logoBackSize.x + 0.5,
               - (vLocalPos.y - logoBackPos.y) / logoBackSize.y + 0.5
             );
             if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
                vec4 logoC = texture2D(mapLogoBack, uv);
                diffuseColor.rgb = mix(diffuseColor.rgb, logoC.rgb, logoC.a);
             }
          }
          `
        )
      }

      mesh.material.needsUpdate = true
    })
  }, [scene, safeColors, uniforms])

  /* ── LOAD LOGO FILES ── */
  useEffect(() => {
    let fTex = null, bTex = null
    const load = (url, setter, assign) => {
      if (!url) { setter(null); return }
      textureLoader.current.load(
        url,
        t => { t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; assign(t); setter(t) },
        undefined,
        err => console.error('Logo texture failed:', err),
      )
    }
    load(logos?.front, setFrontTex, t => { fTex = t })
    load(logos?.back, setBackTex, t => { bTex = t })
    return () => { fTex?.dispose(); bTex?.dispose() }
  }, [logos])

  return (
    <group scale={2.5} position={[0, -0.5, 0]}>
      <primitive object={scene} />
      {/* Logos are now perfectly printed into the fabric by the Shader, NO geometry needed! */}
    </group>
  )
}

/* ── MAIN VIEWER (manual orbit only — no auto-rotate) ── */
export default function TShirtViewer({
  colors = { front: '#ffffff', back: '#ffffff', sleeve: '#cccccc', collar: '#999999' },
  logos = { front: null, back: null },
  view = 'front',
  logoStyle = { front: 'full', back: 'full' },
}) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
      >
        <CameraController view={view} />
        <ambientLight intensity={1} />
        <directionalLight position={[3, 3, 3]} intensity={1.2} />
        <directionalLight position={[-3, -3, -3]} intensity={0.7} />
        <Suspense fallback={null}>
          <TShirtModel colors={colors} logos={logos} logoStyle={logoStyle} />
        </Suspense>
        <OrbitControls
          enableZoom
          enableRotate
          enablePan={false}
          minDistance={1.5}
          maxDistance={6}
          target={[0, -0.2, 0]}
        />
      </Canvas>
    </div>
  )
}