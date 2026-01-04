import React from "react";

export function Footer() {
    const navigateTo = (path: string) => {
        window.history.pushState(null, "", path);
        window.dispatchEvent(new PopStateEvent("popstate"));
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '32px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
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
                        CRM para abogados especializados en derecho inmobiliario.
                    </p>
                </div>

                {/* Product Links */}
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>Informes Sectoriales</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo("/informes-sectoriales"); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Local</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo("/informes-sectoriales"); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Nacional</a></li>
                    </ul>
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
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo("/agencias-polacas"); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Directorio</a></li>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo("/agencias-polacas"); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Criterios de selección</a></li>
                    </ul>
                </div>

                {/* Contact & Support */}
                <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--text)', margin: '0 0 16px 0' }}>Asistente IA</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo("/chat"); }} style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Chat</a></li>
                        <li><a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '14px' }}>Investigación</a></li>
                    </ul>
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
