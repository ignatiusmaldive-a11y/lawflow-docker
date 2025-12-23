import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "es";
const LS_LANG = "lawflow.lang.v1";

type Dict = Record<string, string>;

const EN: Dict = {
  tagline: "Costa del Sol · Property Transactions",
  activeMatter: "Active matter",
  workspace: "Workspace",
  timeline: "Timeline",
  taskTable: "Task Table",
  calendar: "Calendar",
  files: "Files",
  templates: "Templates",
  closingPack: "Closing pack",
  settings: "Settings", // This key is still needed for useI18n
  quickAdd: "Quick add",
  newProject: "New project",
  searchPlaceholder: "Search tasks, files, checklist… (Ctrl+K)",
  openTasks: "Open tasks",
  dueIn7: "Due in 7 days",
  overdue: "Overdue",
  completed: "Completed",
  work: "Work",
  spanishChecklist: "Spanish conveyancing checklist",
  activity: "Activity",
  downloadIcs: "Download ICS",
  fileRoom: "File room",
  upload: "Upload",
  dragDrop: "Drag & drop files here to upload",
  preview: "Preview",
  noFiles: "No files yet. Upload something to see preview + search working.",
  templatesByMunicipality: "Templates by municipality",
  municipality: "Municipality",
  closingPackGen: "Closing pack generation",
  generateZip: "Generate ZIP",
  readiness: "Readiness",
  ready: "Ready",
  notReady: "Not ready",
  wizard: "Wizard",
  step_notary: "Notary",
  step_taxes: "Taxes",
  step_registry: "Registry",
  step_utilities: "Utilities",
  suggestedMissing: "Suggested missing items",
  globalSearch: "Global search",
  noResults: "No results. Try different keywords.",
  demoTitle: "Demo tips",
  demoBody: "Try: switch matters, open Files for drag-drop + preview, Templates for municipality rules, Closing pack wizard, and Ctrl+K global search.",
  langEn: "EN",
  langEs: "ES",

  // General Overview page
  overviewLink: "Overview",
  portfolioOverviewTitle: "Portfolio Overview",
  totalMatters: "Total Matters",
  activeProjects: "Active",
  closedProjects: "Closed",
  highRiskProjects: "Risk",
  searchProjectsPlaceholder: "Search matters, locations, clients...",
  allStatuses: "All Statuses",
  matterTableCol: "Matter",
  locationTableCol: "Location",
  statusTableCol: "Status", // Keep this for General Overview
  riskTableCol: "Risk",
  deadlineTableCol: "Deadline",
  clientTableCol: "Client",
  noProjectsMatch: "No matters found matching your filters.",
  showingProjects: "Showing {count} projects",

  // Matter Settings page
  noActiveMatter: "No active matter selected. Select a matter from the sidebar to edit its settings.",
  matterSettings: "Matter Settings",
  backgroundColor: "Background Color",
  changeProjectBg: "Change the background color for this project.",
  riskLevel: "Risk Level",
  riskNormal: "Normal",
  riskAtRisk: "At Risk",
  riskCritical: "Critical",
  cancel: "Cancel",
  saveChanges: "Save Changes",

  // Calendar View page
  deadlineAlerts: "Deadline alerts",
  overdueCount: "{count} overdue",
  noOverdue: "No overdue",
  taskTableCol: "Task",
  assigneeTableCol: "Assignee",
  dueTableCol: "Due",
  // statusTableCol: "Status", // Removed duplicate
  noUpcomingDeadlines: "No upcoming deadlines.",
  calendarSubtitle: "Subscribe this matter in Google Calendar / Outlook using the ICS file. (Demo: exports task due dates + milestones.)",
};

