// Experience B — scroll-scrubbed story: healthy → cavity → root canal → crown.
// Driven by a GSAP ScrollTrigger timeline (passed in). Renders on demand.
import * as THREE from "three";
import { molarWithRoots, pulp, MATERIALS, setupStage } from "./tooth-factory.js";

export function createDecayStory(THREE_, { stage, canvas, chapters, progressEl, gsap, ScrollTrigger, reducedMotion }) {
  const scene = new THREE_.Scene();
  const camera = new THREE_.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.3, 6.2);
  camera.lookAt(0, 0.1, 0);
  setupStage(THREE_, scene);

  const renderer = new THREE_.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE_.ACESFilmicToneMapping;
  renderer.localClippingEnabled = true;

  const group = new THREE_.Group();
  scene.add(group);

  const enamel = MATERIALS.enamel();
  const clipPlane = new THREE_.Plane(new THREE_.Vector3(-1, 0, 0), 1.2); // hidden initially (nothing clipped)
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

  function setChapter(idx) {
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

  resize();
  window.addEventListener("resize", resize);
  apply();
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  if (reducedMotion || !gsap || !ScrollTrigger) {
    // static: show healthy tooth, first chapter, and let CSS step list carry the story
    setChapter(0);
    return { setRunning(v) { running = v; if (v) dirty = true; }, resize };
  }

  // Build the scrubbed timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage.closest("[data-story-trigger]") || stage,
      start: "top top",
      end: "+=320%",
      scrub: 1,
      pin: stage.closest(".story-stage-col") || stage,
      anticipatePin: 1,
      onUpdate: () => {},
    },
  });
  tl.eventCallback("onUpdate", apply);

  // Chapter 1: healthy show-off rotation
  tl.to(state, { rot: Math.PI * 0.5, duration: 1, onStart: () => setChapter(0), onReverseComplete: () => setChapter(0) });
  // Chapter 2: cavity forms
  tl.to(state, { decay: 1, dull: 1, rot: Math.PI * 0.8, duration: 1, onStart: () => setChapter(1) });
  // Chapter 3: root canal — clip open, clean pulp, fill gutta
  tl.addLabel("rct").to(state, { clip: -0.2, duration: 0.5, onStart: () => setChapter(2) })
    .to(state, { pulpRed: 0, duration: 0.5 })
    .to(state, { guttaFill: 1, duration: 0.6 });
  // Chapter 4: crown descends + glow
  tl.to(state, { clip: 1.2, duration: 0.4, onStart: () => setChapter(3) })
    .to(state, { crownY: 0, duration: 0.6 })
    .to(state, { crownGlow: 0.6, duration: 0.3 })
    .to(state, { crownGlow: 0.15, duration: 0.3 });

  return {
    setRunning(v) { running = v; if (v) dirty = true; },
    resize,
  };
}
