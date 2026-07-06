// Experience A — rotatable REAL dental arch (14 anatomical teeth from the GLB).
// Drag to rotate; tap a tooth (raycast against light bbox proxies) → info card.
import { MATERIALS, applyStudioEnv } from "./tooth-factory.js";
import { TOOTH_INFO, TOOTH_ORDER } from "./tooth-data.js";

export function createArchExplorer(THREE_, { stage, canvas, infoEl, selectEl, models }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 5.4, 6.6);
  camera.lookAt(0, -0.3, 0);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  applyStudioEnv(THREE_, renderer, scene, { shadowY: -2.6, shadowSize: 9 });

  // Turntable group (spins around anatomical vertical); arch child is recentered below.
  const group = new THREE_.Group();
  scene.add(group);
  const arch = new THREE_.Group();
  group.add(arch);

  const enamel = MATERIALS.enamel();
  const highlightMat = enamel.clone();
  highlightMat.emissive = new THREE_.Color(0x22c4a3);
  highlightMat.emissiveIntensity = 0.35;

  // Clone the 14 named teeth from the loaded GLB into the arch group.
  const meshes = [];
  const proxies = [];
  for (const name of TOOTH_ORDER) {
    const src = models.getObjectByName(name);
    if (!src) continue;
    const mesh = src.clone();
    mesh.material = enamel;
    mesh.name = name;
    arch.add(mesh);
    meshes.push(mesh);
  }

  // Recenter the arch on its own bounding box so rotation spins around its middle.
  const bb = new THREE_.Box3().setFromObject(arch);
  const center = new THREE_.Vector3();
  bb.getCenter(center);
  arch.position.sub(center);

  // Light invisible bbox proxies for instant raycasting (avoid hitting ~35k tris).
  for (const mesh of meshes) {
    const b = new THREE_.Box3().setFromObject(mesh);
    const size = new THREE_.Vector3();
    const c = new THREE_.Vector3();
    b.getSize(size);
    b.getCenter(c);
    const proxy = new THREE_.Mesh(
      new THREE_.BoxGeometry(size.x, size.y, size.z),
      new THREE_.MeshBasicMaterial({ visible: false })
    );
    proxy.position.copy(c);
    proxy.userData.name = mesh.name;
    arch.add(proxy);
    proxies.push(proxy);
  }

  // Procedural gum ridge following the arch, seated at the root ends (hides raw root tips).
  const gumCurvePts = meshes
    .map((m) => {
      const c = new THREE_.Vector3();
      new THREE_.Box3().setFromObject(m).getCenter(c);
      return c;
    })
    .sort((a, b) => a.x - b.x)
    .map((p) => new THREE_.Vector3(p.x, bb.max.y - center.y - 0.15, p.z));
  if (gumCurvePts.length > 3) {
    const curve = new THREE_.CatmullRomCurve3(gumCurvePts, false, "catmullrom", 0.4);
    const gum = new THREE_.Mesh(new THREE_.TubeGeometry(curve, 64, 0.62, 12, false), MATERIALS.gum());
    arch.add(gum);
  }

  const raycaster = new THREE_.Raycaster();
  const pointer = new THREE_.Vector2();
  let selected = null;
  let dirty = true;
  let running = false;
  let autoRotate = true;
  let lastInteract = performance.now();
  let velocity = 0;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function selectTooth(name) {
    selected = name;
    meshes.forEach((m) => (m.material = m.name === name ? highlightMat : enamel));
    renderInfo(name);
    if (selectEl) selectEl.value = name;
    dirty = true;
  }

  function renderInfo(name) {
    const d = TOOTH_INFO[name];
    if (!d || !infoEl) return;
    infoEl.innerHTML =
      '<span class="role-badge">' + d.role + "</span>" +
      "<h3>" + d.name + "</h3>" +
      '<p class="muted">' + d.does + "</p>" +
      '<p style="font-weight:600;margin-top:12px;">Common problems</p><ul>' +
      d.problems.map((p) => "<li>" + p + "</li>").join("") +
      "</ul>" +
      '<div class="treat-links"><p style="font-size:.8rem;color:var(--ink-3);margin-bottom:4px;">Treatments we offer</p>' +
      d.treatments.map((t) => '<a href="' + t[1] + '">' + t[0] + " →</a>").join("") +
      "</div>";
  }

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
    if (moved < 8 && performance.now() - downT < 320) pickAt(p.clientX, p.clientY);
    lastInteract = performance.now();
  }
  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(proxies, false);
    if (hits.length) selectTooth(hits[0].object.userData.name);
  }

  canvas.addEventListener("mousedown", onDown);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onUp);
  canvas.addEventListener("touchstart", onDown, { passive: true });
  canvas.addEventListener("touchmove", onMove, { passive: true });
  canvas.addEventListener("touchend", onUp);

  if (selectEl) {
    TOOTH_ORDER.forEach((name) => {
      const o = document.createElement("option");
      o.value = name;
      o.textContent = TOOTH_INFO[name].name;
      selectEl.appendChild(o);
    });
    selectEl.addEventListener("change", () => selectTooth(selectEl.value));
  }

  function frame() {
    if (running) {
      if (performance.now() - lastInteract > 4000) autoRotate = true;
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
  selectTooth("t11"); // start on a central incisor
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
