"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const MAX_BODY_SIZE = 10_000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 5;
const requestsByIp = new Map();

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (requestsByIp.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  requestsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw) > MAX_BODY_SIZE) {
        reject(new Error("BODY_TOO_LARGE"));
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("INVALID_JSON"));
      }
    });
    request.on("error", reject);
  });
}

async function sendToTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("[ДЕМО-ЗАЯВКА]", lead);
    return { demo: true };
  }

  const text = [
    "🚘 Новая заявка с сайта STAV DETAIL",
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Услуга: ${lead.service}`,
    `Комментарий: ${lead.message || "—"}`
  ].join("\n");

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  if (!telegramResponse.ok) {
    throw new Error(`TELEGRAM_${telegramResponse.status}`);
  }

  return { demo: false };
}

async function handleLead(request, response) {
  const ip = request.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return sendJson(response, 429, { ok: false, message: "Слишком много запросов. Попробуйте через минуту." });
  }

  try {
    const body = await readJsonBody(request);
    const lead = {
      name: normalizeText(body.name, 80),
      phone: normalizeText(body.phone, 30),
      service: normalizeText(body.service, 100),
      message: normalizeText(body.message, 500)
    };

    if (body.website) {
      return sendJson(response, 200, { ok: true });
    }

    if (lead.name.length < 2 || !/^[+\d\s()\-]{7,30}$/.test(lead.phone) || !lead.service) {
      return sendJson(response, 400, { ok: false, message: "Проверьте имя, телефон и выбранную услугу." });
    }

    const result = await sendToTelegram(lead);
    return sendJson(response, 200, {
      ok: true,
      demo: result.demo,
      message: result.demo
        ? "Демо-заявка принята. Подключите Telegram по инструкции в README."
        : "Заявка отправлена. Мы скоро свяжемся с вами."
    });
  } catch (error) {
    console.error("Ошибка обработки заявки:", error.message);
    return sendJson(response, 500, { ok: false, message: "Не удалось отправить заявку. Позвоните нам напрямую." });
  }
}

function serveStatic(request, response) {
  const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end("Страница не найдена");
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": path.extname(filePath) === ".html" ? "no-cache" : "public, max-age=86400"
    });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "DENY");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (request.method === "POST" && request.url === "/api/lead") {
    return handleLead(request, response);
  }

  if (request.method !== "GET") {
    response.writeHead(405, { Allow: "GET, POST" });
    return response.end("Method Not Allowed");
  }

  return serveStatic(request, response);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`STAV DETAIL запущен на порту ${PORT}`);
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log("Форма работает в демо-режиме: заявки выводятся в этот терминал.");
  }
});
