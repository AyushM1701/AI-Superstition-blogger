export const IMAGE_STYLE_SUFFIX =
  'hand-drawn vintage ink sketch, woodcut illustration, alchemical style, esoteric, highly detailed, muted sepia and gold tones';

export function buildImagePrompt(subjectPrompt: string): string {
  if (subjectPrompt.includes('hand-drawn vintage ink sketch')) return subjectPrompt;
  return `${subjectPrompt}, ${IMAGE_STYLE_SUFFIX}`;
}

export function buildPollinationsImageUrl(subjectPrompt: string, width: number = 1920, height: number = 1080): string {
  const encodedPrompt = encodeURIComponent(buildImagePrompt(subjectPrompt));
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true`;
}
