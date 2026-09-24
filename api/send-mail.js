// Fonction Vercel : envoi d'un document PDF par mail via Resend (https://resend.com)
// Variables d'environnement à définir dans Vercel > Settings > Environment Variables :
//   RESEND_API_KEY  clé API Resend (re_…)
//   MAIL_FROM       expéditeur, ex. "HT-Maintenance <documents@votre-domaine.fr>" (domaine vérifié dans Resend)
//   MAIL_REPLY_TO   (facultatif) adresse de réponse ; par défaut l'e-mail du compte connecté

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDDA5cCPZO2Wjfx-8YP4WFJQIUVIc-Qqb0";
const isEmail = (e) => typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });

  const { RESEND_API_KEY, MAIL_FROM, MAIL_REPLY_TO } = process.env;
  if (!RESEND_API_KEY || !MAIL_FROM) {
    return res.status(500).json({ error: "Envoi non configuré : ajoutez RESEND_API_KEY et MAIL_FROM dans les variables d'environnement Vercel, puis redéployez." });
  }

  // Seuls les comptes connectés à l'app (Firebase) peuvent envoyer
  const idToken = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!idToken) return res.status(401).json({ error: "Connexion requise." });
  let user;
  try {
    const v = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!v.ok) return res.status(401).json({ error: "Session expirée : déconnectez-vous puis reconnectez-vous." });
    user = (await v.json()).users?.[0];
    if (!user) return res.status(401).json({ error: "Compte introuvable." });
  } catch {
    return res.status(502).json({ error: "Vérification du compte impossible. Réessayez." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const to = Array.isArray(body.to) ? body.to.filter(isEmail) : [];
  const cc = Array.isArray(body.cc) ? body.cc.filter(isEmail) : [];
  if (!to.length) return res.status(400).json({ error: "Aucun destinataire valide." });
  if (to.length + cc.length > 20) return res.status(400).json({ error: "20 destinataires maximum." });
  if (!body.content || !body.filename) return res.status(400).json({ error: "PDF manquant." });

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: MAIL_FROM,
      to,
      cc: cc.length ? cc : undefined,
      reply_to: MAIL_REPLY_TO || user.email,
      subject: String(body.subject || "Document HT-Maintenance").slice(0, 250),
      text: String(body.text || ""),
      attachments: [{ filename: String(body.filename).replace(/[\\/:*?"<>|]/g, "-"), content: body.content }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return res.status(502).json({ error: `Refusé par le service d'envoi : ${j.message || r.status}` });
  return res.status(200).json({ ok: true, id: j.id });
}
