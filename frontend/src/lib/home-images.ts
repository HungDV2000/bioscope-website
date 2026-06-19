/** Ảnh trang chủ — file local map theo example/assets/ */
const img = (name: string) => `/images/home/${name}`;

export const homeImages = {
  hero: img("hero-leaf.jpg"),
  certificates: img("certificates-wall.jpg"),
  facility: img("facility-aerial.jpg"),
  tech: {
    liposome: img("liposome.jpg"),
    microencapsulation: img("microencapsulation.jpg"),
    sprayDrying: img("spray-drying.jpg"),
  },
  solutions: {
    brain: img("brain-health.jpg"),
    beauty: img("beauty.jpg"),
    joint: img("joint.jpg"),
    cardio: img("cardio.jpg"),
    immune: img("immune.jpg"),
    digestive: img("digestive.jpg"),
  },
  ingredients: {
    curcumin: img("curcumin.jpg"),
    omega3: img("omega3.jpg"),
    collagen: img("collagen.jpg"),
    nmn: img("nmn.jpg"),
    coq10: img("coq10.jpg"),
    resveratrol: img("resveratrol.jpg"),
    ashwagandha: img("ashwagandha.jpg"),
    vitaminC: img("vitamin-c.jpg"),
    hyaluronic: img("hyaluronic-acid.jpg"),
    magnesium: img("magnesium.jpg"),
  },
  studies: {
    study1: img("study1.jpg"),
    study2: img("study2.jpg"),
    study3: img("study3.jpg"),
  },
} as const;
