// Canonical public paths matching /public/assets/images/
// This ensures images load identically in Vite dev, Vite production build, Vercel deployment,
// and inside Node.js server without triggering ERR_UNKNOWN_FILE_EXTENSION on .jpg imports.
export const IMAGES = {
  heroSpaAmbiance: '/assets/images/hero_spa_ambiance_1792632796767.jpg',
  productHerbalSerum: '/assets/images/product_herbal_serum_1792632798964.jpg',
  serviceBodyScrub: '/assets/images/service_body_scrub_1792632798359.jpg',
  serviceFacialTreatment: '/assets/images/service_facial_treatment_1792632797197.jpg',
  serviceMassageTherapy: '/assets/images/service_massage_therapy_1792632798168.jpg',
};

/**
 * Normalizes any image URL. If it's a legacy or unbundled string path like
 * '/src/assets/images/...' (which fails when deployed to Vercel/production),
 * it maps to the public path in /assets/images/...
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return IMAGES.serviceFacialTreatment;
  if (url.includes('hero_spa_ambiance')) return IMAGES.heroSpaAmbiance;
  if (url.includes('product_herbal_serum')) return IMAGES.productHerbalSerum;
  if (url.includes('service_body_scrub')) return IMAGES.serviceBodyScrub;
  if (url.includes('service_facial_treatment')) return IMAGES.serviceFacialTreatment;
  if (url.includes('service_massage_therapy')) return IMAGES.serviceMassageTherapy;
  return url;
}

export default IMAGES;
