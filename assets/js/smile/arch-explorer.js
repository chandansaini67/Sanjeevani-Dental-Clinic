// Experience A — rotatable dental arch; tap a tooth to see its info card.
import * as THREE from "three";
import { incisor, canine, premolar, MATERIALS, setupStage } from "./tooth-factory.js";
import { TEETH } from "./tooth-data.js";

export function createArchExplorer(THREE_, { stage, canvas, infoEl, selectEl }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 1.2, 8.4);
  camera.lookAt(0, 0, 0);
  setupStage(THREE_, scene);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE_.ACESFilmicToneMapping;

  const group = new THREE_.Group();
  scene.add(group);

  // 10 front teeth along a half-ellipse (patient's smile arc)
  const geoms = [molarSafe(), premolar(), premolar(), canine(), incisor(), incisor(), incisor(), incisor(), canine(), premolar()];
  function molarSafe() {
    return premolar();
  }
  const enamel = MATERIALS.enamel();
  const meshes = [];
  const a = 3.0; // arch half-width
  const b = 1.7; // arch depth
  const n = TEETH.length;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1); // 0..1
    const ang = (-1 + 2 * t) * 1.15; // -1.15..1.15 rad
    const x = Math.sin(ang) * a;
    const z = -Math.cos(ang) * b + b;
    const mesh = new THREE_.Mesh(geoms[i] || incisor(), enamel);
    mesh.position.set(x, 0, z);
    mesh.rotation.y = -ang;
    mesh.scale.setScalar(0.9);
    mesh.userData.index = i;
    group.add(mesh);
    meshes.push(mesh);
  }

  // gum arc (torus segment flattened)
  const gum = new THREE_.Mesh(new THREE_.TorusGeometry(a * 0.98, 0.34, 10, 40, Math.PI * 1.25), MATERIALS.gum());
  gum.rotation.x = Math.PI / 2;
  gum.position.set(0, -0.72, b - 0.1);
  gum.rotation.z = Math.PI;
  gum.scale.set(1, 1, 0.62);
  group.add(gum);

  const raycaster = new THREE_.Raycaster();
  const pointer = new THREE_.Vector2();
  let selected = -1;
  let dirty = true;
  let running = false;
  let autoRotate = true;
  let lastInteract = performance.now();
  let velocity = 0;

  function resize() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function selectTooth(i) {
    selected = i;
    meshes.forEach((m, idx) => {
      const on = idx === i;
      m.material = on ? highlightMat : enamel;
      m.scale.setScalar(on ? 0.98 : 0.9);
    });
    renderInfo(i);
    if (selectEl) selectEl.value = String(i);
    dirty = true;
  }
  const highlightMat = new THREE_.MeshStandardMaterial({ color: 0xf7f4ee, roughness: 0.3, emissive: 0x22c4a3, emissiveIntensity: 0.28 });

  function renderInfo(i) {
    const d = TEETH[i];
    if (!d || !infoEl) return;
    infoEl.innerHTML =
      '<span class="role-badge">' + d.role + "</span>" +
      "<h3>" + d.name + "</h3>" +
      '<p class="muted">' + d.does + "</p>" +
      "<p style=\"font-weight:600;margin-top:12px;\">Common problems</p><ul>" +
      d.problems.map((p) => "<li>" + p + "</li>").join("") +
      "</ul>" +
      '<div class="treat-links"><p style="font-size:.8rem;color:var(--ink-3);margin-bottom:4px;">Treatments we offer</p>' +
      d.treatments.map((t) => '<a href="' + t[1] + '">' + t[0] + " →</a>").join("") +
      "</div>";
  }

  // pointer interaction: drag to rotate, tap to select
  let downX = 0, downY = 0, downT = 0, dragging = false, lastX = 0;
  function onDown(e) {
    dragging = true;
    autoRotate = false;
    const p = e.touches ? e.touches[0] : e;
    downX = lastX = p.clientX;
    downY = p.clientY;
    downT = performance.now();
    velocity = 0;
  }
  function onMove(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    const dx = p.clientX - lastX;
    lastX = p.clientX;
    group.rotation.y += dx * 0.01;
    velocity = dx * 0.01;
    lastInteract = performance.now();
    dirty = true;
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    const p = e.changedTouches ? e.changedTouches[0] : e;
    const moved = Math.abs(p.clientX - downX) + Math.abs(p.clientY - downY);
    const dt = performance.now() - downT;
    if (moved < 8 && dt < 320) pickAt(p.clientX, p.clientY);
    lastInteract = performance.now();
  }
  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    if (hits.length) selectTooth(hits[0].object.userData.index);
  }

  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: true });
  canvas.addEventListener("touchmove", onMove, { passive: true });
  canvas.addEventListener("touchend", onUp);

  if (selectEl) {
    TEETH.forEach((d, i) => {
      const o = document.createElement("option");
      o.value = String(i);
      o.textContent = d.name;
      selectEl.appendChild(o);
    });
    selectEl.addEventListener("change", () => selectTooth(parseInt(selectEl.value, 10)));
  }

  function frame() {
    if (running) {
      const idle = performance.now() - lastInteract > 4000;
      if (idle) autoRotate = true;
      if (autoRotate && !dragging) {
        group.rotation.y += 0.0035;
        dirty = true;
      } else if (!dragging && Math.abs(velocity) > 0.0002) {
        group.rotation.y += velocity;
        velocity *= 0.94;
        dirty = true;
      }
      if (dirty) {
        renderer.render(scene, camera);
        dirty = false;
      }
    }
    requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);
  selectTooth(5); // start on a central incisor
  renderer.render(scene, camera);
  requestAnimationFrame(frame);

  return {
    setRunning(v) {
      running = v;
      if (v) {
        dirty = true;
        lastInteract = performance.now();
      }
    },
    resize,
  };
}
