import { describe, expect, test } from "bun:test";
import { parseReviewArgs } from "./review-args";

describe("parseReviewArgs", () => {
  test("defaults to auto VCS and local PR checkout", () => {
    expect(parseReviewArgs("")).toEqual({
      prUrl: undefined,
      defaultBranch: undefined,
      vcsType: undefined,
      useLocal: true,
    });
  });

  test("parses --git without a PR URL", () => {
    expect(parseReviewArgs("--git")).toEqual({
      prUrl: undefined,
      defaultBranch: undefined,
      vcsType: "git",
      useLocal: true,
    });
  });

  test("parses --gitbutler without a PR URL", () => {
    expect(parseReviewArgs("--gitbutler")).toEqual({
      prUrl: undefined,
      defaultBranch: undefined,
      vcsType: "gitbutler",
      useLocal: true,
    });
  });

  test("parses PR URLs before or after --git", () => {
    expect(parseReviewArgs("--git https://github.com/acme/repo/pull/12")).toEqual({
      prUrl: "https://github.com/acme/repo/pull/12",
      defaultBranch: undefined,
      vcsType: "git",
      useLocal: true,
    });
    expect(parseReviewArgs("https://github.com/acme/repo/pull/12 --git")).toEqual({
      prUrl: "https://github.com/acme/repo/pull/12",
      defaultBranch: undefined,
      vcsType: "git",
      useLocal: true,
    });
  });

  test("preserves --no-local for PR review mode", () => {
    expect(parseReviewArgs("--no-local https://github.com/acme/repo/pull/12")).toEqual({
      prUrl: "https://github.com/acme/repo/pull/12",
      defaultBranch: undefined,
      vcsType: undefined,
      useLocal: false,
    });
  });

  test("accepts argv arrays from the compiled CLI", () => {
    expect(parseReviewArgs(["--git", "--no-local", "https://github.com/acme/repo/pull/12"])).toEqual({
      prUrl: "https://github.com/acme/repo/pull/12",
      defaultBranch: undefined,
      vcsType: "git",
      useLocal: false,
    });
  });

  test("strips wrapping quotes from string and argv inputs", () => {
    expect(parseReviewArgs(`--git "https://github.com/acme/repo/pull/12"`).prUrl)
      .toBe("https://github.com/acme/repo/pull/12");
    expect(parseReviewArgs(["--git", "\"https://github.com/acme/repo/pull/12\""]).prUrl)
      .toBe("https://github.com/acme/repo/pull/12");
  });

  test("keeps non-url positional input as local review mode", () => {
    expect(parseReviewArgs("--git not-a-url")).toEqual({
      prUrl: undefined,
      defaultBranch: undefined,
      vcsType: "git",
      useLocal: true,
    });
  });

  test("parses an explicit local review base", () => {
    expect(parseReviewArgs("--base origin/release/2026.08 --git")).toEqual({
      prUrl: undefined,
      defaultBranch: "origin/release/2026.08",
      vcsType: "git",
      useLocal: true,
    });
    expect(parseReviewArgs("--base=release/2026.08").defaultBranch).toBe("release/2026.08");
  });

  test("rejects a missing base", () => {
    expect(() => parseReviewArgs("--base")).toThrow("--base requires a branch or ref");
    expect(() => parseReviewArgs("--base --git")).toThrow("--base requires a branch or ref");
  });

  test("rejects a base for PR and remote reviews", () => {
    expect(() => parseReviewArgs("--base main https://github.com/acme/repo/pull/12"))
      .toThrow("--base is only supported for local branch reviews");
    expect(() => parseReviewArgs("--base main --no-local"))
      .toThrow("--base is only supported for local branch reviews");
  });
});
