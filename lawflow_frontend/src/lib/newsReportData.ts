export interface NewsReportData {
  slug: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  intro: string;
  sections: Array<{
    heading: string;
    body?: string;
    bullets?: string[];
    table?: { headers: string[]; rows: string[][] };
    links?: Array<{ label: string; href: string }>;
  }>;
}

export const NEWS_REPORTS_DATA: Record<string, NewsReportData> = {
  "cambios-regulatorios-vft-2025": {
    slug: "cambios-regulatorios-vft-2025",
    title: "Cambios Regulatorios Clave en Alquileres Turísticos (VFT) en la Costa del Sol para 2025",
    subtitle: "Qué cambia en 2025 y cómo cumplir sin sorpresas",
    location: "Costa del Sol (Andalucía)",
    date: "2025",
    intro:
      "El marco de Viviendas con Fines Turísticos (VFT) en Andalucía se endurece en 2025 y afecta especialmente a municipios con alta presión turística como Málaga, Marbella, Estepona o Fuengirola. Si gestionas una vivienda turística (o estás valorando tramitarla), conviene revisar estatutos, licencias y la documentación de anuncio para evitar sanciones y bloqueos administrativos.",
    sections: [
      {
        heading: "Qué cambia en 2025",
        body:
          "Los cambios más relevantes se concentran en el control comunitario y en la trazabilidad del alojamiento. La comunidad de propietarios gana capacidad de decisión y se refuerzan las obligaciones de identificación y registro en anuncios.",
        bullets: [
          "Mayoría de 3/5 en comunidad para autorizar alquiler turístico en el edificio (reforma de Ley de Propiedad Horizontal vía LO 1/2025).",
          "Posible recargo en gastos comunes hasta el 20% para unidades destinadas a alquiler turístico.",
          "Desde julio 2025: solicitud de código nacional de identificación turística vía Colegio de Registradores (coste aproximado 27€).",
        ],
      },
      {
        heading: "Checklist práctico de cumplimiento",
        body:
          "Antes de solicitar licencias o publicar anuncios, alinea urbanismo, comunidad y registro. Un enfoque de checklist reduce el riesgo de sanciones y de paralización del alta.",
        bullets: [
          "Verificar compatibilidad urbanística y obtener autorización expresa de la comunidad antes de solicitar nueva licencia VFT.",
          "Inscribir la propiedad en el Registro de Turismo de Andalucía (código VFT/MA/XXXXX obligatorio en anuncios).",
          "Solicitar el código nacional de identificación turística y actualizar todos los anuncios con ese identificador.",
          "Contratar seguro de responsabilidad civil (cobertura mínima pendiente Decreto 31/2024).",
        ],
      },
      {
        heading: "Notas Municipales",
        body:
          "Málaga: moratoria de nuevos registros en zonas saturadas. Marbella: ordenanza específica que exige licencia municipal previa antes de operar o publicitar.",
      },
      {
        heading: "Enlaces Útiles",
        links: [
          { label: "Registro Turismo Andalucía", href: "https://www.juntadeandalucia.es/turismoydeporte/regtur" },
          { label: "Normativas municipales Marbella", href: "https://urbanismo.marbella.es" },
          { label: "Colegio de Registradores (código nacional)", href: "https://www.registradores.org" },
          { label: "BOE (buscar LO 1/2025)", href: "https://www.boe.es/buscar/act.php?id=BOE-A-2025-XXXX" },
        ],
      },
    ],
  },

  "fin-golden-visa-2025": {
    slug: "fin-golden-visa-2025",
    title: "Fin del Golden Visa Inmobiliario y su Impacto en el Mercado de Lujo de la Costa del Sol",
    subtitle: "Impacto real en el segmento premium y alternativas para no UE",
    location: "Costa del Sol (segmento lujo)",
    date: "2025",
    intro:
      "Desde abril 2025 se elimina la residencia por inversión inmobiliaria ≥500.000€ (LO 1/2025, entrada en vigor 3 abril). Aunque la Golden Visa representa una porción limitada de transacciones, el cambio influye en expectativas, calendarios de decisión y en la narrativa comercial del lujo en la Costa del Sol.",
    sections: [
      {
        heading: "Qué cambia y por qué importa",
        body:
          "La principal consecuencia no es un desplome de demanda, sino la necesidad de reencuadrar la propuesta para inversores extracomunitarios: menos foco en la residencia ligada a compra y más en alternativas de visado y planificación.",
        bullets: [
          "En Costa del Sol se estima un 5–7% de transacciones asociadas; el efecto es más de percepción que de volumen.",
          "El mercado 2025 se describe como resiliente, con demanda europea sosteniendo precios y operaciones en el Triángulo de Oro.",
          "Las renovaciones de Golden Visa previas se mantienen.",
        ],
      },
      {
        heading: "Qué hacer si eres inversor no UE",
        body:
          "Si el objetivo es residir en España, la compra inmobiliaria deja de ser el “vehículo automático” y pasa a ser parte de una estrategia migratoria y fiscal más amplia.",
        bullets: [
          "Explorar alternativas: inversión por otras vías, visado no lucrativo o residencia digital.",
          "Enfocar la propuesta de valor en lifestyle (clima, golf, conectividad y aeropuerto de Málaga).",
          "Si ya existía Golden Visa: revisar plazos y documentación para renovación conforme al régimen transitorio.",
        ],
      },
      {
        heading: "Fuentes y enlaces",
        links: [
          { label: "BOE (buscar LO 1/2025)", href: "https://www.boe.es" },
          { label: "Estadísticas Registradores 2025", href: "https://www.registradores.org/portal-estadistico-registral" },
          { label: "Informe mercado lujo (DM Properties)", href: "https://www.dmproperties.com/informemercado" },
        ],
      },
    ],
  },

  "estadisticas-tendencias-costa-del-sol-2025": {
    slug: "estadisticas-tendencias-costa-del-sol-2025",
    title: "Estadísticas y Tendencias del Mercado Inmobiliario en Costa del Sol 2025",
    subtitle: "Lecturas rápidas para ventas, inversión y pricing",
    location: "Costa del Sol (Málaga/Marbella)",
    date: "2025",
    intro:
      "2025 consolida la Costa del Sol como uno de los polos inmobiliarios más dinámicos. Los datos citados (INE/Registradores/Idealista) apuntan a subidas de precios, alta participación extranjera y un empuje notable del segmento lujo, especialmente en el Triángulo de Oro.",
    sections: [
      {
        heading: "Tabla Clave (INE/Registradores/Idealista 2025)",
        body:
          "Una lectura orientativa de precios medios y demanda internacional por municipios representativos. Útil como referencia rápida para conversaciones de pricing y comparables (no sustituye tasación ni due diligence).",
        table: {
          headers: ["Zona/Municipio", "Precio medio €/m²", "Variación anual", "% Compras extranjeras"],
          rows: [
            ["Marbella", "5.200–5.410", "+9–16%", "~70%"],
            ["Estepona", "~4.000", "+13%", "Alto"],
            ["Málaga capital", "~3.800", "+10–14%", "~30%"],
            ["Triángulo Oro", "Lujo >5.000", "+11–20%", "Alto"],
          ],
        },
      },
      {
        heading: "Acciones para profesionales",
        body:
          "Para mantener criterio consistente entre equipos, conviene fijar una rutina de actualización: fuentes oficiales trimestrales + trackers privados (idealista) + lectura de subsegmentos (lujo, mid-term, vacacional).",
        bullets: [
          "Descargar estadística registral inmobiliaria Q1–Q3 2025 (Registradores).",
          "Consultar índices de precios y series actualizadas (INE/Idealista).",
        ],
        links: [
          { label: "Colegio de Registradores", href: "https://www.registradores.org" },
          { label: "INE", href: "https://www.ine.es" },
          { label: "Idealista", href: "https://www.idealista.com" },
        ],
      },
      {
        heading: "Proyección 2026",
        body:
          "Se cita un escenario de crecimiento moderado (6–8%), condicionado principalmente por la evolución de tipos de interés y por el ajuste del crédito hipotecario.",
      },
    ],
  },

  "pgom-marbella-fiscalidad-2025": {
    slug: "pgom-marbella-fiscalidad-2025",
    title: "Avances en el Plan General de Marbella y Aspectos Fiscales Relevantes 2025",
    subtitle: "Planeamiento (LISTA) + impuestos: lo que conviene vigilar",
    location: "Marbella",
    date: "2025",
    intro:
      "Marbella avanza en su nuevo planeamiento (PGOM + POU bajo LISTA) y 2025 trae, además, claves fiscales relevantes en Andalucía. Esta nota resume el estado del planeamiento y un checklist de impuestos habituales en operaciones y planificación patrimonial.",
    sections: [
      {
        heading: "Planeamiento (PGOM + POU)",
        body:
          "PGOM aprobado inicialmente (junio 2025), pendiente de informes sectoriales; aprobación definitiva estimada fin 2025 / principio 2026. Incluye suelo urbano desarrollable y flexibilización de rústico (según el post).",
        links: [
          { label: "Seguimiento PGOM", href: "https://nuevoplan.marbella.es" },
          { label: "Urbanismo Marbella", href: "https://urbanismo.marbella.es" },
        ],
      },
      {
        heading: "Impuestos clave Andalucía 2025",
        body:
          "En operaciones y planificación, los puntos críticos suelen estar en ISD (bonificaciones), plusvalía municipal (método aplicable) y tributación de no residentes. Ajusta siempre al caso concreto y al municipio.",
        bullets: [
          "ISD: bonificación 99% Grupos I/II (hijos, cónyuges, padres) en sucesiones/donaciones.",
          "Plusvalía municipal: método objetivo o ganancia real; revisar coeficientes municipales.",
          "IBI: tasas estables, con posibles revisiones catastrales.",
          "IRNR no residentes: 19–24% sobre rendimientos de alquiler.",
        ],
        links: [
          { label: "Agencia Tributaria Andalucía (ISD)", href: "https://www.juntadeandalucia.es/agenciatributaria" },
        ],
      },
    ],
  },
};
