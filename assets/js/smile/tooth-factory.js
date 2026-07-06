// Procedural tooth geometry — no external model files.
// Each generator returns a THREE.BufferGeometry, crown centered near origin,
// biting surface up (+Y), roots hanging down (-Y). Kept low-poly (<2k tris).

import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Rounded-box-ish crown by displacing a sphere toward a superellipse cross-section.
function crownGeometry(THREE_, { width, depth, height, cusps }) {
  const geo = new THREE_.SphereGeometry(0.5, 16, 12);
  const pos = geo.attributes.position;
  const v = new THREE_.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // squash into a box-like crown
    v.x *= width;
    v.z *= depth;
    v.y *= height;
    // flatten the biting (top) surface and add cusp bumps
    if (v.y > 0) {
      v.y *= 0.62;
      if (cusps > 0) {
        const bump = Math.cos(v.x * cusps * 3.1) * Math.cos(v.z * cusps * 3.1);
        v.y += bump * 0.06 * height;
      }
    } else {
      // taper toward the neck
      const t = -v.y / (0.5 * height);
      v.x *= 1 - t * 0.28;
      v.z *= 1 - t * 0.28;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function rootGeometry(THREE_, { radius, length, taper }) {
  const geo = new THREE_.CylinderGeometry(radius * taper, radius, length, 10, 1);
  geo.translate(0, -length / 2, 0);
  return geo;
}

// Merge a list of geometries into one (avoids importing BufferGeometryUtils).
function mergeGeoms(THREE_, geoms) {
  let vertexCount = 0;
  let indexCount = 0;
  for (const g of geoms) {
    vertexCount += g.attributes.position.count;
    indexCount += g.index ? g.index.count : g.attributes.position.count;
  }
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(indexCount);
  let vOff = 0;
  let iOff = 0;
  for (const g of geoms) {
    const gp = g.attributes.position;
    const gn = g.attributes.normal || (g.computeVertexNormals(), g.attributes.normal);
    positions.set(gp.array, vOff * 3);
    normals.set(gn.array, vOff * 3);
    if (g.index) {
      for (let i = 0; i < g.index.count; i++) indices[iOff + i] = g.index.array[i] + vOff;
      iOff += g.index.count;
    } else {
      for (let i = 0; i < gp.count; i++) indices[iOff + i] = i + vOff;
      iOff += gp.count;
    }
    vOff += gp.count;
  }
  const merged = new THREE_.BufferGeometry();
  merged.setAttribute("position", new THREE_.BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE_.BufferAttribute(normals, 3));
  merged.setIndex(new THREE_.BufferAttribute(indices, 1));
  return merged;
}

// --- public generators (crown-only, for the front-facing arch/braces) ---
export function incisor() {
  return crownGeometry(THREE, { width: 0.62, depth: 0.34, height: 1.15, cusps: 0 });
}
export function canine() {
  const g = crownGeometry(THREE, { width: 0.56, depth: 0.5, height: 1.28, cusps: 0 });
  // pull the tip up to a point
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > 0.3) {
      pos.setX(i, pos.getX(i) * 0.6);
      pos.setZ(i, pos.getZ(i) * 0.7);
      pos.setY(i, y * 1.12);
    }
  }
  g.computeVertexNormals();
  return g;
}
export function premolar() {
  return crownGeometry(THREE, { width: 0.66, depth: 0.6, height: 1.0, cusps: 1 });
}
export function molar() {
  return crownGeometry(THREE, { width: 0.86, depth: 0.82, height: 0.92, cusps: 2 });
}

// A full tooth with roots and an inner pulp channel — used by the decay story.
export function molarWithRoots(THREE_ = THREE) {
  const crown = crownGeometry(THREE_, { width: 0.9, depth: 0.86, height: 1.0, cusps: 2 });
  crown.translate(0, 0.5, 0);
  const r1 = rootGeometry(THREE_, { radius: 0.2, length: 1.1, taper: 0.4 });
  r1.translate(-0.24, 0.02, 0.1);
  const r2 = rootGeometry(THREE_, { radius: 0.2, length: 1.15, taper: 0.4 });
  r2.translate(0.24, 0.02, 0.1);
  const r3 = rootGeometry(THREE_, { radius: 0.18, length: 1.0, taper: 0.4 });
  r3.translate(0, 0.02, -0.22);
  return mergeGeoms(THREE_, [crown, r1, r2, r3]);
}

