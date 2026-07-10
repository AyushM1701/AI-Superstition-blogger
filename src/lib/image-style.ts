export const IMAGE_STYLE_SUFFIX =
  'hand-drawn vintage ink sketch, woodcut illustration, alchemical style, esoteric, highly detailed, muted sepia and gold tones';

export function buildImagePrompt(subjectPrompt: string): string {
  return `${subjectPrompt}, ${IMAGE_STYLE_SUFFIX}`;
}
