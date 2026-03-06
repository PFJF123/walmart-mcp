import { generateKeyPairSync } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

export function generateKeys(outputDir = "./keys") {
  mkdirSync(resolve(outputDir), { recursive: true });

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  const pubPath = resolve(outputDir, "public.pem");
  const privPath = resolve(outputDir, "private.pem");

  writeFileSync(pubPath, publicKey);
  writeFileSync(privPath, privateKey, { mode: 0o600 });

  console.log(`RSA-2048 key pair generated:`);
  console.log(`  Public:  ${pubPath}`);
  console.log(`  Private: ${privPath}`);
  console.log(`\nUpload the public key to your Walmart.io developer account.`);
  console.log(`Set WALMART_PRIVATE_KEY_PATH=${privPath} in your .env file.`);
}

// Run directly
if (process.argv[1]?.endsWith("generate-keys.ts") || process.argv[1]?.endsWith("generate-keys.js")) {
  generateKeys();
}