// Inner pulp/canal shape (rendered separately, red) for the RCT reveal.
export function pulp(THREE_ = THREE) {
  const chamber = new THREE_.SphereGeometry(0.26, 10, 8);
  chamber.scale(1, 0.7, 1);
  chamber.translate(0, 0.45, 0.02);
  const c1 = rootGeometry(THREE_, { radius: 0.07, length: 1.0, taper: 0.3 });
  c1.translate(-0.24, 0.1, 0.1);
  const c2 = rootGeometry(THREE_, { radius: 0.07, length: 1.05, taper: 0.3 });
  c2.translate(0.24, 0.1, 0.1);
  const c3 = rootGeometry(THREE_, { radius: 0.06, length: 0.9, taper: 0.3 });
  c3.translate(0, 0.1, -0.22);
  return mergeGeoms(THREE_, [chamber, c1, c2, c3]);
}

// Clean-and-realistic finish: bright enamel with a clearcoat sheen, fleshy gums.
export const MATERIALS = {
  enamel: () =>
    new THREE.MeshPhysicalMaterial({ color: 0xf4efe2, roughness: 0.28, clearcoat: 0.6, clearcoatRoughness: 0.28, metalness: 0.0 }),
  enamelDull: () =>
    new THREE.MeshPhysicalMaterial({ color: 0xe6dcc6, roughness: 0.6, clearcoat: 0.2, metalness: 0.0 }),
  gum: () =>
    new THREE.MeshPhysicalMaterial({ color: 0xd97b7b, roughness: 0.55, sheen: 0.4, sheenColor: new THREE.Color(0xff9d9d), metalness: 0.0 }),
  pulp: () =>
    new THREE.MeshPhysicalMaterial({ color: 0xd94141, roughness: 0.5, emissive: 0x3a0000, emissiveIntensity: 0.3 }),
  gutta: () => new THREE.MeshPhysicalMaterial({ color: 0xe8913a, roughness: 0.45 }),
  crown: () => new THREE.MeshPhysicalMaterial({ color: 0xeef3fb, roughness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.1, metalness: 0.1 }),
  decay: () => new THREE.MeshPhysicalMaterial({ color: 0x4a3222, roughness: 0.9 }),
  metal: () => new THREE.MeshPhysicalMaterial({ color: 0xcfd6dd, roughness: 0.25, metalness: 1.0 }),
};

// Soft studio lighting via RoomEnvironment (image-based) + one key light + a cheap
// canvas-texture contact shadow (no shadow-map cost — fits render-on-demand/low-power).
export function applyStudioEnv(THREE_, renderer, scene, opts = {}) {
  renderer.toneMapping = THREE_.ACESFilmicToneMapping;
  renderer.toneMappingExposure = opts.exposure ?? 1.1;
  const pmrem = new THREE_.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const key = new THREE_.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 6, 4);
  scene.add(key);
  const fill = new THREE_.HemisphereLight(0xdff2ff, 0xf3e9df, 0.35);
  scene.add(fill);
  if (opts.shadow !== false) addContactShadow(THREE_, scene, opts.shadowY ?? -1.3, opts.shadowSize ?? 7);
}

function addContactShadow(THREE_, scene, y, size) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, "rgba(20,30,50,0.38)");
  g.addColorStop(1, "rgba(20,30,50,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE_.CanvasTexture(c);
  const plane = new THREE_.Mesh(
    new THREE_.PlaneGeometry(size, size),
    new THREE_.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = y;
  scene.add(plane);
}

// Back-compat alias (older call sites); prefers applyStudioEnv going forward.
export function setupStage(THREE_, scene) {
  const hemi = new THREE_.HemisphereLight(0xd9f6ef, 0xf3e9df, 1.0);
  scene.add(hemi);
  const dir = new THREE_.DirectionalLight(0xffffff, 1.4);
  dir.position.set(3, 6, 4);
  scene.add(dir);
}
