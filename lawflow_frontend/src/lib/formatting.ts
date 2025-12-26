import { Project } from "./api";

export const PROJECT_ID_OFFSET = 731;

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toISOString().split("T")[0];
}

export function formatClientName(name: string | null | undefined): string {
  if (!name) return "Unknown Client";

  // Format: Surname, First Name
  // Example: "Laura Pérez" becomes "Pérez, Laura"
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const firstName = parts[0];
    const surname = parts.slice(1).join(" ");
    return `${surname}, ${firstName}`;
  }
  return name; // If only one part, return as is
}

export function formatProjectLabel(p: Project | null | undefined): string {
  if (!p) return "—";

  // Format: ID - Client - Type @ Location
  // Standard example: 15 - Pérez, Laura - Compra en Ojén
  // 'en' is used instead of '@' based on the specific Spanish example provided by the user,
  // even though the abstract standard was described as "type @ location".
  // The user likely intends for a localized preposition.

  const id = p.id + PROJECT_ID_OFFSET;
  const clientName = formatClientName(p.client?.name);

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

export function daysUntil(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const ms = d.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}