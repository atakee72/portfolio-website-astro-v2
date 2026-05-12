/**
 * Feature flags. SHOW_TESTIMONIALS is off in v1 because the repo's
 * testimonial content is placeholder lorem. Flip back on once real
 * quotes land.
 */

export const FEATURES = {
  SHOW_TESTIMONIALS: false,
} as const;
