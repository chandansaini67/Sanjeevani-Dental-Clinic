// Experience B — scroll-scrubbed story: healthy → cavity → root canal → crown.
// Driven by a GSAP ScrollTrigger timeline (passed in). Renders on demand.
import * as THREE from "three";
import { molarWithRoots, pulp, MATERIALS, applyStudioEnv } from "./tooth-factory.js";

export function createDecayStory(THREE_, { stage, canvas, chapters, progressEl, gsap, ScrollTrigger, reducedMotion, models }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.3, 6.2);
  camera.lookAt(0, 0.1, 0);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.localClippingEnabled = true;
  applyStudioEnv(THREE_, renderer, scene, { shadow: false });

  const group = new THREE_.Group();
  scene.add(group);

  const enamel = MATERIALS.enamel();
  const clipPlane = new THREE_.Plane(new THREE_.Vector3(-1, 0, 0), 1.2); // hidden initially (nothing clipped)
  // Procedural cusped molar — its pulp/gutta cross-section is tuned to these exact
  // dimensions, so the root-canal reveal stays aligned; physical enamel + studio env
  // give it the same premium finish as the real-teeth arch.
  const tooth = new THREE_.Mesh(molarWithRoots(THREE_), enamel);
  group.add(tooth);

  // decay blob (grows in chapter 2)
  const decay = new THREE_.Mesh(new THREE_.SphereGeometry(0.22, 10, 8), MATERIALS.decay());
  decay.position.set(0.22, 0.95, 0.34);
  decay.scale.setScalar(0.001);
  group.add(decay);

  // pulp (revealed via clipping in chapter 3)
  const pulpMesh = new THREE_.Mesh(pulp(THREE_), MATERIALS.pulp());
  pulpMesh.visible = false;
  group.add(pulpMesh);

  // gutta-percha fill (rises during RCT)
  const guttaMat = MATERIALS.gutta();
  const gutta = new THREE_.Mesh(pulp(THREE_), guttaMat);
  gutta.visible = false;
  group.add(gutta);

  // crown cap (descends in chapter 4)
  const cap = new THREE_.Mesh(molarWithRoots(THREE_), MATERIALS.crown());
  // use only the crown portion visually by scaling flat vertically toward crown
  cap.scale.set(1.04, 1.04, 1.04);
  cap.position.y = 4;
  cap.visible = false;
  group.add(cap);

  let dirty = true;
  let running = false;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }

  const state = { rot: 0, decay: 0, dull: 0, clip: 1.2, pulpRed: 1, guttaFill: 0, crownY: 4, crownGlow: 0 };
  function apply() {
    group.rotation.y = state.rot;
    decay.scale.setScalar(Math.max(0.001, state.decay));
    // dull the enamel as decay grows
    enamel.color.setRGB(
      0.968 - state.dull * 0.06,
      0.957 - state.dull * 0.09,
      0.933 - state.dull * 0.12
    );
    // clipping reveal for the cross-section
    const clipping = state.clip < 1.19;
    enamel.clippingPlanes = clipping ? [clipPlane] : null;
    clipPlane.constant = state.clip;
    pulpMesh.visible = clipping;
    pulpMesh.material.color.setRGB(0.85 * state.pulpRed + 0.2 * (1 - state.pulpRed), 0.25 + 0.2 * (1 - state.pulpRed), 0.25 + 0.2 * (1 - state.pulpRed));
    gutta.visible = clipping && state.guttaFill > 0.01;
    gutta.scale.y = Math.max(0.001, state.guttaFill);
    gutta.position.y = -1.05 * (1 - state.guttaFill) * 0.5;
    cap.visible = state.crownY < 3.9;
    cap.position.y = state.crownY;
    cap.material.emissive = new THREE_.Color(0x22c4a3);
    cap.material.emissiveIntensity = state.crownGlow;
    dirty = true;
  }

  let activeChapter = -1;
  function setChapter(idx) {
    if (idx === activeChapter) return; // idempotent — cheap to call every scroll tick
    activeChapter = idx;
    chapters.forEach((c, i) => c.classList.toggle("active", i === idx));
    if (progressEl) progressEl.querySelectorAll("span").forEach((s, i) => s.classList.toggle("on", i <= idx));
  }

  function render() {
    if (running && dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
    requestAnimationFrame(render);
  }

  // Local 0→1 ramp for a sub-range of the overall scroll progress.
  const band = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));

  // ALL scene state is a pure function of scroll progress p (0..1) — scrub-safe in both
  // directions, and correct even if the page is reloaded mid-section.
  function applyProgress(p) {
    const cavity = band(p, 0.25, 0.5);   // chapter 2
    const rct = band(p, 0.5, 0.8);       // chapter 3
    const crown = band(p, 0.8, 1.0);     // chapter 4
    state.rot = p * Math.PI * 0.9;
    state.decay = cavity;
    state.dull = cavity;
    // chapter 3: clip sweeps open (1.2→-0.2), pulp cleaned (red→grey), gutta fills bottom-up
    state.clip = crown > 0 ? -0.2 + crown * 1.4 : 1.2 - band(p, 0.5, 0.62) * 1.4;
    state.pulpRed = 1 - band(p, 0.58, 0.72);
    state.guttaFill = band(p, 0.68, 0.8);
    // chapter 4: crown descends and gives a brief mint glow pulse
    state.crownY = 4 - crown * 4;
    state.crownGlow = crown < 0.7 ? crown * 0.6 : Math.max(0.15, 0.6 - (crown - 0.7) * 1.5);
    apply();
    // derive chapter from thresholds — captions/dots always match, both scroll directions
    setChapter(p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.8 ? 2 : 3);
  }

  resize();
  window.addEventListener("resize", resize);
  applyProgress(0);
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  if (reducedMotion || !gsap || !ScrollTrigger) {
    // static: healthy tooth + first chapter; the CSS step list carries the story
    setChapter(0);
    return { setRunning(v) { running = v; if (v) dirty = true; }, resize };
  }

  const st = ScrollTrigger.create({
    trigger: stage.closest("[data-story-trigger]") || stage,
    start: "top top",
    end: "+=320%",
    scrub: 1,
    pin: stage.closest(".story-stage-col") || stage,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => applyProgress(self.progress),
    onRefresh: (self) => applyProgress(self.progress),
  });

  // The stage lazy-inits after load, so the pin was measured against a pre-ready layout —
  // recalc once the next frame, and on debounced resize.
  requestAnimationFrame(() => ScrollTrigger.refresh());
  let rt;
  window.addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => ScrollTrigger.refresh(), 200);
  });

  return {
    setRunning(v) { running = v; if (v) dirty = true; },
    resize,
    destroy() { st && st.kill(); },
  };
}
