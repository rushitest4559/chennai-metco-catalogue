const CATEGORY_COLORS = {
  sectioning: { bg: "#fff7ed", accent: "#c2410c", dot: "#ea580c" },
  mounting: { bg: "#f0fdf4", accent: "#15803d", dot: "#16a34a" },
  grinding: { bg: "#eff6ff", accent: "#1d4ed8", dot: "#2563eb" },
  polishing: { bg: "#fdf4ff", accent: "#7e22ce", dot: "#9333ea" },
  "oxide-polishing": { bg: "#fff1f2", accent: "#be123c", dot: "#e11d48" },
  accessories: { bg: "#f8fafc", accent: "#334155", dot: "#475569" },
};

const GRADE_LABEL = {
  Standard: { bg: "#f1f5f9", color: "#334155" },
  Premium: { bg: "#fef3c7", color: "#92400e" },
  Economy: { bg: "#f0fdf4", color: "#166534" },
  Regular: { bg: "#eff6ff", color: "#1e40af" },
  USA: { bg: "#fef2f2", color: "#991b1b" },
  German: { bg: "#f5f3ff", color: "#5b21b6" },
  Japanese: { bg: "#fff7ed", color: "#9a3412" },
  Indian: { bg: "#f0fdf4", color: "#166534" },
};

export default function ProductCard({ product, expanded, onToggle, index }) {
  const colors = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.accessories;

  const grades = product.grade
    ? product.grade.split(" / ").map((g) => g.trim())
    : [];

  return (
    <article
      className={`product-card ${expanded ? "expanded" : ""}`}
      style={{ "--accent": colors.accent, "--card-bg": colors.bg, animationDelay: `${index * 40}ms` }}
    >
      {/* Card top */}
      <div className="card-top" onClick={onToggle}>
        <div className="card-meta-row">
          <span className="card-category">{product.subcategory}</span>
          <div className="card-grades">
            {grades.map((g) => {
              const style = GRADE_LABEL[g] || GRADE_LABEL.Standard;
              return (
                <span key={g} className="grade-chip" style={{ background: style.bg, color: style.color }}>
                  {g}
                </span>
              );
            })}
          </div>
        </div>

        <h3 className="card-title">{product.title}</h3>
        <p className="card-desc">{product.description}</p>

        {product.application && (
          <div className="card-application">
            <span className="app-label">Application</span>
            <span className="app-text">{product.application}</span>
          </div>
        )}

        <div className="card-footer-row">
          <div className="variant-preview">
            {product.variants.slice(0, 4).map((v, i) => (
              <span key={i} className="code-chip">{v[0]}</span>
            ))}
            {product.variants.length > 4 && (
              <span className="code-chip more">+{product.variants.length - 4} more</span>
            )}
          </div>
          <button className="expand-btn" aria-label={expanded ? "Collapse" : "View all variants"}>
            <span className={`expand-arrow ${expanded ? "open" : ""}`}>▾</span>
            <span className="expand-label">{expanded ? "Hide" : "View variants"}</span>
          </button>
        </div>

        {product.moq && (
          <div className="moq-badge">MOQ: {product.moq}</div>
        )}
      </div>

      {/* Expanded variant table */}
      {expanded && (
        <div className="variant-table-wrap">
          {product.notes && (
            <div className="product-notes">
              <span className="notes-icon">ℹ</span>
              {product.notes}
            </div>
          )}
          <div className="table-scroll">
            <table className="variant-table">
              <thead>
                <tr>
                  {product.variantColumns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.variants.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} className={ci === 0 ? "code-cell" : ""}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </article>
  );
}
