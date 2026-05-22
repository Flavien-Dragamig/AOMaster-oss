export function isAchatPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.toLowerCase().includes('achatpublic.com');
}

export function extractPCSLID(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pcslid = urlObj.searchParams.get('PCSLID') || urlObj.searchParams.get('pcslid');
    if (pcslid) return pcslid;
  } catch (e) {
  }

  const match = url.match(/PCSLID[=:]([^&\s]+)/i);
  return match ? match[1] : null;
}

export async function fetchAchatPublicRC(url: string): Promise<{
  success: boolean;
  rcUrl?: string;
  pageUrl?: string;
  error?: string;
}> {
  const pcslid = extractPCSLID(url);

  if (!pcslid) {
    return {
      success: false,
      error: 'Impossible d\'extraire le PCSLID de l\'URL',
    };
  }

  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-rc-achatpublic`;
    const response = await fetch(`${apiUrl}?pcslid=${encodeURIComponent(pcslid)}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.error || `Erreur HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AchatPublic RC:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la récupération du lien',
    };
  }
}

export function openAchatPublicPage(url: string): void {
  const pcslid = extractPCSLID(url);

  if (!pcslid) {
    alert('Impossible d\'extraire le PCSLID de l\'URL');
    return;
  }

  const pageUrl = `https://www.achatpublic.com/sdm/ent/gen/ent_detail.do?PCSLID=${pcslid}`;
  window.open(pageUrl, '_blank', 'noopener,noreferrer');
}
