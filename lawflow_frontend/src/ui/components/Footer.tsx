import React from "react";

export function Footer() {
    const scrollMainToTop = () => {
        const contentEl = document.querySelector(".content");
        if (contentEl instanceof HTMLElement) contentEl.scrollTo({ top: 0, left: 0 });
        window.scrollTo(0, 0);
    };

    const navigateTo = (path: string) => {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
        requestAnimationFrame(scrollMainToTop);
    };

    return (
        <footer style={{
            marginTop: 'auto',
            padding: '40px 0 20px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                columnGap: '44px',
                rowGap: '32px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                alignItems: 'start'
            }}>
                {/* Company Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            display: 'grid',
                            placeItems: 'center',
                            background: 'linear-gradient(135deg, rgba(124,58,237,.95), rgba(34,197,94,.65))'
                        }}>◆</div>
                        <span style={{ fontSize: '18px', fontWeight: '900' }}>AMA - CRM</span>
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                        CRM especializado en derecho inmobiliario.
                    </p>
                </div>

                {/* Product Links */}
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo("/informes-sectoriales");
                            }}
                            style={{ color: "var(--text)", textDecoration: "none" }}
                        >
                            Informes Sectoriales
                        </a>
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5', margin: 0, maxWidth: 180 }}>
                        Informes y análisis del sector para entender el mercado y apoyar decisiones.
                    </p>
                </div>

                {/* Legal Links */}
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo("/agencias-polacas");
                            }}
                            style={{ color: "var(--text)", textDecoration: "none" }}
                        >
                            Agencias Polacas
                        </a>
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5', margin: 0, maxWidth: 180 }}>
                        Directorio de referencia de agencias enfocadas en compradores polacos.
                    </p>
                </div>

                {/* Contact & Support */}
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigateTo("/chat");
                            }}
                            style={{ color: "var(--text)", textDecoration: "none" }}
                        >
                            Asistente IA
                        </a>
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.5', margin: 0, maxWidth: 180 }}>
                        Chat inteligente para ayudarte con tareas, contexto y consultas rápidas.
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div style={{
                borderTop: '1px solid var(--line)',
                paddingTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    © 2026 AMA - CRM. Todos los derechos reservados.
                </p>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Twitter</a>
                    <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>LinkedIn</a>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Made with ❤️ in Marbella</span>
                </div>
            </div>
        </footer>
    );
}
