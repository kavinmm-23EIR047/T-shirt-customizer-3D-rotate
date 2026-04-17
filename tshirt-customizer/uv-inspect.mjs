// uv-inspect.mjs — finds UV bounds per body region
import { readFileSync } from 'fs'

const buf = readFileSync('./public/test.glb')
const chunk0Len = buf.readUInt32LE(12)
const jsonStr   = buf.toString('utf8', 20, 20 + chunk0Len)
const gltf      = JSON.parse(jsonStr)
const binStart  = 20 + chunk0Len + 8

// helpers
const bv  = i => gltf.bufferViews[i]
const acc = i => gltf.accessors[i]

function readVec3Array(accIdx) {
  const a  = acc(accIdx), b = bv(a.bufferView)
  const off = binStart + (b.byteOffset ?? 0) + (a.byteOffset ?? 0)
  const stride = b.byteStride ?? 12
  const out = []
  for (let i = 0; i < a.count; i++) {
    const o = off + i * stride
    out.push([buf.readFloatLE(o), buf.readFloatLE(o+4), buf.readFloatLE(o+8)])
  }
  return out
}

function readVec2Array(accIdx) {
  const a  = acc(accIdx), b = bv(a.bufferView)
  const off = binStart + (b.byteOffset ?? 0) + (a.byteOffset ?? 0)
  const stride = b.byteStride ?? 8
  const out = []
  for (let i = 0; i < a.count; i++) {
    const o = off + i * stride
    out.push([buf.readFloatLE(o), buf.readFloatLE(o+4)])
  }
  return out
}

const prim = gltf.meshes[0].primitives[0]
const positions = readVec3Array(prim.attributes.POSITION)
const uvs       = readVec2Array(prim.attributes.TEXCOORD_0)

console.log(`Total vertices: ${positions.length}`)
console.log(`Total UVs:      ${uvs.length}`)

// Known model values from previous inspection
const X_MIN=-0.201, X_MAX=0.168, X_RNG=0.369
const Y_MIN=0.004,  Y_MAX=0.459, Y_RNG=0.455
const Z_CTR=-0.100

const collarYMin = Y_MIN + Y_RNG * 0.90  // top 10%
const collarRad  = 0.060
const NX = (X_MIN + X_MAX) / 2
const NZ = Z_CTR
const sleeveXLo = X_MIN + X_RNG * 0.18
const sleeveXHi = X_MIN + X_RNG * 0.82

const regions = { collar: [], sleeve: [], front: [], back: [] }

positions.forEach(([x,y,z], i) => {
  const dXZ = Math.sqrt((x-NX)**2 + (z-NZ)**2)
  const uv  = uvs[i]
  if (y >= collarYMin && dXZ <= collarRad)   regions.collar.push(uv)
  else if (x < sleeveXLo || x > sleeveXHi)  regions.sleeve.push(uv)
  else if (z > Z_CTR)                        regions.front.push(uv)
  else                                        regions.back.push(uv)
})

function uvBounds(arr) {
  if (!arr.length) return null
  let uMin=1,uMax=0,vMin=1,vMax=0
  arr.forEach(([u,v]) => {
    if(u<uMin)uMin=u; if(u>uMax)uMax=u
    if(v<vMin)vMin=v; if(v>vMax)vMax=v
  })
  return { uMin:uMin.toFixed(3), uMax:uMax.toFixed(3), vMin:vMin.toFixed(3), vMax:vMax.toFixed(3), count: arr.length }
}

console.log('\n=== UV BOUNDS PER REGION ===')
Object.entries(regions).forEach(([name, arr]) => {
  const b = uvBounds(arr)
  console.log(`  ${name.padEnd(8)}: count=${b?.count}  U[${b?.uMin}→${b?.uMax}]  V[${b?.vMin}→${b?.vMax}]`)
})

// Also show UV grid density to understand the atlas layout
console.log('\n=== UV QUADRANT VERTEX DISTRIBUTION ===')
const quads = {
  'TL(U<0.5,V>0.5)':0, 'TR(U>0.5,V>0.5)':0,
  'BL(U<0.5,V<0.5)':0, 'BR(U>0.5,V<0.5)':0
}
uvs.forEach(([u,v]) => {
  if(u<0.5 && v>0.5) quads['TL(U<0.5,V>0.5)']++
  else if(u>0.5 && v>0.5) quads['TR(U>0.5,V>0.5)']++
  else if(u<0.5 && v<0.5) quads['BL(U<0.5,V<0.5)']++
  else quads['BR(U>0.5,V<0.5)']++
})
Object.entries(quads).forEach(([k,v]) => console.log(`  ${k}: ${v}`))

// Show UV sample for collar specifically
console.log('\n=== COLLAR UV SAMPLES (first 20) ===')
regions.collar.slice(0,20).forEach(([u,v]) => console.log(`  u=${u.toFixed(4)}  v=${v.toFixed(4)}`))
