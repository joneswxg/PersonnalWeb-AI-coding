const LEADING_H1_PATTERN = /^#\s+(.+?)\s*$/;

/**
 * If the first line of `content` is a level-1 Markdown heading whose text
 * matches `title` (trimmed, case-insensitive), returns `content` with that
 * heading line (and one immediately-following blank line, if any) removed.
 * Otherwise returns `content` unchanged. Only the first line is considered,
 * so a matching heading appearing later in the body is left untouched.
 */
export function stripDuplicateLeadingHeading(content: string, title: string): string {
  const newlineIndex = content.indexOf("\n");
  const firstLine = newlineIndex === -1 ? content : content.slice(0, newlineIndex);

  const match = firstLine.match(LEADING_H1_PATTERN);
  if (!match) {
    return content;
  }
  if (match[1].trim().toLowerCase() !== title.trim().toLowerCase()) {
    return content;
  }
  if (newlineIndex === -1) {
    return "";
  }

  const rest = content.slice(newlineIndex + 1);
  return rest.startsWith("\n") ? rest.slice(1) : rest;
}
