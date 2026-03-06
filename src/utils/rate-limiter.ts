import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { RateLimitError } from "./errors.js";

interface RateLimitState {
  date: string;
  count: number;
}

const STATE_PATH = resolve(process.env.HOME ?? ".", ".cache/walmart-mcp/rate-limit.json");

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): RateLimitState {
  try {
    const data = JSON.parse(readFileSync(STATE_PATH, "utf-8"));
    if (data.date === today()) return data;
  } catch {}
  return { date: today(), count: 0 };
}

function saveState(state: RateLimitState) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(state));
}

export function checkRateLimit(limit: number) {
  const state = loadState();
  if (state.count >= limit) throw new RateLimitError();
}

export function consumeRateLimit() {
  const state = loadState();
  state.count++;
  saveState(state);
}

export function getRateLimitInfo(limit: number) {
  const state = loadState();
  return { used: state.count, remaining: limit - state.count, limit, date: state.date };
}
