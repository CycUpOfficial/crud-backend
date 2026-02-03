const request = require("supertest");

const BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const API_PREFIX = process.env.API_PREFIX || "/api";
const MAIL_UI_BASE = process.env.MAIL_BASE_URL || "http://localhost:8025";

function makeTestEmail() {
  return `joan.test.${Date.now()}@abo.fi`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function extractPinFromText(text) {
  const m = String(text).match(/PIN\s+is:\s*(\d{4,8})/i) || String(text).match(/\b(\d{4,8})\b/);
  return m ? m[1] : null;
}

/**
 * Mailpit API:
 *  - GET  /api/v1/messages
 *  - GET  /api/v1/message/{id}
 */
async function fetchPinFromMailpit(email) {
  const listRes = await fetch(`${MAIL_UI_BASE}/api/v1/messages`);
  if (!listRes.ok) return null;

  const listJson = await listRes.json();
  const messages = listJson.messages || listJson || [];

  // buscamos el mensaje cuyo "To" contenga el email
  const match = messages.find((m) => {
    const to = JSON.stringify(m.To || m.to || m.toAddress || "");
    return to.includes(email);
  });

  if (!match) return null;

  const id = match.ID || match.Id || match.id;
  if (!id) return null;

  const msgRes = await fetch(`${MAIL_UI_BASE}/api/v1/message/${id}`);
  if (!msgRes.ok) return null;

  const msgJson = await msgRes.json();

  // Mailpit suele dar Text / HTML / Raw
  const candidates = [
    msgJson.Text,
    msgJson.text,
    msgJson.HTML,
    msgJson.html,
    msgJson.Raw,
    msgJson.raw,
    JSON.stringify(msgJson),
  ];

  for (const c of candidates) {
    const pin = extractPinFromText(c);
    if (pin) return pin;
  }

  return null;
}

/**
 * MailHog API (por si alguien lo usa):
 *  - GET /api/v2/messages
 */
async function fetchPinFromMailhog(email) {
  const res = await fetch(`${MAIL_UI_BASE}/api/v2/messages`);
  if (!res.ok) return null;

  const json = await res.json();
  const items = json.items || [];

  const msg = items.find((it) => {
    const to = JSON.stringify(it.To || it.to || "");
    return to.includes(email);
  });

  if (!msg) return null;

  const body = msg.Content?.Body || msg.content?.body || "";
  return extractPinFromText(body);
}

async function fetchLatestPinForEmail(email, { retries = 25, delayMs = 700 } = {}) {
  for (let i = 0; i < retries; i++) {
    // 1) intenta Mailpit
    try {
      const pin = await fetchPinFromMailpit(email);
      if (pin) return pin;
    } catch (_) {}

    // 2) fallback MailHog
    try {
      const pin = await fetchPinFromMailhog(email);
      if (pin) return pin;
    } catch (_) {}

    await sleep(delayMs);
  }

  throw new Error(`PIN not found for ${email} in Mailpit/MailHog after retries.`);
}

async function createAndLoginTestUser() {
  const email = makeTestEmail();
  const password = "SecurePass123!";

  // REGISTER
  await request(BASE_URL)
    .post(`${API_PREFIX}/auth/register`)
    .send({ email })
    .set("Accept", "application/json");

  // PIN (Mailpit)
  const pinCode = await fetchLatestPinForEmail(email);

  // VERIFY
  await request(BASE_URL)
    .post(`${API_PREFIX}/auth/verify`)
    .send({ email, pinCode, password, passwordConfirmation: password })
    .set("Accept", "application/json");

  // LOGIN (guardamos cookie con agent)
  const agent = request.agent(BASE_URL);
  const loginRes = await agent
    .post(`${API_PREFIX}/auth/login`)
    .send({ email, password })
    .set("Accept", "application/json");

  return { agent, email, password, loginRes };
}

module.exports = {
  BASE_URL,
  API_PREFIX,
  MAIL_UI_BASE,
  makeTestEmail,
  fetchLatestPinForEmail,
  createAndLoginTestUser,
};