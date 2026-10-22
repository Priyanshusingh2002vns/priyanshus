/**
 * Formats rich text post content for semantic heading hierarchy and styled links:
 * - 1st <h1> in content becomes <h2>
 * - Other <h1> in content become <h3>
 * - 1st <h2> in content becomes <h2>
 * - Other <h2> in content become <h4>
 * - Ensures <a> link tags are used for all links with target="_blank", rel="noopener noreferrer nofollow", and text-decoration: none
 * - Safely converts standalone plain text URLs into clickable <a> link tags
 */
export function formatPostContent(content) {
  if (!content || typeof content !== "string") return "";

  let h1Count = 0;
  let h2Count = 0;

  // 1. Transform headings in a single pass according to document order:
  // - 1st h1 becomes h2
  // - other h1 become h3
  // - 1st h2 becomes h2
  // - other h2 become h4
  let transformed = content.replace(
    /<(h1|h2)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (match, tag, attrs, inner) => {
      const lowerTag = tag.toLowerCase();
      if (lowerTag === "h1") {
        h1Count++;
        const newTag = h1Count === 1 ? "h2" : "h3";
        return `<${newTag}${attrs}>${inner}</${newTag}>`;
      } else if (lowerTag === "h2") {
        h2Count++;
        const newTag = h2Count === 1 ? "h2" : "h4";
        return `<${newTag}${attrs}>${inner}</${newTag}>`;
      }
      return match;
    }
  );

  // 2. Safely auto-link plain text URLs outside HTML tags
  const parts = transformed.split(/(<[^>]+>)/g);
  let insideA = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.startsWith("<")) {
      if (/^<a\b/i.test(part)) insideA = true;
      if (/^<\/a>/i.test(part)) insideA = false;
      continue;
    }
    if (!insideA && part.trim()) {
      parts[i] = part.replace(
        /(https?:\/\/[^\s<"']+)/gi,
        (url) =>
          `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow" style="text-decoration: none;">${url}</a>`
      );
    }
  }
  transformed = parts.join("");

  // 3. Ensure existing <a> tags use proper attributes and text-decoration: none
  transformed = transformed.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    let newAttrs = attrs;

    if (/href=["']https?:\/\//i.test(newAttrs) && !/target=/i.test(newAttrs)) {
      newAttrs += ' target="_blank"';
    }
    if (/target=["']_blank["']/i.test(newAttrs) && !/rel=/i.test(newAttrs)) {
      newAttrs += ' rel="noopener noreferrer nofollow"';
    }
    if (/style=["']/i.test(newAttrs)) {
      newAttrs = newAttrs.replace(
        /style=(["'])(.*?)\1/i,
        (m, quote, styleContent) => {
          let clean = styleContent
            .replace(/text-decoration\s*:\s*[^;]+;?/gi, "")
            .trim();
          if (clean && !clean.endsWith(";")) clean += ";";
          return `style=${quote}${clean ? clean + " " : ""}text-decoration: none;${quote}`;
        }
      );
    } else {
      newAttrs += ' style="text-decoration: none;"';
    }

    return `<a${newAttrs}>`;
  });

  // 4. Remove completely empty paragraphs created by rich-text editors
  transformed = transformed.replace(/<p>\s*<\/p>/gi, "");

  return transformed;
}
