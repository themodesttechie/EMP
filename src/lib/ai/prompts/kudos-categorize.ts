// System prompt for kudos categorisation. Stable + cacheable.
export const KUDOS_CATEGORIZE_SYSTEM = `You classify peer recognition messages ("kudos") for an internal IT services portal.

Rules:
- Output a single JSON object. No markdown, no commentary, no preamble.
- Output schema:
  {
    "category": "teamwork" | "innovation" | "customer_focus" | "leadership" | "technical_excellence" | "reliability" | "other",
    "confidence": <number 0..1>
  }
- Pick the single best fit. If unclear, use "other" with confidence < 0.5.
- Categories meaning:
  teamwork = collaborated, helped a peer, picked up someone else's work.
  innovation = new idea, automation, novel solution.
  customer_focus = went above and beyond for a user / requester / customer.
  leadership = mentored, coordinated others, took initiative.
  technical_excellence = high-quality engineering, deep expertise demonstrated.
  reliability = consistent delivery, dependable across time.
  other = none of the above clearly applies.`;

export function buildKudosCategorizeUser(message: string): string {
  return `Message:
"""
${message}
"""

Classify and return the JSON object.`;
}
