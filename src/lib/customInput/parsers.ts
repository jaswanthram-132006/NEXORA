/**
 * NEXORA Universal Custom Input Engine - Parsers and Validators
 * Pure, deterministic functions with comprehensive bounds checking and actionable error reporting.
 */

import { ValidationResult, NumberArrayOptions, GraphData, IntervalInput } from "./types";

/**
 * Parses a comma-, space-, or newline-separated string into a number array with validation.
 */
export function parseNumberArray(
  raw: string,
  options: NumberArrayOptions = {}
): ValidationResult<number[]> {
  const {
    minSize = 2,
    maxSize = 40,
    minVal = -1000,
    maxVal = 1000,
    allowFloat = true,
  } = options;

  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      errors: ["Input cannot be empty. Please provide numbers separated by commas or spaces."],
    };
  }

  // Tokenize by comma, space, semicolon, or newline
  const tokens = raw
    .trim()
    .split(/[\s,;]+/)
    .filter((t) => t.length > 0);

  if (tokens.length < minSize) {
    return {
      isValid: false,
      errors: [`Array contains ${tokens.length} elements. Minimum required size is ${minSize}.`],
    };
  }

  if (tokens.length > maxSize) {
    return {
      isValid: false,
      errors: [`Array contains ${tokens.length} elements. Maximum permitted size is ${maxSize} for optimal rendering.`],
    };
  }

  const parsedNumbers: number[] = [];
  const errors: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const num = Number(token);

    if (isNaN(num)) {
      errors.push(`Token #${i + 1} "${token}" is not a valid number.`);
      continue;
    }

    if (!allowFloat && !Number.isInteger(num)) {
      errors.push(`Token #${i + 1} "${token}" must be an integer.`);
      continue;
    }

    if (num < minVal || num > maxVal) {
      errors.push(`Value ${num} at index ${i} is outside permissible range [${minVal}, ${maxVal}].`);
      continue;
    }

    parsedNumbers.push(num);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.slice(0, 5), // return up to 5 concise errors
    };
  }

  return {
    isValid: true,
    data: parsedNumbers,
    errors: [],
  };
}

/**
 * Parses two strings separated by comma or newline for LCS / Edit Distance.
 */
export function parseStringPair(
  raw: string,
  options: { maxLen?: number } = {}
): ValidationResult<{ s1: string; s2: string }> {
  const { maxLen = 30 } = options;

  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      errors: ["Input cannot be empty. Please provide two strings."],
    };
  }

  let s1 = "";
  let s2 = "";

  if (raw.includes("\n")) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return { isValid: false, errors: ["Please provide two separate lines for string 1 and string 2."] };
    }
    s1 = lines[0];
    s2 = lines[1];
  } else if (raw.includes(",")) {
    const parts = raw.split(",").map((p) => p.trim());
    if (parts.length < 2) {
      return { isValid: false, errors: ["Please separate the two strings with a comma or newline."] };
    }
    s1 = parts[0];
    s2 = parts[1];
  } else {
    return {
      isValid: false,
      errors: ["Please provide two strings separated by a comma or newline (e.g. 'ALGORITHM, ALTRUISTIC')."],
    };
  }

  if (s1.length > maxLen || s2.length > maxLen) {
    return {
      isValid: false,
      errors: [`String lengths (${s1.length}, ${s2.length}) exceed maximum permitted size of ${maxLen} characters.`],
    };
  }

  return {
    isValid: true,
    data: { s1, s2 },
    errors: [],
  };
}

/**
 * Parses Matrix Chain Multiplication dimensions list (p_0, p_1, ..., p_n).
 */
export function parseMatrixDims(raw: string): ValidationResult<number[]> {
  const res = parseNumberArray(raw, {
    minSize: 3,
    maxSize: 10,
    minVal: 1,
    maxVal: 500,
    allowFloat: false,
  });

  if (!res.isValid) return res;

  return {
    isValid: true,
    data: res.data!,
    errors: [],
  };
}

/**
 * Parses a graph from edge specification format:
 * e.g. "A-B:4, B-C:2, C-D:5" or "A-B, B-C, C-D"
 */
