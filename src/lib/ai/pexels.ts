/**
 * Pexels API Integration
 * Searches for free stock photos for course images
 */

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

/**
 * Search Pexels for a single image
 */
export async function searchPexelsImage(
  query: string,
  apiKey: string,
  perPage: number = 1
): Promise<PexelsPhoto | null> {
  if (!apiKey) return null;

  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', perPage.toString());
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) return null;

    const data: PexelsSearchResponse = await response.json();
    return data.photos?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Search Pexels for multiple images
 */
export async function searchPexelsImages(
  query: string,
  apiKey: string,
  perPage: number = 12
): Promise<PexelsPhoto[]> {
  if (!apiKey) return [];

  try {
    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', perPage.toString());
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
    });

    if (!response.ok) return [];

    const data: PexelsSearchResponse = await response.json();
    return data.photos || [];
  } catch {
    return [];
  }
}

/**
 * Batch search for multiple image queries
 */
export async function batchSearchPexelsImages(
  hints: string[],
  apiKey: string
): Promise<Map<string, PexelsPhoto | null>> {
  const results = new Map<string, PexelsPhoto | null>();
  const batchSize = 5;

  for (let i = 0; i < hints.length; i += batchSize) {
    const batch = hints.slice(i, i + batchSize);
    const promises = batch.map((hint) => searchPexelsImage(hint, apiKey));
    const batchResults = await Promise.all(promises);

    batch.forEach((hint, index) => {
      results.set(hint, batchResults[index]);
    });

    if (i + batchSize < hints.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Get optimal image URL for course content
 */
export function getOptimalImageUrl(photo: PexelsPhoto): string {
  return photo.src.large;
}

/**
 * Format photo credit
 */
export function formatPhotoCredit(photo: PexelsPhoto): string {
  return `Photo by ${photo.photographer} on Pexels`;
}
