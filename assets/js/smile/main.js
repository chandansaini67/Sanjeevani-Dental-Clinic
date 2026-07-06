// Smile Studio orchestrator: capability gate → observers registered synchronously →
// Three.js + the experience module load lazily on first intersection (no init race).
// If anything is unsupported, add body.no-3d and let CSS show the static fallbacks.

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) {
    return false;
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData = navigator.connection && navigator.connection.saveData;

function fail() {
  document.body.classList.add("no-3d");
}

// Shared, memoized loader for THREE — only fetched once, only if a stage is reached.
let threePromise = null;
function loadThree() {
  if (!threePromise) threePromise = import("three");
  return threePromise;
}

// Shared, memoized loader for the real anatomical arch GLB (14 named teeth t11–t27).
// Returns the parsed gltf.scene; each experience clones the nodes it needs.
let modelsPromise = null;
function loadModels(THREE) {
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/libs/meshopt_decoder.module.js"),
    ]).then(
      ([{ GLTFLoader }, { MeshoptDecoder }]) =>
        new Promise((resolve, reject) => {
          new GLTFLoader()
            .setMeshoptDecoder(MeshoptDecoder)
            .load("/assets/models/smile-arch.glb", (gltf) => resolve(gltf.scene), undefined, reject);
        })
    );
  }
  return modelsPromise;
}

if (saveData || !webglOK()) {
  fail();
} else {
  setup();
}

function setup() {
  // Register each stage's observer immediately — no waiting on CDN.
  lazyStage("#stage-explorer", async (THREE, stage) => {
    const [{ createArchExplorer }, models] = await Promise.all([
      import("./arch-explorer.js"),
      loadModels(THREE),
    ]);
    return createArchExplorer(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      infoEl: document.getElementById("tooth-info"),
      selectEl: document.getElementById("tooth-select"),
      models,
    });
  });

  lazyStage("#stage-story", async (THREE, stage) => {
    // Read GSAP at intersection time — guaranteed present by then (scroll happens well
    // after the deferred GSAP scripts run), independent of head script ordering.
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    if (gsap && ScrollTrigger) {
      try {
        gsap.registerPlugin(ScrollTrigger);
      } catch (e) {}
    }
    const [{ createDecayStory }, models] = await Promise.all([
      import("./decay-story.js"),
      loadModels(THREE),
    ]);
    return createDecayStory(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      chapters: Array.from(document.querySelectorAll("[data-chapter]")),
      progressEl: document.getElementById("story-progress"),
      gsap,
      ScrollTrigger,
      reducedMotion,
      models,
    });
  });

  lazyStage("#stage-braces", async (THREE, stage) => {
    const [{ createBracesMorph }, models] = await Promise.all([
      import("./braces-morph.js"),
      loadModels(THREE),
    ]);
    return createBracesMorph(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      range: document.getElementById("braces-range"),
      models,
    });
  });
}

function lazyStage(sel, make) {
  const stage = document.querySelector(sel);
  if (!stage) return;
  let inst = null;
  let initing = false;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (inst) {
            inst.setRunning(true);
          } else if (!initing) {
            initing = true;
            loadThree()
              .then((THREE) => make(THREE, stage))
              .then((created) => {
                inst = created;
                if (inst) {
                  stage.classList.add("ready");
                  inst.resize();
                  inst.setRunning(true);
                }
              })
              .catch((e) => {
                console.warn("Smile Studio init failed for", sel, e);
                fail();
              });
          }
        } else if (inst) {
          inst.setRunning(false);
        }
      });
    },
    { rootMargin: "250px" }
  );
  io.observe(stage);
}
