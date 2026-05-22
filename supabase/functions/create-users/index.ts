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

interface CreateUserRequest {
  email: string;
  displayName?: string;
  isAdmin?: boolean;
}

interface CreateUsersRequest {
  users: CreateUserRequest[];
}

function generatePassword(): string {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+";
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(array[i] % charset.length);
  }
  return password;
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
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Verify that the requester is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: "Forbidden: Admin access required" }),
        {
          status: 403,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const { users }: CreateUsersRequest = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: users array is required" }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
        }
      );
    }

    const results = [];
    const errors = [];

    for (const userRequest of users) {
      const { email, displayName, isAdmin } = userRequest;

      if (!email || !email.includes("@")) {
        errors.push({ email, error: "Invalid email address" });
        continue;
      }

      try {
        const password = generatePassword();

        // Create user in auth.users
        const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          errors.push({ email, error: createError?.message || "Failed to create user" });
          continue;
        }

        // Update user profile created by handle_new_user trigger
        const { error: profileUpdateError } = await supabaseClient
          .from("user_profiles")
          .update({
            display_name: displayName || email.split("@")[0],
            role: isAdmin ? 'admin' : 'user',
            first_login_completed: false,
          })
          .eq("user_id", newUser.user.id);

        if (profileUpdateError) {
          // Rollback: delete the auth user
          await supabaseClient.auth.admin.deleteUser(newUser.user.id);
          errors.push({ email, error: "Failed to update user profile" });
          continue;
        }

        results.push({
          email,
          password,
          userId: newUser.user.id,
        });
      } catch (error) {
        errors.push({ email, error: error.message });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        status: 200,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  }
});
