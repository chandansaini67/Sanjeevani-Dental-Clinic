// Info-card data for the 14 upper teeth in the real arch GLB, keyed by FDI node name.
// Grouped by tooth type; the arch explorer looks up by the GLB node's name (t11–t27).

const INCISOR = {
  role: "Incisor",
  does: "Bites and cuts into food; the most visible teeth in your smile.",
  problems: ["Chips or trauma", "Gaps between front teeth", "Yellowing / staining"],
  treatments: [["Teeth whitening", "/services/teeth-whitening/"], ["Braces & aligners", "/services/braces-aligners/"], ["Crown", "/services/crowns-bridges/"]],
};
const CANINE = {
  role: "Canine",
  does: "The pointed 'corner' tooth that grips and tears food.",
  problems: ["High-set or prominent canines", "Cavities near the gum", "Staining"],
  treatments: [["Braces & aligners", "/services/braces-aligners/"], ["Teeth whitening", "/services/teeth-whitening/"]],
};
const PREMOLAR = {
  role: "Premolar",
  does: "Tears and crushes food and supports the width of your smile.",
  problems: ["Cavities between teeth", "Old fillings that fail", "Crowding needing braces"],
  treatments: [["Cleaning & check-up", "/services/teeth-cleaning-checkup/"], ["Braces & aligners", "/services/braces-aligners/"], ["Crown", "/services/crowns-bridges/"]],
};
const MOLAR = {
  role: "Molar",
  does: "Grinds and crushes food with its broad, cusped surface.",
  problems: ["Deep pit-and-fissure cavities", "Cracks from hard chewing", "Infection reaching the nerve"],
  treatments: [["Root canal", "/services/root-canal-treatment/"], ["Crown", "/services/crowns-bridges/"], ["Extraction", "/services/wisdom-tooth-extraction/"]],
};

const side = (name, dp) => ({ name, ...dp });

export const TOOTH_INFO = {
  t17: side("Upper right second molar", MOLAR),
  t16: side("Upper right first molar", MOLAR),
  t15: side("Upper right second premolar", PREMOLAR),
  t14: side("Upper right first premolar", PREMOLAR),
  t13: side("Upper right canine", CANINE),
  t12: side("Upper right lateral incisor", INCISOR),
  t11: side("Upper right central incisor", INCISOR),
  t21: side("Upper left central incisor", INCISOR),
  t22: side("Upper left lateral incisor", INCISOR),
  t23: side("Upper left canine", CANINE),
  t24: side("Upper left first premolar", PREMOLAR),
  t25: side("Upper left second premolar", PREMOLAR),
  t26: side("Upper left first molar", MOLAR),
  t27: side("Upper left second molar", MOLAR),
};

// Left→right display order for the a11y <select> mirror.
export const TOOTH_ORDER = ["t17", "t16", "t15", "t14", "t13", "t12", "t11", "t21", "t22", "t23", "t24", "t25", "t26", "t27"];
