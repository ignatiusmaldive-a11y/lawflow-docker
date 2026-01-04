export interface ReportData {
    slug: string;
    title: string;
    subtitle: string;
    location: string;
    summary: string;
    kpis: {
        label: string;
        value: string;
        trend: string;
        color: string;
        bg: string;
    }[];
    priceData: { year: string; price: number }[];
    originData: { name: string; value: number }[];
    zoneData: { zone: string; price24: number; price25: number }[];
    strategy: { title: string; desc: string }[];
    rentability: { label: string; value: string; desc: string };
    pdfName: string;
}

export const REPORTS_DATA: Record<string, ReportData> = {
    "marbella-2025": {
        slug: "marbella-2025",
        title: "Informe: Mercado Inmobiliario Marbella 2025",
        subtitle: "Consolidación de la Milla de Oro y Crecimiento Este",
        location: "Marbella",
        summary: "El mercado inmobiliario en Marbella muestra una robustez excepcional con la Milla de Oro manteniendo su estatus de activo refugio. Se observa un desplazamiento notable de la demanda hacia Marbella Este debido a la disponibilidad de nuevos proyectos contemporáneos.",
        kpis: [
            { label: "PRECIO MEDIO", value: "6.500 €/m²", trend: "+8.5%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
            { label: "DEMANDA", value: "Alta", trend: "Sostenida", color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 4800 },
            { year: "2021", price: 5100 },
            { year: "2022", price: 5500 },
            { year: "2023", price: 5900 },
            { year: "2024", price: 6150 },
            { year: "2025", price: 6500 }
        ],
        originData: [
            { name: "Reino Unido", value: 18 },
            { name: "Escandinavia", value: 15 },
            { name: "España", value: 12 },
            { name: "Alemania", value: 10 },
            { name: "Oriente Medio", value: 8 },
            { name: "Otros", value: 37 }
        ],
        zoneData: [
            { zone: "Milla de Oro", price24: 11200, price25: 12000 },
            { zone: "Marbella Este", price24: 5100, price25: 5500 },
            { zone: "San Pedro", price24: 3950, price25: 4200 }
        ],
        strategy: [
            { title: "Foco en Obra Nueva", desc: "La demanda prefiere producto contemporáneo 'llave en mano'." },
            { title: "Sostenibilidad", desc: "Certificaciones BREEAM incrementan el valor de reventa en un 12%." }
        ],
        rentability: { label: "RENTABILIDAD ANUAL MEDIIA", value: "5.8% - 7.5%", desc: "Basado en alquiler vacacional y residencial" },
        pdfName: "Informe_Marbella_2025.pdf"
    },
    "costa-del-sol-2025": {
        slug: "costa-del-sol-2025",
        title: "Tendencias Mercado Residencial Costa del Sol 2025",
        subtitle: "El Triángulo de Oro y el Empuje de Estepona",
        location: "Costa del Sol",
        summary: "La Costa del Sol se transforma en un hub de residencia permanente para profesionales remotos de alto nivel. Estepona y Benahavís lideran el crecimiento con infraestructuras mejoradas y una oferta de estilo de vida inigualable.",
        kpis: [
            { label: "PRECIO REGIÓN", value: "4.200 €/m²", trend: "+7.2%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
            { label: "HUB TEC", value: "Creciente", trend: "Málaga impact", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 3100 },
            { year: "2021", price: 3350 },
            { year: "2022", price: 3600 },
            { year: "2023", price: 3850 },
            { year: "2024", price: 4000 },
            { year: "2025", price: 4200 }
        ],
        originData: [
            { name: "R. Unido", value: 20 },
            { name: "Scandic", value: 18 },
            { name: "Bélgica", value: 10 },
            { name: "Alemania", value: 9 },
            { name: "Polonia", value: 7 },
            { name: "Otros", value: 36 }
        ],
        zoneData: [
            { zone: "Benahavís", price24: 4850, price25: 5200 },
            { zone: "Estepona", price24: 4100, price25: 4500 },
            { zone: "Mijas Costa", price24: 3000, price25: 3200 }
        ],
        strategy: [
            { title: "Inversión en Estepona", desc: "La 'Milla de Oro' de Estepona ofrece precios un 30% inferiores a Marbella." },
            { title: "Residencia Digital", desc: "Adecuar espacios para Home Office es ahora crítico para la venta." }
        ],
        rentability: { label: "CRECIMIENTO CAPITAL PROYECTADO", value: "6.0% - 8.0%", desc: "Interanual estimado para activos premium" },
        pdfName: "Tendencias_Costa_Del_Sol_2025.pdf"
    },
    "evolucion-precios-nacional": {
        slug: "evolucion-precios-nacional",
        title: "Informe Nacional: Evolución Precios Inmobiliarios 2025",
        subtitle: "Panorama General y Puntos Calientes",
        location: "España",
        summary: "A nivel nacional, el mercado inmobiliario español muestra una tendencia de crecimiento moderado. La falta de oferta de vivienda nueva en las grandes ciudades sigue siendo el principal motor del aumento de precios.",
        kpis: [
            { label: "PRECIO MEDIO NAC.", value: "2.150 €/m²", trend: "+4.1%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
            { label: "TRANSACCIONES", value: "Estables", trend: "Moderación", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 1750 },
            { year: "2021", price: 1800 },
            { year: "2022", price: 1900 },
            { year: "2023", price: 2050 },
            { year: "2024", price: 2100 },
            { year: "2025", price: 2150 }
        ],
        originData: [
            { name: "España", value: 85 },
            { name: "Extranjero", value: 15 }
        ],
        zoneData: [
            { zone: "Baleares", price24: 4200, price25: 4700 },
            { zone: "Madrid", price24: 4500, price25: 4800 },
            { zone: "Málaga", price24: 2800, price25: 3100 }
        ],
        strategy: [
            { title: "Descentralización", desc: "Oportunidades en ciudades secundarias bien conectadas por AVE." },
            { title: "Build-to-Rent", desc: "El sector institucional sigue focalizado en la generación de stock de alquiler." }
        ],
        rentability: { label: "RENTABILIDAD MEDIA NACIONAL", value: "4.5% - 5.2%", desc: "Bruta antes de impuestos" },
        pdfName: "Evolucion_Precios_España_2025.pdf"
    },
    "alquiler-malaga-2025": {
        slug: "alquiler-malaga-2025",
        title: "Análisis del Mercado de Alquiler en Málaga Capital 2025",
        subtitle: "El Efecto de la Revolución Tecnológica",
        location: "Málaga",
        summary: "Málaga Capital vive una presión sin precedentes en el mercado de alquiler. La llegada de grandes corporaciones tecnológicas ha atraído a miles de trabajadores cualificados, disparando los precios en el Centro y zonas limítrofes.",
        kpis: [
            { label: "PRECIO ALQUILER", value: "14.5 €/m²", trend: "+12%", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
            { label: "OCUPACIÓN", value: "98%", trend: "Máximo Hist.", color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 9.5 },
            { year: "2021", price: 10.2 },
            { year: "2022", price: 11.5 },
            { year: "2023", price: 13.0 },
            { year: "2024", price: 13.8 },
            { year: "2025", price: 14.5 }
        ],
        originData: [
            { name: "Nacional", value: 65 },
            { name: "UE", value: 20 },
            { name: "Nómadas Digitales", value: 15 }
        ],
        zoneData: [
            { zone: "Centro Histórico", price24: 16.5, price25: 18.5 },
            { zone: "Teatinos", price24: 12.5, price25: 14.2 },
            { zone: "Carretera Cádiz", price24: 11.0, price25: 12.5 }
        ],
        strategy: [
            { title: "Reformas Integrales", desc: "Propiedades reformadas obtienen primas de alquiler del 25%." },
            { title: "Contratos Mid-term", desc: "Creciente demanda de 'relocation services' para expatriados." }
        ],
        rentability: { label: "RENDIMIENTO NETO ALQUILER", value: "4.8% - 6.2%", desc: "Descontando gastos operativos en gestión profesional" },
        pdfName: "Mercado_Alquiler_Malaga_2025.pdf"
    },
    "impacto-hipotecas-2025": {
        slug: "impacto-hipotecas-2025",
        title: "Informe Nacional: Impacto de las Hipotecas 2025",
        subtitle: "Navegando el Nuevo Escenario de Tipos",
        location: "Nacional",
        summary: "El mercado hipotecario español entra en una fase de normalización. Tras la volatilidad de años anteriores, 2025 se define por la estabilización del Euribor y un resurgimiento de las hipotecas mixtas.",
        kpis: [
            { label: "EURIBOR 12M", value: "3.2%", trend: "Descenso", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
            { label: "TIPO MEDIO", value: "3.55%", trend: "Estabilizado", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" }
        ],
        priceData: [
            { year: "2021", price: 0.1 },
            { year: "2022", price: 2.2 },
            { year: "2023", price: 4.1 },
            { year: "2024 Q2", price: 3.8 },
            { year: "2024 Q4", price: 3.4 },
            { year: "2025 Q1", price: 3.2 }
        ],
        originData: [
            { name: "Mixtas", value: 65 },
            { name: "Variables", value: 20 },
            { name: "Fijas", value: 15 }
        ],
        zoneData: [
            { zone: "Hip. Compra", price24: 2.8, price25: 2.5 },
            { zone: "Subrogaciones", price24: 1.2, price25: 0.8 },
            { zone: "Eficiencia Energ.", price24: 0.5, price25: 0.9 }
        ],
        strategy: [
            { title: "Hipotecas Verdes", desc: "Hogares A+ obtienen bonificaciones de hasta 15 puntos básicos." },
            { title: "Refinanciación", desc: "El descenso del Euribor favorecerá una oleada de novaciones en el Q3-Q4." }
        ],
        rentability: { label: "RATIO ESFUERZO FINANCIERO", value: "33.5%", desc: "Porcentaje de ingresos destinados a cuota hipotecaria" },
        pdfName: "Estudio_Hipotecario_Nacional_2025.pdf"
    },
    "puerto-banus-2025": {
        slug: "puerto-banus-2025",
        title: "Estudio del Mercado de Lujo en Puerto Banús 2025",
        subtitle: "Análisis detallado del mercado de lujo",
        location: "Puerto Banús",
        summary: "El mercado inmobiliario de lujo en Puerto Banús se consolida en 2025 como uno de los epicentros más resilientes y dinámicos de Europa. La escasez de producto premium y una demanda internacional de alto poder adquisitivo mantienen los precios en máximos históricos.",
        kpis: [
            { label: "PRECIO MEDIO", value: "7.850 €/m²", trend: "+9.2%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
            { label: "SEGMENTO", value: "Ultra-Premium", trend: "Solidez", color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 5800 },
            { year: "2021", price: 6100 },
            { year: "2022", price: 6450 },
            { year: "2023", price: 6850 },
            { year: "2024", price: 7185 },
            { year: "2025", price: 7850 }
        ],
        originData: [
            { name: "R. Unido", value: 15 },
            { name: "Países Bajos/Esc.", value: 12 },
            { name: "EE.UU.", value: 10 },
            { name: "Polonia", value: 8 },
            { name: "Oriente Medio", value: 7 },
            { name: "Otros", value: 48 }
        ],
        zoneData: [
            { zone: "1ª Línea Puerto", price24: 9400, price25: 10350 },
            { zone: "Urb. Lujo", price24: 6800, price25: 7450 },
            { zone: "Premium Periferia", price24: 5200, price25: 5600 }
        ],
        strategy: [
            { title: "Inversión en Periferia", desc: "Urbanizaciones en desarrollo cercanas al puerto con alto potencial." },
            { title: "Upgrade Domótico", desc: "Digitalizar propiedades antiguas incrementa valor en +20%." }
        ],
        rentability: { label: "RENTABILIDAD ALQUILER CORTO PLAZO", value: "6.5% - 8.2%", desc: "Promedio ponderado anual en zona premium" },
        pdfName: "Informe_Puerto_Banus_2025.pdf"
    },
    "inversion-nacional-2025": {
        slug: "inversion-nacional-2025",
        title: "Tendencias Nacionales de Inversión Inmobiliaria 2025",
        subtitle: "Perspectivas de Capital Institucional y Privado",
        location: "España",
        summary: "2025 marca el retorno de los grandes volúmenes de inversión a España. El interés de fondos internacionales por sectores específicos como el Logístico y el Living compensa la cautela en el sector de oficinas tradicional.",
        kpis: [
            { label: "VOLUMEN INVERSIÓN", value: "12.000M €", trend: "+15%", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
            { label: "YIELD LOGÍSTICO", value: "5.1%", trend: "Comprimido", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 8500 },
            { year: "2021", price: 9200 },
            { year: "2022", price: 11500 },
            { year: "2023", price: 9800 },
            { year: "2024", price: 10500 },
            { year: "2025", price: 12000 }
        ],
        originData: [
            { name: "Residencial", value: 40 },
            { name: "Logística", value: 25 },
            { name: "Hoteles", value: 15 },
            { name: "Oficinas", value: 15 },
            { name: "Otros", value: 5 }
        ],
        zoneData: [
            { zone: "Institucional", price24: 7500, price25: 8400 },
            { zone: "Family Office", price24: 2100, price25: 2400 },
            { zone: "Retail Inv.", price24: 900, price25: 1200 }
        ],
        strategy: [
            { title: "Focus 'Living'", desc: "Estudiantes, coliving y senior living son los sub-sectores estrella." },
            { title: "Last Mile Logistics", desc: "Demanda insaturada en los cinturones metropolitanos de Madrid/Bcn." }
        ],
        rentability: { label: "YIELD MEDIO PORTFOLIO", value: "4.2% - 5.5%", desc: "Promedio estimado para activos core/core+" },
        pdfName: "Inversion_Inmobiliaria_Nacional_2025.pdf"
    },
    "turistico-torremolinos-2024": {
        slug: "turistico-torremolinos-2024",
        title: "Análisis del Mercado Turístico en Torremolinos 2024",
        subtitle: "Renovación de Destino e Impacto Inmobiliario",
        location: "Torremolinos",
        summary: "Torremolinos vive una 'segunda juventud' gracias a la renovación de su planta hotelera y la modernización de infraestructuras públicas. Esto ha generado un renovado interés de inversores de renta vacacional.",
        kpis: [
            { label: "PRECIO MEDIO", value: "3.100 €/m²", trend: "+5.5%", color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
            { label: "REVPAR", value: "115 €", trend: "+8.5%", color: "#22c55e", bg: "rgba(34,197,94,0.1)" }
        ],
        priceData: [
            { year: "2020", price: 2400 },
            { year: "2021", price: 2550 },
            { year: "2022", price: 2750 },
            { year: "2023", price: 2950 },
            { year: "2024", price: 3100 }
        ],
        originData: [
            { name: "Nacional", value: 45 },
            { name: "UK", value: 15 },
            { name: "Irlanda", value: 10 },
            { name: "Benelux", value: 12 },
            { name: "UE Otros", value: 18 }
        ],
        zoneData: [
            { zone: "La Carihuela", price24: 3800, price25: 4050 },
            { zone: "Bajondillo", price24: 3500, price25: 3820 },
            { zone: "Centro", price24: 2050, price25: 2250 }
        ],
        strategy: [
            { title: "Viviendas Turísticas", desc: "La regularización de licencias está premiando a las unidades en bloque." },
            { title: "Foco 1ª Línea", desc: "La escasez extrema garantiza rentas incluso en temporada baja." }
        ],
        rentability: { label: "RETORNO BRUTO ESTIMADO", value: "7.2% - 9.0%", desc: "Basado en máxima ocupación estival y fines de semana" },
        pdfName: "Analisis_Turistico_Torremolinos_2024.pdf"
    }
};
