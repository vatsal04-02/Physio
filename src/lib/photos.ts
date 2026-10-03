import type { ImageMetadata } from 'astro';

/**
 * Real clinic photography is picked up by filename from src/assets/clinic/.
 * Slots: hero, exterior, reception, treatment-room, equipment, signage,
 *        doctor-sandeep, doctor-mahesh  (.jpg .jpeg .png .webp .avif)
 *
 * No stock or generated imagery is ever substituted — an empty slot renders a clearly
 * marked placeholder instead.
 */
const files = import.meta.glob<{ default: ImageMetadata }>('/src/assets/clinic/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
});

const bySlot = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const slot = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  bySlot.set(slot, mod.default);
}

export function getPhoto(slot: string): ImageMetadata | undefined {
  return bySlot.get(slot);
}
