import { createClient } from 'npm:@supabase/supabase-js@2';
import { format } from 'npm:date-fns@3';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Alert {
  id: string;
  user_id: string;
  name: string;
  keywords: string[];
  cpv_codes: string[];
  departments: string[];
  frequency: 'daily' | 'weekly';
  last_run: string | null;
}

interface User {
  id: string;
  email: string;
}

async function searchContracts(alert: Alert) {
  // Implement contract search logic similar to the frontend
  // but adapted for the backend environment
  const searchResults = [];
  return searchResults;
}

async function sendAlertEmail(user: User, alert: Alert, results: any[]) {
  if (results.length === 0) return;

  const emailHtml = `
    <h2>Nouveaux marchés correspondant à votre alerte "${alert.name}"</h2>
    <p>Voici les nouveaux marchés publics qui correspondent à vos critères :</p>
    <ul>
      ${results.map(result => `
        <li>
          <h3>${result.title}</h3>
          <p>${result.description}</p>
          <p>Date limite : ${format(new Date(result.submissionDeadline), 'dd/MM/yyyy')}</p>
          <a href="${supabaseUrl}/contract/${result.source.toLowerCase()}/${result.id}">
            Voir le détail
          </a>
        </li>
      `).join('')}
    </ul>
  `;

  await supabase.auth.admin.sendEmail(user.email, {
    subject: `Nouveaux marchés pour votre alerte "${alert.name}"`,
    html: emailHtml,
  });
}

Deno.serve(async (req) => {
  try {
    // Get alerts that need to be processed
    const now = new Date();
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*')
      .or(
        `last_run.is.null,and(frequency.eq.daily,last_run.lt.${format(now, 'yyyy-MM-dd')}),and(frequency.eq.weekly,last_run.lt.${format(now, 'yyyy-MM-dd')})`
      );

    if (alertsError) throw alertsError;

    for (const alert of alerts) {
      // Get user email via admin API (auth.users is not directly queryable)
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(alert.user_id);

      if (userError || !userData.user) continue;
      const user = { id: userData.user.id, email: userData.user.email! };

      // Search for matching contracts
      const results = await searchContracts(alert);

      // Send email if there are results
      if (results.length > 0) {
        await sendAlertEmail(user, alert, results);
      }

      // Update last_run timestamp
      await supabase
        .from('alerts')
        .update({ last_run: now.toISOString() })
        .eq('id', alert.id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing alerts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});