export function parseGraphEdges(raw: string): ValidationResult<GraphData> {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      errors: ["Graph edge specification cannot be empty (e.g. 'A-B:4, B-C:2, C-D:5')."],
    };
  }

  const tokens = raw
    .trim()
    .split(/[\s,;]+/)
    .filter((t) => t.length > 0);

  const nodeSet = new Set<string>();
  const edges: { from: string; to: string; weight?: number }[] = [];
  const errors: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // Match "U-V" or "U-V:W" or "U->V" or "U->V:W"
    const match = token.match(/^([A-Za-z0-9]+)[->]+([A-Za-z0-9]+)(?::(-?\d+(?:\.\d+)?))?$/);

    if (!match) {
      errors.push(`Token #${i + 1} "${token}" is not a valid edge. Use format "A-B" or "A-B:4".`);
      continue;
    }

    const from = match[1].toUpperCase();
    const to = match[2].toUpperCase();
    const weight = match[3] !== undefined ? Number(match[3]) : undefined;

    if (from === to) {
      errors.push(`Edge #${i + 1} "${token}" is a self-loop (from ${from} to ${to}), which is disallowed.`);
      continue;
    }

    nodeSet.add(from);
    nodeSet.add(to);
    edges.push({ from, to, weight });
  }

  if (nodeSet.size < 2) {
    errors.push("Graph must contain at least 2 distinct vertices.");
  }
  if (nodeSet.size > 20) {
    errors.push(`Graph contains ${nodeSet.size} vertices. Maximum permitted is 20.`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors: errors.slice(0, 5),
    };
  }

  return {
    isValid: true,
    data: {
      nodes: Array.from(nodeSet).sort(),
      edges,
    },
    errors: [],
  };
}

/**
 * Parses Activity Selection intervals:
 * e.g. "1-4, 3-5, 0-6, 5-7, 8-9"
 */
export function parseIntervals(raw: string): ValidationResult<IntervalInput[]> {
  if (!raw || !raw.trim()) {
    return {
      isValid: false,
      errors: ["Intervals input cannot be empty (e.g. '1-4, 3-5, 0-6, 5-7, 8-9')."],
    };
  }

  const tokens = raw.trim().split(/[\s,;]+/).filter(Boolean);
  const intervals: IntervalInput[] = [];
  const errors: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const parts = token.split(/[-:]/);
    if (parts.length !== 2) {
      errors.push(`Invalid interval token "${token}". Format must be "start-finish" (e.g. "1-4").`);
      continue;
    }

    const start = Number(parts[0]);
    const finish = Number(parts[1]);

    if (isNaN(start) || isNaN(finish)) {
      errors.push(`Interval "${token}" contains non-numeric bounds.`);
      continue;
    }

    if (start < 0 || finish <= start) {
      errors.push(`Invalid interval "${token}": finish time must be strictly greater than start time (>= 0).`);
      continue;
    }

    intervals.push({ start, finish, name: `A${i + 1}` });
  }

  if (intervals.length < 2) {
    errors.push("Please provide at least 2 intervals.");
  }
  if (intervals.length > 25) {
    errors.push(`Too many intervals (${intervals.length}). Maximum permitted is 25.`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors: errors.slice(0, 5) };
  }

  return {
    isValid: true,
    data: intervals,
    errors: [],
  };
}

/**
 * Parses a single numeric or integer scalar with bounds checking.
 */
export function parseNumber(
  raw: string,
  options: { minVal?: number; maxVal?: number; integerOnly?: boolean } = {}
): ValidationResult<number> {
  const { minVal = -Infinity, maxVal = Infinity, integerOnly = true } = options;
  if (!raw || !raw.trim()) {
    return { isValid: false, errors: ["Input cannot be empty."] };
  }
  const val = Number(raw.trim());
  if (isNaN(val)) {
    return { isValid: false, errors: [`"${raw.trim()}" is not a valid number.`] };
  }
  if (integerOnly && !Number.isInteger(val)) {
    return { isValid: false, errors: [`Expected an integer, but got ${val}.`] };
  }
  if (val < minVal) {
    return { isValid: false, errors: [`Value ${val} is below minimum allowed (${minVal}).`] };
  }
  if (val > maxVal) {
    return { isValid: false, errors: [`Value ${val} exceeds maximum allowed (${maxVal}).`] };
  }
  return { isValid: true, data: val, errors: [] };
}
