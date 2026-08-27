import type { ParsedCommand } from '../../types';

/**
 * Tokenizes and parses a raw command string into structured ParsedCommand.
 * Supports:
 *   - Positional arguments
 *   - GNU-style flags (--flag, -f, --key value, --key=value)
 *   - Quoted strings (single and double quotes)
 */
export function parseCommand(raw: string): ParsedCommand {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { command: '', args: [], flags: {}, raw: trimmed };
  }

  const tokens = tokenize(trimmed);
  if (tokens.length === 0) {
    return { command: '', args: [], flags: {}, raw: trimmed };
  }

  const command = tokens[0].toLowerCase();
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  let i = 1;
  while (i < tokens.length) {
    const token = tokens[i];

    if (token.startsWith('--')) {
      const key = token.slice(2);
      // Check for --key=value syntax
      const eqIdx = key.indexOf('=');
      if (eqIdx !== -1) {
        flags[key.slice(0, eqIdx)] = key.slice(eqIdx + 1);
      } else if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[key] = tokens[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else if (token.startsWith('-') && token.length === 2) {
      const key = token.slice(1);
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[key] = tokens[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      args.push(token);
    }

    i++;
  }

  return { command, args, flags, raw: trimmed };
}

/**
 * Tokenizes a string respecting quoted substrings.
 */
function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
      } else {
        current += ch;
      }
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === ' ' || ch === '\t') {
      if (current.length > 0) {
        tokens.push(current);
        current = '';
      }
    } else {
      current += ch;
    }
  }

  if (current.length > 0) {
    tokens.push(current);
  }

  return tokens;
}
