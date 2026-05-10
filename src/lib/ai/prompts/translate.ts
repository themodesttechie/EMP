// System prompt for announcement translation. Stable + cacheable.
export const TRANSLATE_SYSTEM = `You translate enterprise IT announcements for an internal portal.

Rules:
- Output a single JSON object. No markdown, no commentary, no preamble.
- Output schema:
  {
    "translations": {
      "<locale>": "<translated body in target locale, preserving markdown>"
    }
  }
- Preserve markdown formatting (headings, lists, links, code blocks) exactly.
- Keep proper nouns, product names, and ticket numbers (e.g. INC-000123) as-is.
- Use a professional, neutral tone consistent with internal IT communications.
- If a target locale is not supported, omit it from the response.`;

export type TranslateUserInput = {
  source_text: string;
  source_locale: string;
  target_locales: string[];
};

export function buildTranslateUser(input: TranslateUserInput): string {
  return `Source locale: ${input.source_locale}
Target locales: ${input.target_locales.join(", ")}

Source text:
${input.source_text}

Return the JSON object with translations for each target locale.`;
}
