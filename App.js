Got it — let me redesign it completely. Something that looks nothing like a typical dashboard. Dark theme, bold typography, unique layout.
Paste this into App.js, save and check the browser:
jsximport { useState } from "react";

const SEV_SCORE = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const INITIAL_RISKS = [
  { id: 1, title: "Unauthorized PHI Access", desc: "Employees may access patient records beyond their role scope.", severity: "High", likelihood: 3, owner: "Esther A.", status: "Open", due: "2025-07-15" },
  { id: 2, title: "Missing Audit Logs", desc: "Cloud SQL audit logging not enabled on all instances.", severity: "Critical", likelihood: 4, owner: "Dev Team", status: "In Progress", due: "2025-06-30" },
  { id: 3, title: "Weak Password Policy", desc: "No MFA enforced for admin accounts.", severity: "High", likelihood: 3, owner: "IT Admin", status: "Open", due: "2025-07-01" },
  { id: 4, title: "Third-Party Vendor Risk", desc: "Vendor contracts lack PIPEDA data handling clauses.", severity: "Medium", likelihood: 2, owner: "Legal", status: "In Progress", due: "2025-08-01" },
  { id: 5, title: "Incident Response Gap", desc: "No documented IR plan for data breach scenarios.", severity: "Critical", likelihood: 2, owner: "Esther A.", status: "Resolved", due: "2025-06-01" },
];

const EMPTY_FORM = { title: "", desc: "", severity: "High", likelihood: 3, owner: "", status: "Open", due: "" };

function score(r) { return SEV_SCORE[r.severity] * r.likelihood; }

const SEV_COLORS = {
  Low: { bg: "#00ff9d22", border: "#00ff9d", text: "#00ff9d" },
  Medium: { bg: "#ffbe0b22", border: "#ffbe0b", text: "#ffbe0b" },
  High: { bg: "#ff6b3522", border: "#ff6b35", text: "#ff6b35" },
  Critical: { bg: "#ff003c22", border: "#ff003c", text: "#ff003c" },
};

const STATUS_COLORS = {
  Open: { bg: "#ff003c22", text: "#ff6b8a" },
  "In Progress": { bg: "#ffbe0b22", text: "#ffbe0b" },
  Resolved: { bg: "#00ff9d22", text: "#00ff9d" },
};

