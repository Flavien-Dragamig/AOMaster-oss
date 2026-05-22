import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(req),
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const adminPassword = Deno.env.get("ADMIN_PASSWORD");
    if (!adminEmail || !adminPassword) {
      return new Response(
        JSON.stringify({
          error: "ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans les variables d'environnement de la fonction.",
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

    // Vérifier si l'admin existe déjà
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id, email")
      .eq("email", adminEmail)
      .maybeSingle();

    if (existingProfile) {
      // Mettre à jour le rôle à admin
      await supabase
        .from("user_profiles")
        .update({ role: "admin" })
        .eq("user_id", existingProfile.user_id);

      return new Response(
        JSON.stringify({
          message: "Compte admin déjà existant, rôle mis à jour",
          email: adminEmail,
        }),
        {
          headers: {
            ...getCorsHeaders(req),
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Créer le compte admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "admin",
      },
    });

    if (authError) throw authError;

    // Le profil sera créé automatiquement par le trigger
    // Mais on doit mettre à jour le rôle à admin
    await supabase
      .from("user_profiles")
      .update({
        role: "admin",
        display_name: "Administrateur",
        first_name: "Administrateur",
      })
      .eq("user_id", authData.user.id);

    return new Response(
      JSON.stringify({
        message: "Compte administrateur créé avec succès",
        email: adminEmail,
        password: adminPassword,
        note: "Veuillez changer le mot de passe après la première connexion",
      }),
      {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error creating admin:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erreur inconnue",
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
