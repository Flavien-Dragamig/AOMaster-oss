import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const allowedOrigins = [
  Deno.env.get("SITE_URL") || "",
  
].filter(Boolean);

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };
}

interface SearchPlaceRequest {
  reference?: string;
  buyerName?: string;
  announcementNumber?: string;
}

interface PlaceSearchResult {
  success: boolean;
  refConsultation?: string;
  orgAcronyme?: string;
  directUrl?: string;
  searchUrl?: string;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }

  try {
    const { reference, buyerName, announcementNumber }: SearchPlaceRequest = await req.json();

    if (!reference && !announcementNumber) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Une référence ou un numéro d'annonce est requis"
        }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    const baseUrl = "https://www.marches-publics.gouv.fr";
    const searchQuery = reference || announcementNumber || "";
    const searchUrl = `${baseUrl}/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnounce&reference=${encodeURIComponent(searchQuery)}`;

    const chromiumPath = Deno.env.get("PUPPETEER_EXECUTABLE_PATH") ||
                        "/usr/bin/chromium-browser";

    let browser;

    try {
      const puppeteer = await import("npm:puppeteer@23.11.1");

      browser = await puppeteer.default.launch({
        executablePath: chromiumPath,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions',
        ],
        headless: true,
      });

      const page = await browser.newPage();

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      await page.goto(searchUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      await page.waitForSelector('table.itemList, .searchResult, .resultRow', {
        timeout: 10000,
      }).catch(() => {
        console.log('Aucun sélecteur de résultat trouvé, tentative de récupération des liens...');
      });

      const results = await page.evaluate((searchRef) => {
        const links = Array.from(document.querySelectorAll('a[href*="EntrepriseDetailsConsultation"]'));

        const consultations = links.map(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = (link as HTMLElement).textContent?.trim() || '';

          const refMatch = href.match(/refConsultation=([^&]+)/);
          const orgMatch = href.match(/orgAcronyme=([^&]+)/);

          if (refMatch && orgMatch) {
            return {
              refConsultation: refMatch[1],
              orgAcronyme: orgMatch[1],
              text: text,
              href: href
            };
          }
          return null;
        }).filter(item => item !== null);

        if (consultations.length > 0) {
          if (searchRef && consultations.length > 1) {
            const exact = consultations.find(c =>
              c.text.toLowerCase().includes(searchRef.toLowerCase()) ||
              c.refConsultation.toLowerCase().includes(searchRef.toLowerCase())
            );
            return exact || consultations[0];
          }
          return consultations[0];
        }

        return null;
      }, searchQuery);

      await browser.close();

      if (!results) {
        return new Response(
          JSON.stringify({
            success: false,
            searchUrl: searchUrl,
            error: "Aucune consultation trouvée sur PLACE"
          }),
          {
            status: 404,
            headers: {
              ...getCorsHeaders(req),
              "Content-Type": "application/json",
            },
          }
        );
      }

      const directUrl = `${baseUrl}/index.php?page=Entreprise.EntrepriseDownloadDce&refConsultation=${results.refConsultation}&orgAcronyme=${results.orgAcronyme}`;

      return new Response(
        JSON.stringify({
          success: true,
          refConsultation: results.refConsultation,
          orgAcronyme: results.orgAcronyme,
          directUrl: directUrl,
          searchUrl: searchUrl
        }),
        {
          status: 200,
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );

    } catch (error) {
      if (browser) {
        await browser.close().catch(() => {});
      }
      throw error;
    }

  } catch (error) {
    console.error('Erreur lors de la recherche PLACE:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue lors de la recherche"
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      }
    );
  }
});
