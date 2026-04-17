// inspect-glb.mjs — run with: node inspect-glb.mjs
import { readFileSync } from 'fs'

const buf = readFileSync('./public/test.glb')

// GLB is: 12-byte header + chunks
// Header: magic(4) + version(4) + length(4)
const magic = buf.toString('ascii', 0, 4)
const version = buf.readUInt32LE(4)
const totalLen = buf.readUInt32LE(8)

console.log(`GLB Magic: ${magic}  Version: ${version}  Total bytes: ${totalLen}`)

// Chunk 0: JSON
const chunk0Len  = buf.readUInt32LE(12)
const chunk0Type = buf.readUInt32LE(16)   // 0x4E4F534A = JSON
const jsonStr    = buf.toString('utf8', 20, 20 + chunk0Len)
const gltf       = JSON.parse(jsonStr)

// ─── Scenes / Nodes ─────────────────────────────────────────────────────────
console.log('\n=== SCENES ===')
gltf.scenes?.forEach((s, i) => console.log(`  Scene ${i}: "${s.name}"  nodes: ${s.nodes}`))

console.log('\n=== NODES ===')
gltf.nodes?.forEach((n, i) => {
  console.log(`  Node ${i}: "${n.name}"  mesh: ${n.mesh ?? 'none'}`)
})

// ─── Meshes / Primitives ─────────────────────────────────────────────────────
console.log('\n=== MESHES ===')
gltf.meshes?.forEach((m, mi) => {
  console.log(`  Mesh ${mi}: "${m.name}"  primitives: ${m.primitives.length}`)
  m.primitives.forEach((p, pi) => {
    const attrs = Object.keys(p.attributes).join(', ')
    console.log(`    Prim ${pi}: material=${p.material}  attrs=[${attrs}]`)
  })
})

// ─── Materials ───────────────────────────────────────────────────────────────
console.log('\n=== MATERIALS ===')
gltf.materials?.forEach((mat, i) => {
  const base = mat.pbrMetallicRoughness?.baseColorFactor
  console.log(`  Material ${i}: "${mat.name}"  baseColor: ${base ? base.map(v=>v.toFixed(2)).join(',') : 'texture'}`)
})

// ─── Accessors (vertex counts) ────────────────────────────────────────────────
console.log('\n=== ACCESSOR COUNTS (first 20) ===')
gltf.accessors?.slice(0, 20).forEach((a, i) => {
  console.log(`  Accessor ${i}: type=${a.type}  count=${a.count}  componentType=${a.componentType}`)
})

// ─── Compute position bounds per mesh primitive ───────────────────────────────
// Find BIN chunk
const binChunkOffset = 20 + chunk0Len
const binChunkLen    = buf.readUInt32LE(binChunkOffset)
// binChunkType 0x004E4942 = BIN
const binStart       = binChunkOffset + 8

console.log('\n=== POSITION BOUNDS PER MESH PRIMITIVE ===')
gltf.meshes?.forEach((mesh, mi) => {
  mesh.primitives.forEach((prim, pi) => {
    const accIdx = prim.attributes.POSITION
    if (accIdx == null) return
    const acc   = gltf.accessors[accIdx]
    const bvIdx = acc.bufferView
    const bv    = gltf.bufferViews[bvIdx]

    const byteOffset = (bv.byteOffset ?? 0) + (acc.byteOffset ?? 0)
    const count      = acc.count
    const stride     = bv.byteStride ?? 12   // 3 floats * 4 bytes

    let xMin=Infinity,xMax=-Infinity,yMin=Infinity,yMax=-Infinity,zMin=Infinity,zMax=-Infinity

    for (let i = 0; i < count; i++) {
      const off = binStart + byteOffset + i * stride
      const x = buf.readFloatLE(off)
      const y = buf.readFloatLE(off + 4)
      const z = buf.readFloatLE(off + 8)
      if (x < xMin) xMin=x; if (x > xMax) xMax=x
      if (y < yMin) yMin=y; if (y > yMax) yMax=y
      if (z < zMin) zMin=z; if (z > zMax) zMax=z
    }

    console.log(`  Mesh ${mi} "${mesh.name}" Prim ${pi}:  vertices=${count}`)
    console.log(`    X: ${xMin.toFixed(3)} → ${xMax.toFixed(3)}   xRange=${(xMax-xMin).toFixed(3)}`)
    console.log(`    Y: ${yMin.toFixed(3)} → ${yMax.toFixed(3)}   yRange=${(yMax-yMin).toFixed(3)}`)
    console.log(`    Z: ${zMin.toFixed(3)} → ${zMax.toFixed(3)}   zRange=${(zMax-zMin).toFixed(3)}`)
    console.log(`    zCenter=${((zMin+zMax)/2).toFixed(3)}`)
  })
})
