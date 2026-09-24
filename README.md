# HT-Maintenance — Consignations & plans de prévention

Attestations de consignation (NF C18-510), plans de prévention, base clients/contacts, PDF et envoi par mail.
React + Vite + Tailwind v4, Firebase (projet `ht-maintenance`).

Collections Firestore : `ht-consignation-docs`, `ht-consignation-clients`, `ht-consignation/parametres`.

    npm install
    npm run dev      # test en local (l'envoi direct passe par Vercel ; "Ouvrir dans Mail" fonctionne partout)
    npm run build

## Envoi par mail (fonction api/send-mail.js, service Resend)
1. Créer un compte sur resend.com, vérifier son domaine (Domains), créer une clé API.
2. Vercel > projet > Settings > Environment Variables :
   - RESEND_API_KEY = re_…
   - MAIL_FROM = HT-Maintenance <documents@votre-domaine.fr>
   - MAIL_REPLY_TO = votre adresse (facultatif)
3. Redéployer.

## Firebase
- Règles : voir firestore.rules (ne pas écraser des règles déjà plus complètes).
- Authentication > Domaines autorisés : ajouter le domaine Vercel de l'app.
