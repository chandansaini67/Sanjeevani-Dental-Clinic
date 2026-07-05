// Experience C — drag the slider to morph a crooked arch into a straight one.
import * as THREE from "three";
import { incisor, canine, premolar, MATERIALS, setupStage } from "./tooth-factory.js";

export function createBracesMorph(THREE_, { stage, canvas, range }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.2, 8);
  camera.lookAt(0, 0, 0);
  setupStage(THREE_, scene);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE_.ACESFilmicToneMapping;

  const group = new THREE_.Group();
  scene.add(group);

  const enamel = MATERIALS.enamel();
  const shapes = [premolar, canine, incisor, incisor, incisor, incisor, canine, premolar];
  const teeth = [];
  const n = shapes.length;
  // hand-tuned jumble so "before" always looks convincingly crooked but not broken
  const jitter = [
    { dx: -0.18, dy: 0.12, rz: 0.22, ry: -0.2 },
    { dx: 0.14, dy: -0.14, rz: -0.28, ry: 0.15 },
    { dx: -0.1, dy: 0.18, rz: 0.32, ry: 0.1 },
    { dx: 0.16, dy: -0.08, rz: -0.2, ry: -0.12 },
    { dx: -0.14, dy: -0.16, rz: 0.24, ry: 0.18 },
    { dx: 0.1, dy: 0.14, rz: -0.3, ry: -0.1 },
    { dx: -0.16, dy: -0.1, rz: 0.18, ry: 0.14 },
    { dx: 0.18, dy: 0.1, rz: -0.24, ry: -0.16 },
  ];
  const spacing = 0.82;
  for (let i = 0; i < n; i++) {
    const mesh = new THREE_.Mesh(shapes[i](), enamel);
    const endX = (i - (n - 1) / 2) * spacing;
    const j = jitter[i];
    mesh.userData = {
      start: { x: endX + j.dx, y: j.dy, rz: j.rz, ry: j.ry },
      end: { x: endX, y: 0, rz: 0, ry: 0 },
    };
    mesh.scale.setScalar(0.92);
    group.add(mesh);
    teeth.push(mesh);
  }

  // simple gum bar behind the teeth
  const gum = new THREE_.Mesh(new THREE_.BoxGeometry(n * spacing + 0.6, 0.5, 0.4), MATERIALS.gum());
  gum.position.set(0, -0.85, -0.2);
  group.add(gum);

  let dirty = true;
  let running = false;

  function setT(t) {
    // t: 0 = crooked, 1 = straight
    for (const m of teeth) {
      const s = m.userData.start, e = m.userData.end;
      m.position.x = s.x + (e.x - s.x) * t;
      m.position.y = s.y + (e.y - s.y) * t;
      m.rotation.z = s.rz + (e.rz - s.rz) * t;
      m.rotation.y = s.ry + (e.ry - s.ry) * t;
    }
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
