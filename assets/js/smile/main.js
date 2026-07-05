// Smile Studio orchestrator: capability gate → lazy-init each experience → pause off-screen.
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

if (saveData || !webglOK()) {
  fail();
} else {
  boot();
}

async function boot() {
  let THREE;
  try {
    THREE = await import("three");
  } catch (e) {
    fail();
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) {}
  }

  const [{ createArchExplorer }, { createDecayStory }, { createBracesMorph }] = await Promise.all([
    import("./arch-explorer.js"),
    import("./decay-story.js"),
    import("./braces-morph.js"),
  ]).catch(() => {
    fail();
    return [{}, {}, {}];
  });

  if (!createArchExplorer) return;

  const instances = [];
  const lazy = (stageSel, make) => {
    const stage = document.querySelector(stageSel);
    if (!stage) return;
    let inst = null;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            if (!inst) {
              try {
                inst = make(stage);
                if (inst) {
                  instances.push(inst);
                  stage.classList.add("ready");
                  inst.resize();
                }
              } catch (e) {
                console.warn("Smile Studio init failed for", stageSel, e);
              }
            }
            if (inst) inst.setRunning(true);
          } else if (inst) {
            inst.setRunning(false);
          }
        });
      },
      { rootMargin: "200px" }
    );
    io.observe(stage);
  };

  lazy("#stage-explorer", (stage) =>
    createArchExplorer(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      infoEl: document.getElementById("tooth-info"),
      selectEl: document.getElementById("tooth-select"),
    })
  );

  lazy("#stage-story", (stage) =>
    createDecayStory(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      chapters: Array.from(document.querySelectorAll("[data-chapter]")),
      progressEl: document.getElementById("story-progress"),
      gsap,
      ScrollTrigger,
      reducedMotion,
    })
  );

  lazy("#stage-braces", (stage) =>
    createBracesMorph(THREE, {
      stage,
      canvas: stage.querySelector("canvas"),
      range: document.getElementById("braces-range"),
    })
  );
}
