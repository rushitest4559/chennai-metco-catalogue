import { useState, useMemo, useEffect } from "react";
import Fuse from "fuse.js";
import products from "./data/products.json";
import ProductCard from "./components/ProductCard";

const CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "sectioning", label: "Sectioning" },
  { key: "mounting", label: "Mounting" },
  { key: "grinding", label: "Grinding" },
  { key: "polishing", label: "Polishing" },
  { key: "oxide-polishing", label: "Oxide Polishing" },
  { key: "accessories", label: "Accessories" },
];

const codeFuse = new Fuse(products, {
  keys: ["variants"],
  threshold: 0.1,
  includeScore: true,
  getFn: (obj, path) => {
    return obj.variants.map((v) => v[0]);
  },
});

const contentFuse = new Fuse(products, {
  keys: [
    { name: "title", weight: 3 },
    { name: "subcategory", weight: 2 },
    { name: "description", weight: 1.5 },
    { name: "application", weight: 1 },
    { name: "notes", weight: 0.5 },
  ],
  threshold: 0.35,
  includeScore: true,
});

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [codeQuery, setCodeQuery] = useState("");
  const [contentQuery, setContentQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    let base = products;

    if (activeCategory !== "all") {
      base = base.filter((p) => p.category === activeCategory);
    }

    if (!codeQuery && !contentQuery) return base;

    if (codeQuery) {
      const cq = codeQuery.trim().toUpperCase();
      return base.filter((p) =>
        p.variants.some((v) =>
          v[0].toString().toUpperCase().includes(cq)
        )
      );
    }

    if (contentQuery) {
      const results = contentFuse.search(contentQuery);
      const matchedIds = new Set(results.map((r) => r.item.id));
      return base.filter((p) => matchedIds.has(p.id));
    }

    return base;
  }, [activeCategory, codeQuery, contentQuery]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((p) => {
      if (!map[p.subcategory]) map[p.subcategory] = [];
      map[p.subcategory].push(p);
    });
    return map;
  }, [filtered]);

  const totalVariants = useMemo(
    () => filtered.reduce((acc, p) => acc + p.variants.length, 0),
    [filtered]
  );

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-name">CHENNAI METCO</span>
            <span className="brand-tag">Metallographic Consumables Catalogue</span>
          </div>
          <div className="header-stats">
            <span>{filtered.length} products</span>
            <span className="stat-dot">·</span>
            <span>{totalVariants} variants</span>
          </div>
        </div>
      </header>

      {/* Search bar strip */}
      <div className="search-strip">
        <div className="search-strip-inner">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by item code — e.g. EC001, CW003, PRE019..."
              value={codeQuery}
              onChange={(e) => {
                setCodeQuery(e.target.value);
                setContentQuery("");
              }}
              className="search-input"
              spellCheck={false}
            />
            {codeQuery && (
              <button className="clear-btn" onClick={() => setCodeQuery("")}>✕</button>
            )}
            <span className="search-badge">CODE</span>
          </div>
          <div className="search-divider">OR</div>
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search by material, application — e.g. stainless steel, SEM, carbide..."
              value={contentQuery}
              onChange={(e) => {
                setContentQuery(e.target.value);
                setCodeQuery("");
              }}
              className="search-input"
              spellCheck={false}
            />
            {contentQuery && (
              <button className="clear-btn" onClick={() => setContentQuery("")}>✕</button>
            )}
            <span className="search-badge content">SEARCH</span>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="tabs-strip">
        <div className="tabs-inner">
          {CATEGORIES.map((cat) => {
            const count =
              cat.key === "all"
                ? products.length
                : products.filter((p) => p.category === cat.key).length;
            return (
              <button
                key={cat.key}
                className={`tab-btn ${activeCategory === cat.key ? "active" : ""}`}
                onClick={() => {
                  setActiveCategory(cat.key);
                  setExpandedId(null);
                }}
              >
                {cat.label}
                <span className="tab-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="main-content">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <p>No products found for <strong>"{codeQuery || contentQuery}"</strong></p>
            <p className="empty-sub">Try a different code or keyword</p>
          </div>
        ) : (
          Object.entries(grouped).map(([subcat, items]) => (
            <section key={subcat} className="subcat-section">
              <div className="subcat-header">
                <h2 className="subcat-title">{subcat}</h2>
                <span className="subcat-count">{items.length} product{items.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="product-grid">
                {items.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    expanded={expandedId === product.id}
                    onToggle={() =>
                      setExpandedId(expandedId === product.id ? null : product.id)
                    }
                    index={i}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <footer className="site-footer">
        <p>Chennai Metco · Metallographic Consumables · For enquiries contact your sales representative</p>
      </footer>
    </div>
  );
}
