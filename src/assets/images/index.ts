import heroSpaAmbiance from './hero_spa_ambiance_1792632796767.jpg';
import productHerbalSerum from './product_herbal_serum_1792632798964.jpg';
import serviceBodyScrub from './service_body_scrub_1792632798359.jpg';
import serviceFacialTreatment from './service_facial_treatment_1792632797197.jpg';
import serviceMassageTherapy from './service_massage_therapy_1792632798168.jpg';

export const IMAGES = {
  heroSpaAmbiance,
  productHerbalSerum,
  serviceBodyScrub,
  serviceFacialTreatment,
  serviceMassageTherapy,
};

/**
 * Normalizes any image URL. If it's a legacy or unbundled string path like
 * '/src/assets/images/...' (which fails when deployed to Vercel/production),
 * it maps to the Vite-bundled asset import or public path.
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return serviceFacialTreatment;
  if (url.includes('hero_spa_ambiance')) return heroSpaAmbiance;
  if (url.includes('product_herbal_serum')) return productHerbalSerum;
  if (url.includes('service_body_scrub')) return serviceBodyScrub;
  if (url.includes('service_facial_treatment')) return serviceFacialTreatment;
  if (url.includes('service_massage_therapy')) return serviceMassageTherapy;
  return url;
}

export default IMAGES;
