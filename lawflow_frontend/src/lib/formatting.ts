import { Project } from "./api";

// The user requested to start numbering at 732.
// Assuming the database IDs start at 1, we add an offset of 731.
export const PROJECT_ID_OFFSET = 731;

export function formatProjectLabel(p: Project | null | undefined): string {
  if (!p) return "—";

  // Format: ID - Client - Type @ Location
  // Standard example: 15 - Pérez, Laura - Compra en Ojén
  // 'en' is used instead of '@' based on the specific Spanish example provided by the user,
  // even though the abstract standard was described as "type @ location".
  // The user likely intends for a localized preposition.

  const id = p.id + PROJECT_ID_OFFSET;
  const clientName = p.client?.name ?? "Unknown Client";
  
  let type: string = p.transaction_type;
  let separator = "@"; // Default separator

  // Simple localization logic
  // If the transaction type is English, we can map it to Spanish if implied by the user's request context
  // or we can stick to what's in the DB.
  // The user example "Compra" implies we should show Spanish terms if possible.
  if (type === "Purchase") {
    type = "Compra";
    separator = "en";
  } else if (type === "Sale") {
    type = "Venta";
    separator = "en";
  }

  // If the type was already something else, we stick to the default separator or use "en" if it looks Spanish?
  // We'll stick to the logic above.

  return `${id} - ${clientName} - ${type} ${separator} ${p.location}`;
}
