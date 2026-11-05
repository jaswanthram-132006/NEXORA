/**
 * NEXORA Universal Custom Input Engine - Types
 * Strict typing for parsing, validation, presets, and execution schemas.
 */

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings?: string[];
}

export interface InputPreset<T> {
  id: string;
  name: string;
  description: string;
  data: T;
  rawString: string;
}

export interface NumberArrayOptions {
  minSize?: number;
  maxSize?: number;
  minVal?: number;
  maxVal?: number;
  allowFloat?: boolean;
  allowDuplicates?: boolean;
}

export interface GraphEdgeInput {
  from: string;
  to: string;
  weight?: number;
}

export interface GraphData {
  nodes: string[];
  edges: GraphEdgeInput[];
}

export interface IntervalInput {
  start: number;
  finish: number;
  name?: string;
}
