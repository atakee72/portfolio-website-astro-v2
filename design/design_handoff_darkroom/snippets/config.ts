/**
 * Feature flags. Place at src/lib/config.ts.
 *
 * SHOW_TESTIMONIALS is off in v1 because the repo's testimonial content
 * is placeholder lorem. Flip back on once real quotes are collected.
 */

export const FEATURES = {
  SHOW_TESTIMONIALS: false,
} as const;
