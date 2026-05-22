import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = [
  Deno.env.get("SITE_URL") || "",
  
].filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

interface AchatPublicResponse {
  success: boolean;
  rcUrl?: string;
  pageUrl?: string;
  error?: string;
}

function extractPCSLID(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('PCSLID');
  } catch {
    const match = url.match(/PCSLID[=:]([^&\s]+)/i);
    return match ? match[1] : null;
  }
}

function findRCLink(html: string, baseUrl: string): string | null {
  const patterns = [
    /<a[^>]*href=["']([^"']*règlement[^"']*)["'][^>]*>/gi,
    /<a[^>]*href=["']([^"']*)["'][^>]*>(?:[^<]*règlement[^<]*)<\/a>/gi,
    /onclick=["'](?:window\.)?(?:open|location\.href)\s*=?\s*["']([^"']*règlement[^"']*)["']/gi,
    /<a[^>]*href=["']([^"']*)["'][^>]*title=["'][^"']*règlement[^"']*["']/gi,
    /<a[^>]*href=["']([^"']*dce[^"']*)["'][^>]*>/gi,
    /<a[^>]*href=["']([^"']*consultation[^"']*)["'][^>]*>/gi,
    /<a[^>]*href=["']([^"']*download[^"']*)["'][^>]*>(?:[^<]*règlement[^<]*)<\/a>/gi,
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(pattern)];
    for (const match of matches) {
      const link = match[1];
      if (link && !link.includes('javascript:')) {
        try {
          if (link.startsWith('http')) {
            return link;
          } else if (link.startsWith('/')) {
            return `${baseUrl}${link}`;
          } else {
            return `${baseUrl}/${link}`;
          }
        } catch (e) {
          console.error('Error processing link:', e);
          continue;
        }
      }
    }
  }

  const downloadLinks = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*class=["'][^"']*download[^"']*["'][^>]*>/gi);
  if (downloadLinks && downloadLinks.length > 0) {
    const hrefMatch = downloadLinks[0].match(/href=["']([^"']*)["']/);
    if (hrefMatch) {
      const link = hrefMatch[1];
      if (link.startsWith('http')) {
        return link;
      } else if (link.startsWith('/')) {
        return `${baseUrl}${link}`;
      } else {
        return `${baseUrl}/${link}`;
      }
    }
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }

  try {
    const url = new URL(req.url);
    const pcslid = url.searchParams.get('pcslid') || url.searchParams.get('PCSLID');
    const sourceUrl = url.searchParams.get('url');

    if (!pcslid && !sourceUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Paramètre PCSLID ou URL requis',
        } as AchatPublicResponse),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    let finalPcslid = pcslid;
    if (!finalPcslid && sourceUrl) {
      finalPcslid = extractPCSLID(sourceUrl);
    }

    if (!finalPcslid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Impossible d\'extraire le PCSLID de l\'URL',
        } as AchatPublicResponse),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const pageUrl = `https://www.achatpublic.com/sdm/ent/gen/ent_detail.do?PCSLID=${finalPcslid}`;

    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://www.achatpublic.com/',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          pageUrl,
          error: `Erreur lors de la récupération de la page: ${response.status}`,
        } as AchatPublicResponse),
        {
          status: 500,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const html = await response.text();
    const baseUrl = 'https://www.achatpublic.com';
    const rcUrl = findRCLink(html, baseUrl);

    if (rcUrl) {
      return new Response(
        JSON.stringify({
          success: true,
          rcUrl,
          pageUrl,
        } as AchatPublicResponse),
        {
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          pageUrl,
          error: 'Lien du règlement de consultation non trouvé sur la page',
        } as AchatPublicResponse),
        {
          status: 404,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  } catch (error) {
    console.error('Error in fetch-rc-achatpublic:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Erreur interne',
      } as AchatPublicResponse),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req),
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
