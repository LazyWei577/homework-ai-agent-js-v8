const DEFAULT_SEPARATORS = [
  "\n\n",
  "\n",
  "。",
  "！",
  "？",
  "；",
  ". ",
  "! ",
  "? ",
  "; ",
  "，",
  ", ",
  " ",
  "",
];

export function splitText(
  text,
  {
    chunkSize = 1000,
    overlap = 50,
    separators = DEFAULT_SEPARATORS,
  } = {},
) {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new RangeError("chunkSize 必須是正整數");
  }
  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new RangeError("overlap 必須大於等於 0，並且小於 chunkSize");
  }

  const normalized = String(text).trim();
  if (normalized === "") return [];

  const baseSize = chunkSize - overlap;
  const baseChunks = splitRecursively(normalized, baseSize, separators);

  return baseChunks.map((chunk, index) => {
    if (index === 0 || overlap === 0) return chunk;
    const prefix = baseChunks[index - 1].slice(-overlap);
    return `${prefix}${chunk}`;
  });
}

function splitRecursively(text, maxLength, separators) {
  if (text.length <= maxLength) return [text];

  const [separator = "", ...rest] = separators;
  if (separator === "") return hardSplit(text, maxLength);

  const parts = splitKeepingSeparator(text, separator);
  if (parts.length === 1) {
    return splitRecursively(text, maxLength, rest);
  }

  const chunks = [];
  let current = "";

  for (const part of parts) {
    if (part.length > maxLength) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      chunks.push(...splitRecursively(part, maxLength, rest));
      continue;
    }

    if (current.length + part.length <= maxLength) {
      current += part;
    } else {
      if (current) chunks.push(current);
      current = part;
    }
  }

  if (current) chunks.push(current);
  return chunks.map((chunk) => chunk.trim()).filter(Boolean);
}

function splitKeepingSeparator(text, separator) {
  const parts = text.split(separator);
  return parts
    .map((part, index) =>
      index < parts.length - 1 ? `${part}${separator}` : part,
    )
    .filter(Boolean);
}

function hardSplit(text, maxLength) {
  const chunks = [];
  for (let start = 0; start < text.length; start += maxLength) {
    chunks.push(text.slice(start, start + maxLength));
  }
  return chunks;
}