function Badge({ text, type }) {
  const s = type === "status" ? STATUS_COLORS[text] : SEV_COLORS[text];
  if (!s) return <span>{text}</span>;
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border || s.text}`,
      padding: "3px 10px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      display: "inline-block"
    }}>
      {text}
    </span>
  );
}

function ScoreBar({ value }) {
  const max = 20;
  const pct = Math.round((value / max) * 100);
  const color = value <= 3 ? "#00ff9d" : value <= 8 ? "#ffbe0b" : value <= 12 ? "#ff6b35" : "#ff003c";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 60, height: 4, background: "#ffffff15", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ color, fontWeight: 700, fontSize: 13, minWidth: 20 }}>{value}</span>
    </div>
  );
}

export default function App() {
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterSev, setFilterSev] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [nextId, setNextId] = useState(6);

  const filtered = risks.filter(r => {
    if (filterSev && r.severity !== filterSev) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const open = risks.filter(r => r.status === "Open").length;
  const critical = risks.filter(r => r.severity === "Critical").length;
  const resolved = risks.filter(r => r.status === "Resolved").length;
  const inProgress = risks.filter(r => r.status === "In Progress").length;

  function openAdd() { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); }
  function openEdit(r) { setForm({ title: r.title, desc: r.desc, severity: r.severity, likelihood: r.likelihood, owner: r.owner, status: r.status, due: r.due || "" }); setEditId(r.id); setShowModal(true); }
  function closeModal() { setShowModal(false); }

  function save() {
    if (!form.title.trim()) return alert("Please enter a risk title.");
    const r = { ...form, id: editId || nextId, likelihood: parseInt(form.likelihood) };
    if (editId) { setRisks(risks.map(x => x.id === editId ? r : x)); }
    else { setRisks([...risks, r]); setNextId(nextId + 1); }
    setShowModal(false);
  }

  function deleteRisk(id) { if (window.confirm("Delete this risk?")) setRisks(risks.filter(x => x.id !== id)); }

  function exportCSV() {
    const headers = ["ID", "Title", "Description", "Severity", "Likelihood", "Score", "Owner", "Status", "Due Date"];
    const rows = risks.map(r => [r.id, `"${r.title}"`, `"${r.desc}"`, r.severity, r.likelihood, score(r), `"${r.owner}"`, r.status, r.due || ""].join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "risk_register.csv";
    a.click();
  }

  const inp = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #ffffff20",
    borderRadius: 8, fontSize: 14,
    marginTop: 4, boxSizing: "border-box",
    background: "#ffffff08", color: "#fff"
  };
  const labelStyle = { fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minHeight: "100vh", background: "#080d14", color: "#e2e8f0" }}>

      {/* NAV */}
      <div style={{ borderBottom: "1px solid #ffffff10", padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, background: "#080d14", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #2563eb, #7c3aed)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>RiskGuard</span>
          <span style={{ color: "#ffffff30", margin: "0 8px" }}>|</span>
          <span style={{ color: "#64748b", fontSize: 13 }}>Healthcare Compliance</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: "6px 14px", border: "1px solid #ffffff20", borderRadius: 6, background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>EXPORT CSV</button>
          <button onClick={openAdd} style={{ padding: "6px 16px", border: "none", borderRadius: 6, background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>+ ADD RISK</button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem" }}>

        {/* HERO */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>HIPAA · PIPEDA · GRC</div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Risk Register</h1>
          <p style={{ color: "#475569", margin: "8px 0 0", fontSize: 14 }}>Track, score and remediate compliance risks across your healthcare platform.</p>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: "2rem" }}>
          {[
            { label: "Total", value: risks.length, color: "#fff", accent: "#2563eb" },
            { label: "Open", value: open, color: "#ff6b8a", accent: "#ff003c" },
            { label: "In Progress", value: inProgress, color: "#ffbe0b", accent: "#ffbe0b" },
            { label: "Critical", value: critical, color: "#ff6b35", accent: "#ff6b35" },
            { label: "Resolved", value: resolved, color: "#00ff9d", accent: "#00ff9d" },
          ].map(({ label, value, color, accent }) => (
            <div key={label} style={{ background: "#0d1520", border: "1px solid #ffffff0d", borderRadius: 12, padding: "1.25rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Filter</span>
          {[
            [filterSev, setFilterSev, ["", "Low", "Medium", "High", "Critical"], "Severity"],
            [filterStatus, setFilterStatus, ["", "Open", "In Progress", "Resolved"], "Status"],
          ].map(([val, setter, opts, ph], i) => (
            <select key={i} value={val} onChange={e => setter(e.target.value)} style={{ padding: "6px 12px", border: "1px solid #ffffff15", borderRadius: 6, fontSize: 12, background: "#0d1520", color: "#94a3b8", cursor: "pointer" }}>
              {opts.map(o => <option key={o} value={o} style={{ background: "#0d1520" }}>{o || `All ${ph}`}</option>)}
            </select>
          ))}
          <span style={{ fontSize: 12, color: "#334155", marginLeft: 4 }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* TABLE */}
        <div style={{ background: "#0d1520", border: "1px solid #ffffff0d", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ffffff0d" }}>
                {["Risk", "Description", "Severity", "Likelihood", "Score", "Owner", "Due", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#334155", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "#334155" }}>No risks found.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #ffffff06", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#f1f5f9", maxWidth: 160 }}>{r.title}</td>
                  <td style={{ padding: "14px 16px", color: "#475569", maxWidth: 200, fontSize: 12, lineHeight: 1.5 }}>{r.desc}</td>
                  <td style={{ padding: "14px 16px" }}><Badge text={r.severity} /></td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span style={{ color: "#64748b", fontWeight: 600 }}>{r.likelihood}</span>
                    <span style={{ color: "#334155" }}>/5</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}><ScoreBar value={score(r)} /></td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8", fontWeight: 500 }}>{r.owner}</td>
                  <td style={{ padding: "14px 16px", color: "#334155", fontSize: 12 }}>{r.due || "—"}</td>
                  <td style={{ padding: "14px 16px" }}><Badge text={r.status} type="status" /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEdit(r)} style={{ background: "#ffffff08", border: "1px solid #ffffff10", cursor: "pointer", padding: "5px 8px", borderRadius: 6, fontSize: 12, color: "#94a3b8" }}>✏</button>
                      <button onClick={() => deleteRisk(r.id)} style={{ background: "#ff003c10", border: "1px solid #ff003c30", cursor: "pointer", padding: "5px 8px", borderRadius: 6, fontSize: 12, color: "#ff6b8a" }}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && closeModal()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#0d1520", border: "1px solid #ffffff15", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>{editId ? "Edit Risk" : "New Risk"}</h2>
              <button onClick={closeModal} style={{ background: "#ffffff10", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#64748b", fontSize: 16 }}>✕</button>
            </div>
            {[["Risk title", "title", "text", "e.g. Unauthorized data access"], ["Description", "desc", "textarea", "Brief description..."], ["Owner", "owner", "text", "e.g. Esther A."]].map(([lbl, key, type, ph]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>{lbl}</label>
                {type === "textarea"
                  ? <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={{ ...inp, minHeight: 80, resize: "vertical" }} />
                  : <input type="text" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={inp} />}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Severity", "severity", ["Low", "Medium", "High", "Critical"]], ["Status", "status", ["Open", "In Progress", "Resolved"]]].map(([lbl, key, opts]) => (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>{lbl}</label>
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inp}>
                    {opts.map(o => <option key={o} style={{ background: "#0d1520" }}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Likelihood (1–5)</label>
                <select value={form.likelihood} onChange={e => setForm({ ...form, likelihood: e.target.value })} style={inp}>
                  {[1,2,3,4,5].map(n => <option key={n} style={{ background: "#0d1520" }}>{n}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Due date</label>
                <input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #ffffff10" }}>
              <button onClick={closeModal} style={{ padding: "9px 20px", border: "1px solid #ffffff15", borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: "#64748b", fontWeight: 600 }}>Cancel</button>
              <button onClick={save} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Save Risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}