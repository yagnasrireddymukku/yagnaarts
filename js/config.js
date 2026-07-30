/**
 * Third-party integration configuration for form submissions.
 *
 * ALL VALUES BELOW ARE PLACEHOLDERS. The site works and forms still reach
 * the customer via the WhatsApp handoff even before you fill these in —
 * see docs/phase-11-forms-integration.md for the exact setup steps for
 * each service. Replace every "YOUR_..." value with your real credentials.
 */

export const INTEGRATIONS_CONFIG = {
  emailjs: {
    // https://dashboard.emailjs.com/admin/account -> General -> Public Key
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
    // https://dashboard.emailjs.com/admin -> Email Services
    serviceId: 'YOUR_EMAILJS_SERVICE_ID',
    // https://dashboard.emailjs.com/admin/templates — one template is reused
    // for every form; {{form_type}} in the template body tells you which.
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
  },
  googleSheets: {
    // The /exec URL you get after deploying scripts/google-apps-script.gs
    // as a Web App (Deploy -> New deployment -> Web app -> Anyone can access).
    webAppUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  },
  whatsapp: {
    // Business WhatsApp number in E.164 format, digits only, no "+".
    // Must match the number used in src/components/footer.html and mobile-menu.html.
    businessNumber: '910000000000',
  },
};

export function isConfigured(value) {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('YOUR_');
}
