// Experience C — drag the slider to morph a crooked arch into a straight one, with
// real front teeth plus visible metal brackets and an archwire that appears as treatment starts.
import { MATERIALS, applyStudioEnv } from "./tooth-factory.js";

// 8 front teeth (premolar → premolar) laid out left→right for a labial (front) smile view.
const FRONT = ["t14", "t13", "t12", "t11", "t21", "t22", "t23", "t24"];
// hand-tuned "crooked" offsets (never random at runtime → always looks convincingly wonky)
const JITTER = [
  { dx: -0.10, dy: 0.10, rz: 0.20, ry: -0.18 },
  { dx: 0.12, dy: -0.12, rz: -0.26, ry: 0.14 },
  { dx: -0.08, dy: 0.16, rz: 0.30, ry: 0.10 },
  { dx: 0.13, dy: -0.07, rz: -0.18, ry: -0.10 },
  { dx: -0.12, dy: -0.14, rz: 0.22, ry: 0.16 },
  { dx: 0.09, dy: 0.13, rz: -0.28, ry: -0.09 },
  { dx: -0.13, dy: -0.08, rz: 0.16, ry: 0.13 },
  { dx: 0.11, dy: 0.09, rz: -0.22, ry: -0.15 },
];

export function createBracesMorph(THREE_, { stage, canvas, range, models }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, -0.1, 7.2);
  camera.lookAt(0, -0.25, 0);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  applyStudioEnv(THREE_, renderer, scene, { shadowY: -1.7, shadowSize: 8 });

  const group = new THREE_.Group();
  scene.add(group);
  const enamel = MATERIALS.enamel();
  const metal = MATERIALS.metal();

  const teeth = [];
  const brackets = [];
  const bracketPts = [];

  const GLOBAL_SCALE = 0.95; // shared scale — preserves real relative tooth proportions
  // First pass: prepare upright, centered, scaled geometries and measure real widths.
  const prepared = [];
  FRONT.forEach((name) => {
    const src = models.getObjectByName(name);
    if (!src || !src.geometry) return;
    const geo = src.geometry.clone();
    // GLB teeth: the crown→root long axis runs along Z. Stand each tooth upright so that
    // axis becomes vertical (upper teeth: crown down, root up) with the face toward +Z.
    geo.rotateX(-Math.PI / 2);
    geo.computeBoundingBox();
    const c = new THREE_.Vector3();
    geo.boundingBox.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z); // center each tooth on its own origin
    geo.scale(GLOBAL_SCALE, GLOBAL_SCALE, GLOBAL_SCALE);
    geo.computeBoundingBox();
    prepared.push({ geo, bb: geo.boundingBox.clone() });
  });

  // Second pass: pack teeth edge-to-edge (real crowns touch), centered as a row.
  const GAP = 0.03;
  const totalW = prepared.reduce((a, p) => a + (p.bb.max.x - p.bb.min.x), 0) + GAP * (prepared.length - 1);
  let cursor = -totalW / 2;
  prepared.forEach((p, i) => {
    const w = p.bb.max.x - p.bb.min.x;
    const endX = cursor + w / 2;
    cursor += w + GAP;
    const endZ = -Math.abs(endX) * 0.1; // slight arch curve
    const j = JITTER[i];
    const mesh = new THREE_.Mesh(p.geo, enamel);
    mesh.userData = {
      start: { x: endX + j.dx * 0.8, y: j.dy, z: endZ, rz: j.rz, ry: j.ry },
      end: { x: endX, y: 0, z: endZ, rz: 0, ry: 0 },
      crownY: p.bb.min.y * 0.5, // mid-crown of the downward-hanging crown
      faceZ: p.bb.max.z + 0.02, // just proud of this tooth's labial surface
    };
    group.add(mesh);
    teeth.push(mesh);

    // bracket: small rounded metal pad on the camera-facing face, mid-crown
    const bracket = new THREE_.Mesh(new THREE_.BoxGeometry(0.2, 0.22, 0.09), metal);
    group.add(bracket);
    brackets.push(bracket);
    bracketPts.push(new THREE_.Vector3());
  });

  // gum line: slim rounded bar the roots disappear into (crowns emerge below it)
  const gum = new THREE_.Mesh(new THREE_.CapsuleGeometry(0.52, totalW + 0.5, 6, 18), MATERIALS.gum());
  gum.rotation.z = Math.PI / 2;
  gum.position.set(0, 0.72, -0.32);
  gum.scale.set(1, 1, 0.62);
  group.add(gum);

  // archwire tube through the bracket points
  const wireMat = MATERIALS.metal();
  let wire = null;
  function rebuildWire() {
    if (wire) {
      group.remove(wire);
      wire.geometry.dispose();
    }
    if (bracketPts.length < 2) return;
    const curve = new THREE_.CatmullRomCurve3(bracketPts.map((p) => p.clone()), false, "catmullrom", 0.3);
    wire = new THREE_.Mesh(new THREE_.TubeGeometry(curve, 48, 0.026, 8, false), wireMat);
    group.add(wire);
  }

  let dirty = true;
  let running = false;
  let bracketScale = 0;

  function setT(t) {
    // t: 0 crooked → 1 straight; brackets/wire ramp in as treatment starts
    bracketScale = Math.min(1, t * 1.6);
    for (let i = 0; i < teeth.length; i++) {
      const m = teeth[i];
      const s = m.userData.start;
      const e = m.userData.end;
      const rz = s.rz + (e.rz - s.rz) * t;
      const ry = s.ry + (e.ry - s.ry) * t;
      m.position.set(s.x + (e.x - s.x) * t, s.y + (e.y - s.y) * t, s.z + (e.z - s.z) * t);
      m.rotation.set(0, ry, rz);
      // bracket follows the tooth's tilt: rotate the local (0, crownY, faceZ) offset by rz
      const b = brackets[i];
      const cy = m.userData.crownY;
      b.position.set(
        m.position.x - cy * Math.sin(rz),
        m.position.y + cy * Math.cos(rz),
        m.position.z + m.userData.faceZ
      );
      b.rotation.set(0, ry, rz);
      b.scale.setScalar(bracketScale);
      b.visible = bracketScale > 0.02;
      bracketPts[i].copy(b.position);
      bracketPts[i].z += 0.05; // wire rides just on top of the brackets
    }
    if (bracketScale > 0.02) rebuildWire();
    else if (wire) { group.remove(wire); wire.geometry.dispose(); wire = null; }
    if (wire) wire.visible = bracketScale > 0.02;
    dirty = true;
  }

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function frame() {
    if (running && dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
    requestAnimationFrame(frame);
  }

  if (range) {
    range.addEventListener("input", () => setT(parseInt(range.value, 10) / 100));
  }

  resize();
  window.addEventListener("resize", resize);
  setT(range ? parseInt(range.value, 10) / 100 : 0);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);

  return {
    setRunning(v) { running = v; if (v) dirty = true; },
    resize,
  };
}
