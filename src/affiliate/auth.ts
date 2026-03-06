import { readFileSync } from "fs";
import { createSign, randomUUID } from "crypto";
import { config } from "../config.js";

let privateKeyCache: string | null = null;

function getPrivateKey(): string {
  if (!privateKeyCache) {
    privateKeyCache = readFileSync(config.privateKeyPath, "utf-8");
  }
  return privateKeyCache;
}

export function generateAuthHeaders(): Record<string, string> {
  const timestamp = Date.now().toString();
  const correlationId = randomUUID();

  const stringToSign = `${config.consumerId}\n${timestamp}\n${config.keyVersion}\n`;

  const sign = createSign("RSA-SHA256");
  sign.update(stringToSign);
  const signature = sign.sign(getPrivateKey(), "base64");

  return {
    "WM_CONSUMER.ID": config.consumerId,
    "WM_SEC.AUTH_SIGNATURE": signature,
    "WM_SEC.KEY_VERSION": config.keyVersion,
    "WM_QOS.CORRELATION_ID": correlationId,
    "WM_SEC.TIMESTAMP": timestamp,
    Accept: "application/json",
  };
}
