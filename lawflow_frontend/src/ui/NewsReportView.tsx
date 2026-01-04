import React from "react";
import { NewsReportData } from "../lib/newsReportData";

export function NewsReportView({ data }: { data: NewsReportData }) {
  const paragraphs = (text: string) =>
    text
      .split(/\n\s*\n/g)
      .map((p) => p.trim())
      .filter(Boolean);

  return (
    <div className="writerReportWrap">
      <article className="writerReportArticle">
        <div className="writerReportMeta writerReportMetaTight">
          <span className="pill warn">Noticias 2025</span>
          <span className="pill neutral">{data.location}</span>
          <span className="pill neutral">{data.date}</span>
        </div>

        <div className="writerReportLead writerReportLeadTight">
          {paragraphs(data.intro).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {data.sections.map((section) => (
          <section key={section.heading} className="writerReportSection">
            <h2 className="writerReportSectionTitle">{section.heading}</h2>

            {section.body ? (
              <div className="writerReportBody">
                {paragraphs(section.body).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            ) : null}

            {section.bullets?.length ? (
              <div className="writerReportCallout">
                <ul className="writerReportList">
                  {section.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {section.table ? (
              <div className="writerReportTableWrap">
                <table className="table writerReportTable" style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      {section.table.headers.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.table.rows.map((row, idx) => (
                      <tr key={idx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            {section.links?.length ? (
              <ul className="writerReportLinks">
                {section.links.map((l) => (
                  <li key={l.href} className="writerReportLinkItem">
                    <a className="writerReportLinkLabel" href={l.href} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                    <a className="writerReportLinkUrl" href={l.href} target="_blank" rel="noreferrer">
                      {l.href}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </div>
  );
}
