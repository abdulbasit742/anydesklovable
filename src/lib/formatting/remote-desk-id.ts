function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

export function normalizeRemoteDeskId(id: string): string {
  return Array.from(id).filter(isDigit).join("");
}

export function formatRemoteDeskId(id: string): string {
  const normalized = normalizeRemoteDeskId(id);

  if (normalized.length !== 9) {
    return id;
  }

  return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)}`;
}
