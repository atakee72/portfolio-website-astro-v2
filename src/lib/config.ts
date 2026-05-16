/**
 * Feature flags. SHOW_TESTIMONIALS is off in v1 because the repo's
 * testimonial content is placeholder lorem. Flip back on once real
 * quotes land.
 *
 * AVAILABILITY drives the "● available for projects" line in About.
 * Flip to false when the user lands FT employment.
 */

export const FEATURES = {
  SHOW_TESTIMONIALS: false,
  AVAILABILITY: true,
} as const;
