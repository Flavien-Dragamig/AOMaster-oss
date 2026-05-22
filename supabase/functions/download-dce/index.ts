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

interface DownloadRequest {
  refConsultation: string;
  orgAcronyme: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }

  try {
    const { refConsultation, orgAcronyme }: DownloadRequest = await req.json();

    if (!refConsultation || !orgAcronyme) {
      return new Response(
        JSON.stringify({
          error: "refConsultation et orgAcronyme sont requis"
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
    const consultationUrl = `${baseUrl}/index.php?page=Entreprise.EntrepriseDetailsConsultation&refConsultation=${refConsultation}&orgAcronyme=${orgAcronyme}`;

    const acceptFormData = new URLSearchParams({
      'page': 'Entreprise.EntrepriseDetailsConsultation',
      'refConsultation': refConsultation,
      'orgAcronyme': orgAcronyme,
      'AcceptCGU': '1',
      'ACGUAnon': 'Accepter'
    });

    const acceptResponse = await fetch(consultationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': consultationUrl,
        'Origin': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: acceptFormData.toString(),
      redirect: 'follow'
    });

    if (!acceptResponse.ok) {
      throw new Error(`Échec de l'acceptation des CGU: ${acceptResponse.status}`);
    }

    const downloadUrl = `${baseUrl}/index.php?page=Entreprise.EntrepriseDownloadDce&refConsultation=${refConsultation}&orgAcronyme=${orgAcronyme}`;

    const downloadResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Referer': consultationUrl,
        'Origin': baseUrl,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      redirect: 'follow'
    });

    if (!downloadResponse.ok) {
      throw new Error(`Échec du téléchargement: ${downloadResponse.status}`);
    }

    const contentType = downloadResponse.headers.get('content-type') || 'application/zip';
    const contentDisposition = downloadResponse.headers.get('content-disposition') ||
      `attachment; filename="DCE_${refConsultation}.zip"`;

    const arrayBuffer = await downloadResponse.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
      },
    });

  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erreur inconnue lors du téléchargement"
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
