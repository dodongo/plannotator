// @generated — DO NOT EDIT. Source: packages/shared/review-args.ts
import type { VcsSelection } from "./vcs-core.ts";
import { stripWrappingQuotes } from "./resolve-file.ts";

export interface ParsedReviewArgs {
  prUrl?: string;
  defaultBranch?: string;
  vcsType?: VcsSelection;
  useLocal: boolean;
}

export function parseReviewArgs(input: string | string[]): ParsedReviewArgs {
  const tokens = Array.isArray(input)
    ? input.map((token) => stripWrappingQuotes(token.trim())).filter(Boolean)
    : tokenizeReviewArgs(input ?? "");

  let vcsType: VcsSelection | undefined;
  let defaultBranch: string | undefined;
  let useLocal = true;
  const positional: string[] = [];

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.startsWith("--base=")) {
      defaultBranch = requireBase(token.slice("--base=".length));
      continue;
    }
    switch (token) {
      case "--git":
        vcsType = "git";
        break;
      case "--gitbutler":
        vcsType = "gitbutler";
        break;
      case "--local":
        useLocal = true;
        break;
      case "--no-local":
        useLocal = false;
        break;
      case "--base":
        defaultBranch = requireBase(tokens[++index]);
        break;
      default:
        positional.push(token);
        break;
    }
  }

  const target = positional[0];
  const prUrl = target && isReviewUrl(target) ? target : undefined;
  if (defaultBranch && (prUrl || !useLocal)) {
    throw new Error("--base is only supported for local branch reviews");
  }
  return {
    prUrl,
    defaultBranch,
    vcsType,
    useLocal,
  };
}

function requireBase(value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error("--base requires a branch or ref");
  }
  return value;
}

function isReviewUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function tokenizeReviewArgs(input: string): string[] {
  const raw = input.trim();
  if (!raw) return [];

  const tokens: string[] = [];
  let current = "";
  let quote: "'" | "\"" | undefined;

  for (let i = 0; i < raw.length; i++) {
    const char = raw[i];
    if (quote) {
      if (char === quote) {
        quote = undefined;
      } else {
        current += char;
      }
      continue;
    }

    if (char === "'" || char === "\"") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);
  return tokens.map((token) => stripWrappingQuotes(token.trim())).filter(Boolean);
}