const ES: Dict = {
  tagline: "Costa del Sol · Transacciones inmobiliarias",
  activeMatter: "Asunto activo",
  workspace: "Espacio de trabajo",
  timeline: "Cronograma",
  taskTable: "Tabla de tareas",
  calendar: "Calendario",
  files: "Archivos",
  templates: "Plantillas",
  closingPack: "Paquete de cierre",
  settings: "Ajustes", // This key is still needed for useI18n
  quickAdd: "Añadir rápido",
  newProject: "Nuevo asunto",
  searchPlaceholder: "Buscar tareas, archivos, checklist… (Ctrl+K)",
  openTasks: "Tareas abiertas",
  dueIn7: "Vence en 7 días",
  overdue: "Atrasadas",
  completed: "Completadas",
  work: "Trabajo",
  spanishChecklist: "Checklist de compraventa (España)",
  activity: "Actividad",
  downloadIcs: "Descargar ICS",
  fileRoom: "Sala de archivos",
  upload: "Subir",
  dragDrop: "Arrastra y suelta archivos aquí para subirlos",
  preview: "Vista previa",
  noFiles: "Aún no hay archivos. Sube alguno para ver la vista previa + búsqueda.",
  templatesByMunicipality: "Plantillas por municipio",
  municipality: "Municipio",
  closingPackGen: "Generación del paquete de cierre",
  generateZip: "Generar ZIP",
  readiness: "Preparación",
  ready: "Listo",
  notReady: "No listo",
  wizard: "Asistente",
  step_notary: "Notaría",
  step_taxes: "Impuestos",
  step_registry: "Registro",
  step_utilities: "Suministros",
  suggestedMissing: "Sugerencias de faltantes",
  globalSearch: "Búsqueda global",
  noResults: "Sin resultados. Prueba otras palabras.",
  demoTitle: "Consejos (demo)",
  demoBody: "Prueba: cambiar de asunto, abrir Archivos para arrastrar/soltar + vista previa, Plantillas por municipio, asistente de paquete de cierre y Ctrl+K para búsqueda global.",
  langEn: "EN",
  langEs: "ES",

  // General Overview page
  overviewLink: "Resumen",
  portfolioOverviewTitle: "Vista general de cartera",
  totalMatters: "Total Asuntos",
  activeProjects: "Activos",
  closedProjects: "Cerrados",
  highRiskProjects: "Riesgo",
  searchProjectsPlaceholder: "Buscar asuntos, ubicaciones, clientes...",
  allStatuses: "Todos los estados",
  matterTableCol: "Asunto",
  locationTableCol: "Ubicación",
  statusTableCol: "Estado", // Keep this for General Overview
  riskTableCol: "Riesgo",
  deadlineTableCol: "Fecha límite",
  clientTableCol: "Cliente",
  noProjectsMatch: "No se encontraron asuntos que coincidan con tus filtros.",
  showingProjects: "Mostrando {count} asuntos",

  // Matter Settings page
  noActiveMatter: "No hay asunto activo seleccionado. Selecciona un asunto de la barra lateral para editar su configuración.",
  matterSettings: "Configuración del asunto",
  backgroundColor: "Color de fondo",
  changeProjectBg: "Cambia el color de fondo para este asunto.",
  riskLevel: "Nivel de riesgo",
  riskNormal: "Normal",
  riskAtRisk: "En riesgo",
  riskCritical: "Crítico",
  cancel: "Cancelar",
  saveChanges: "Guardar cambios",

  // Calendar View page
  deadlineAlerts: "Alertas de plazos",
  overdueCount: "{count} atrasados",
  noOverdue: "Sin atrasos",
  taskTableCol: "Tarea",
  assigneeTableCol: "Responsable",
  dueTableCol: "Vencimiento",
  // statusTableCol: "Estado", // Removed duplicate
  noUpcomingDeadlines: "No hay plazos próximos.",
  calendarSubtitle: "Suscribe este asunto en Google Calendar / Outlook usando el archivo ICS. (Demo: exporta fechas de vencimiento de tareas + hitos.)",
};

const Ctx = createContext<{ lang: Lang; t: (k: keyof typeof EN) => string } | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_LANG);
      // If no language is stored, or it's not 'en'/'es', default to 'es'
      if (raw === "en") setLangState("en");
      else setLangState("es"); // Default to Spanish
    } catch {}
  }, []);

  // setLang is no longer needed as there's no UI to change language
  const t = (k: keyof typeof EN) => (lang === "es" ? ES : EN)[k] ?? String(k);

  return <Ctx.Provider value={{ lang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used within I18nProvider");
  return v;
}