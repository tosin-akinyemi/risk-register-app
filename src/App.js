import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

const SEV_SCORE = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const INITIAL_RISKS = [
  { id: 1, title: "Unauthorized PHI Access", desc: "Employees may access patient records beyond their role scope.", severity: "High", likelihood: 3, owner: "Esther A.", status: "Open", due: "2025-07-15" },
  { id: 2, title: "Missing Audit Logs", desc: "Cloud SQL audit logging not enabled on all instances.", severity: "Critical", likelihood: 4, owner: "Dev Team", status: "In Progress", due: "2025-06-30" },
  { id: 3, title: "Weak Password Policy", desc: "No MFA enforced for admin accounts.", severity: "High", likelihood: 3, owner: "IT Admin", status: "Open", due: "2025-07-01" },
  { id: 4, title: "Third-Party Vendor Risk", desc: "Vendor contracts lack PIPEDA data handling clauses.", severity: "Medium", likelihood: 2, owner: "Legal", status: "In Progress", due: "2025-08-01" },
  { id: 5, title: "Incident Response Gap", desc: "No documented IR plan for data breach scenarios.", severity: "Critical", likelihood: 2, owner: "Esther A.", status: "Resolved", due: "2025-06-01" },
];

const HIPAA_GAPS = [
  { id: 1, control: "Access Control", ref: "§164.312(a)", desc: "Unique user identification and emergency access procedures.", status: "Compliant" },
  { id: 2, control: "Audit Controls", ref: "§164.312(b)", desc: "Hardware, software and procedural mechanisms to record activity.", status: "Gap" },
  { id: 3, control: "Integrity Controls", ref: "§164.312(c)", desc: "Protect ePHI from improper alteration or destruction.", status: "Compliant" },
  { id: 4, control: "Transmission Security", ref: "§164.312(e)", desc: "Encryption and network controls for ePHI in transit.", status: "In Progress" },
  { id: 5, control: "Risk Analysis", ref: "§164.308(a)(1)", desc: "Accurate and thorough assessment of potential risks to ePHI.", status: "Compliant" },
  { id: 6, control: "Workforce Training", ref: "§164.308(a)(5)", desc: "Security awareness and training program for all staff.", status: "Gap" },
  { id: 7, control: "Incident Response", ref: "§164.308(a)(6)", desc: "Policies for identifying and responding to security incidents.", status: "Gap" },
  { id: 8, control: "Contingency Plan", ref: "§164.308(a)(7)", desc: "Data backup, disaster recovery and emergency mode operations.", status: "In Progress" },
  { id: 9, control: "Business Associates", ref: "§164.308(b)", desc: "BAAs in place with all vendors handling ePHI.", status: "Compliant" },
  { id: 10, control: "Physical Safeguards", ref: "§164.310", desc: "Facility access controls and workstation security.", status: "Compliant" },
];

const PIPEDA_GAPS = [
  { id: 1, control: "Accountability", ref: "Principle 1", desc: "Designate individual responsible for compliance.", status: "Compliant" },
  { id: 2, control: "Identifying Purposes", ref: "Principle 2", desc: "Document purposes for collecting personal information.", status: "Compliant" },
  { id: 3, control: "Consent", ref: "Principle 3", desc: "Obtain meaningful consent for collection and use of data.", status: "Gap" },
  { id: 4, control: "Limiting Collection", ref: "Principle 4", desc: "Collect only what is necessary for identified purposes.", status: "Compliant" },
  { id: 5, control: "Limiting Use", ref: "Principle 5", desc: "Use or disclose data only for original purposes.", status: "In Progress" },
  { id: 6, control: "Accuracy", ref: "Principle 6", desc: "Keep personal information accurate and up to date.", status: "Compliant" },
  { id: 7, control: "Safeguards", ref: "Principle 7", desc: "Protect personal information with appropriate security.", status: "Gap" },
  { id: 8, control: "Openness", ref: "Principle 8", desc: "Make privacy policies readily available.", status: "Compliant" },
  { id: 9, control: "Individual Access", ref: "Principle 9", desc: "Individuals can access their own personal information.", status: "Gap" },
  { id: 10, control: "Challenging Compliance", ref: "Principle 10", desc: "Process for individuals to challenge compliance.", status: "In Progress" },
];

const EMPTY_FORM = { title: "", desc: "", severity: "High", likelihood: 3, owner: "", status: "Open", due: "" };

function score(r) { return SEV_SCORE[r.severity] * r.likelihood; }

const SEV = {
  Low:      { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
  Medium:   { bg: "#fefce8", border: "#fde047", text: "#854d0e" },
  High:     { bg: "#fff7ed", border: "#fdba74", text: "#9a3412" },
  Critical: { bg: "#fff1f2", border: "#fda4af", text: "#9f1239" },
};

const STA = {
  Open:          { bg: "#f0f9ff", border: "#7dd3fc", text: "#0c4a6e" },
  "In Progress": { bg: "#fefce8", border: "#fde047", text: "#854d0e" },
  Resolved:      { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
  Compliant:     { bg: "#f0fdf4", border: "#86efac", text: "#166534" },
  Gap:           { bg: "#fff1f2", border: "#fda4af", text: "#9f1239" },
};

function Chip({ text, map }) {
  const s = (map || {})[text] || {};
  return (
    <span style={{
      background: s.bg || "#f1f5f9", color: s.text || "#475569",
      border: `1px solid ${s.border || "#e2e8f0"}`,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", display: "inline-block"
    }}>{text}</span>
  );
}

function ScoreBar({ value }) {
  const pct = Math.round((value / 20) * 100);
  const color = value <= 3 ? "#22c55e" : value <= 8 ? "#eab308" : value <= 12 ? "#f97316" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 56, height: 3, background: "#e2e8f0", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontWeight: 700, fontSize: 13, color }}>{value}</span>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("register");
  const [risks, setRisks] = useState(INITIAL_RISKS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterSev, setFilterSev] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [nextId, setNextId] = useState(6);
  const [framework, setFramework] = useState("HIPAA");

  const gaps = framework === "HIPAA" ? HIPAA_GAPS : PIPEDA_GAPS;
  const gapCount = gaps.filter(g => g.status === "Gap").length;
  const compliantCount = gaps.filter(g => g.status === "Compliant").length;
  const inProgressCount = gaps.filter(g => g.status === "In Progress").length;
  const complianceScore = Math.round((compliantCount / gaps.length) * 100);

  const filtered = risks.filter(r => {
    if (filterSev && r.severity !== filterSev) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const open = risks.filter(r => r.status === "Open").length;
  const critical = risks.filter(r => r.severity === "Critical").length;
  const resolved = risks.filter(r => r.status === "Resolved").length;
  const inProgress = risks.filter(r => r.status === "In Progress").length;

  const sevData = ["Low","Medium","High","Critical"].map(s => ({ name: s, count: risks.filter(r => r.severity === s).length }));
  const statusData = [
    { name: "Open", value: open, color: "#ef4444" },
    { name: "In Progress", value: inProgress, color: "#eab308" },
    { name: "Resolved", value: resolved, color: "#22c55e" },
  ];

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
    const headers = ["ID","Title","Description","Severity","Likelihood","Score","Owner","Status","Due Date"];
    const rows = risks.map(r => [r.id,`"${r.title}"`,`"${r.desc}"`,r.severity,r.likelihood,score(r),`"${r.owner}"`,r.status,r.due||""].join(","));
    const csv = [headers.join(","),...rows].join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv);
    a.download = "risk_register.csv";
    a.click();
  }

  const font = "'Inter','Segoe UI',sans-serif";
  const inp = { width:"100%", padding:"9px 12px", border:"1px solid #e2e8f0", borderRadius:8, fontSize:14, marginTop:4, boxSizing:"border-box", background:"#fff", color:"#0f172a", fontFamily:font };
  const lbl = { fontSize:12, color:"#64748b", display:"block", marginBottom:4, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:font };

  const navItems = [
    { id: "register", icon: "📋", label: "Risk Register" },
    { id: "gaps", icon: "🔍", label: "Gap Analysis" },
    { id: "reports", icon: "📊", label: "Reports" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: font, minHeight: "100vh", background: "#f8fafc" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>

          {/* SIDEBAR */}
          <div style={{ width: 220, background: "#0f172a", display: "flex", flexDirection: "column", padding: "2rem 1.25rem", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 30, height: 30, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🛡</div>
                <span style={{ fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>RiskGuard</span>
              </div>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: 38 }}>Healthcare GRC</div>
            </div>

            <nav style={{ flex: 1 }}>
              {navItems.map(({ id, icon, label }) => (
                <div key={id} onClick={() => setPage(id)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                  background: page === id ? "#1e293b" : "transparent",
                  color: page === id ? "#f1f5f9" : "#475569",
                  fontSize: 13, fontWeight: page === id ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s",
                  borderLeft: page === id ? "2px solid #3b82f6" : "2px solid transparent"
                }}>
                  <span style={{ fontSize: 15 }}>{icon}</span>
                  {label}
                </div>
              ))}
            </nav>

            <div style={{ borderTop: "1px solid #1e293b", paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>EA</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9" }}>Esther A.</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>GRC Analyst</div>
                </div>
              </div>
            </div>
          </div>

          {/* MAIN */}
          <div style={{ marginLeft: 220, flex: 1, padding: "2rem 2.5rem" }}>

            {/* ── RISK REGISTER ── */}
            {page === "register" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>HIPAA · PIPEDA · ISO 27001</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>Risk Register</h1>
                    <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Monitor, score and remediate compliance risks</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={exportCSV} style={{ padding: "8px 16px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: font }}>↓ Export CSV</button>
                    <button onClick={openAdd} style={{ padding: "8px 18px", border: "none", borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: font }}>+ Add Risk</button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: "2rem" }}>
                  {[
                    { label: "Total Risks", value: risks.length, color: "#0f172a", top: "#3b82f6" },
                    { label: "Open", value: open, color: "#9f1239", top: "#ef4444" },
                    { label: "In Progress", value: inProgress, color: "#854d0e", top: "#eab308" },
                    { label: "Critical", value: critical, color: "#9a3412", top: "#f97316" },
                    { label: "Resolved", value: resolved, color: "#166534", top: "#22c55e" },
                  ].map(({ label, value, color, top }) => (
                    <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "1.25rem 1rem", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: top }} />
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                      <div style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Filter by</span>
                  {[[filterSev, setFilterSev, ["","Low","Medium","High","Critical"], "Severity"],[filterStatus, setFilterStatus, ["","Open","In Progress","Resolved"], "Status"]].map(([val, setter, opts, ph], i) => (
                    <select key={i} value={val} onChange={e => setter(e.target.value)} style={{ padding: "7px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, background: "#fff", color: "#475569", fontFamily: font, cursor: "pointer" }}>
                      {opts.map(o => <option key={o} value={o}>{o || `All ${ph}`}</option>)}
                    </select>
                  ))}
                  <span style={{ fontSize: 12, color: "#cbd5e1" }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
                </div>

                <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                        {["Risk","Description","Severity","Likelihood","Score","Owner","Due","Status",""].map(h => (
                          <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr><td colSpan={9} style={{ padding: "3rem", textAlign: "center", color: "#cbd5e1" }}>No risks found.</td></tr>
                      ) : filtered.map((r, i) => (
                        <tr key={r.id} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                          <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0f172a", maxWidth: 160 }}>{r.title}</td>
                          <td style={{ padding: "13px 16px", color: "#64748b", maxWidth: 200, fontSize: 12, lineHeight: 1.6 }}>{r.desc}</td>
                          <td style={{ padding: "13px 16px" }}><Chip text={r.severity} map={SEV} /></td>
                          <td style={{ padding: "13px 16px", textAlign: "center" }}><span style={{ fontWeight: 700, color: "#334155" }}>{r.likelihood}</span><span style={{ color: "#cbd5e1" }}>/5</span></td>
                          <td style={{ padding: "13px 16px" }}><ScoreBar value={score(r)} /></td>
                          <td style={{ padding: "13px 16px", color: "#475569", fontWeight: 500 }}>{r.owner}</td>
                          <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 12 }}>{r.due || "—"}</td>
                          <td style={{ padding: "13px 16px" }}><Chip text={r.status} map={STA} /></td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button onClick={() => openEdit(r)} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", padding: "5px 9px", borderRadius: 6, fontSize: 12, color: "#64748b" }}>✏</button>
                              <button onClick={() => deleteRisk(r.id)} style={{ background: "#fff1f2", border: "none", cursor: "pointer", padding: "5px 9px", borderRadius: 6, fontSize: 12, color: "#e11d48" }}>✕</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── GAP ANALYSIS ── */}
            {page === "gaps" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Compliance Framework</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>Gap Analysis</h1>
                    <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Identify missing controls and compliance gaps</p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["HIPAA","PIPEDA"].map(f => (
                      <button key={f} onClick={() => setFramework(f)} style={{ padding: "8px 18px", border: framework === f ? "none" : "1px solid #e2e8f0", borderRadius: 8, background: framework === f ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#fff", color: framework === f ? "#fff" : "#475569", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: font }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: "2rem" }}>
                  {[
                    { label: "Compliance Score", value: `${complianceScore}%`, color: complianceScore >= 70 ? "#166534" : "#9f1239", top: complianceScore >= 70 ? "#22c55e" : "#ef4444" },
                    { label: "Compliant", value: compliantCount, color: "#166534", top: "#22c55e" },
                    { label: "In Progress", value: inProgressCount, color: "#854d0e", top: "#eab308" },
                    { label: "Gaps", value: gapCount, color: "#9f1239", top: "#ef4444" },
                  ].map(({ label, value, color, top }) => (
                    <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "1.25rem 1rem", position: "relative", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: top }} />
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                      <div style={{ fontSize: 34, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                        {["Control","Reference","Description","Status"].map(h => (
                          <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.map((g, i) => (
                        <tr key={g.id} style={{ borderBottom: "1px solid #f8fafc", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#f0f9ff"}
                          onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc"}>
                          <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0f172a" }}>{g.control}</td>
                          <td style={{ padding: "13px 16px", color: "#3b82f6", fontWeight: 600, fontSize: 12 }}>{g.ref}</td>
                          <td style={{ padding: "13px 16px", color: "#64748b", fontSize: 12, lineHeight: 1.6 }}>{g.desc}</td>
                          <td style={{ padding: "13px 16px" }}><Chip text={g.status} map={STA} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── REPORTS ── */}
            {page === "reports" && (
              <>
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Analytics</div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>Reports</h1>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Visual summary of your compliance risk landscape</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>Risks by Severity</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={sevData} barSize={36}>
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                        <Bar dataKey="count" radius={[6,6,0,0]}>
                          {sevData.map((entry, i) => {
                            const colors = ["#22c55e","#eab308","#f97316","#ef4444"];
                            return <Cell key={i} fill={colors[i]} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>Risks by Status</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #f1f5f9", fontSize: 13 }} />
                        <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", gridColumn: "1 / -1" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1.25rem" }}>Top Risks by Score</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                          {["Rank","Risk","Severity","Score","Owner","Status"].map(h => (
                            <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...risks].sort((a,b) => score(b) - score(a)).map((r, i) => (
                          <tr key={r.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 700, color: i === 0 ? "#ef4444" : "#94a3b8", fontSize: 14 }}>#{i+1}</td>
                            <td style={{ padding: "10px 12px", fontWeight: 600, color: "#0f172a" }}>{r.title}</td>
                            <td style={{ padding: "10px 12px" }}><Chip text={r.severity} map={SEV} /></td>
                            <td style={{ padding: "10px 12px" }}><ScoreBar value={score(r)} /></td>
                            <td style={{ padding: "10px 12px", color: "#475569" }}>{r.owner}</td>
                            <td style={{ padding: "10px 12px" }}><Chip text={r.status} map={STA} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ── SETTINGS ── */}
            {page === "settings" && (
              <>
                <div style={{ marginBottom: "2rem" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>Configuration</div>
                  <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>Settings</h1>
                  <p style={{ color: "#94a3b8", margin: "6px 0 0", fontSize: 13 }}>Manage your compliance framework and preferences</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1rem" }}>Active Framework</h3>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: "1rem", lineHeight: 1.6 }}>Select the compliance framework to use across Gap Analysis and reporting.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["HIPAA","PIPEDA"].map(f => (
                        <button key={f} onClick={() => setFramework(f)} style={{ padding: "10px 22px", border: framework === f ? "none" : "1px solid #e2e8f0", borderRadius: 10, background: framework === f ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#f8fafc", color: framework === f ? "#fff" : "#475569", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: font }}>{f}</button>
                      ))}
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: "0.75rem" }}>Currently active: <strong style={{ color: "#3b82f6" }}>{framework}</strong></p>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1rem" }}>About RiskGuard</h3>
                    <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8, margin: 0 }}>
                      Built by <strong style={{ color: "#0f172a" }}>Esther Akinyemi</strong><br/>
                      Privacy & Compliance Analyst | GRC Specialist<br/><br/>
                      Inspired by real HIPAA and PIPEDA compliance work on a live healthcare platform. Built with React and Recharts.
                    </p>
                  </div>

                  <div style={{ background: "#fff", borderRadius: 16, padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", gridColumn: "1 / -1" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 1rem" }}>Risk Score Matrix</h3>
                    <p style={{ fontSize: 13, color: "#64748b", marginBottom: "1rem" }}>Score = Severity Weight × Likelihood (1–5)</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                      {[
                        { sev: "Low", weight: 1, range: "1–5", color: "#22c55e", bg: "#f0fdf4" },
                        { sev: "Medium", weight: 2, range: "2–10", color: "#eab308", bg: "#fefce8" },
                        { sev: "High", weight: 3, range: "3–15", color: "#f97316", bg: "#fff7ed" },
                        { sev: "Critical", weight: 4, range: "4–20", color: "#ef4444", bg: "#fff1f2" },
                      ].map(({ sev, weight, range, color, bg }) => (
                        <div key={sev} style={{ background: bg, borderRadius: 10, padding: "1rem", textAlign: "center" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{sev}</div>
                          <div style={{ fontSize: 22, fontWeight: 900, color, marginBottom: 4 }}>×{weight}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>Score range: {range}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* MODAL */}
        {showModal && (
          <div onClick={e => e.target === e.currentTarget && closeModal()} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(6px)" }}>
            <div style={{ background: "#fff", borderRadius: 18, padding: "2rem", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{editId ? "Edit Risk" : "New Risk"}</h2>
                <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", color: "#64748b", fontSize: 15 }}>✕</button>
              </div>
              {[["Risk title","title","text","e.g. Unauthorized data access"],["Description","desc","textarea","Brief description..."],["Owner","owner","text","e.g. Esther A."]].map(([l,key,type,ph]) => (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <label style={lbl}>{l}</label>
                  {type === "textarea"
                    ? <textarea value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={ph} style={{...inp,minHeight:80,resize:"vertical"}} />
                    : <input type="text" value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} placeholder={ph} style={inp} />}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[["Severity","severity",["Low","Medium","High","Critical"]],["Status","status",["Open","In Progress","Resolved"]]].map(([l,key,opts]) => (
                  <div key={key} style={{ marginBottom: "1rem" }}>
                    <label style={lbl}>{l}</label>
                    <select value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} style={inp}>
                      {opts.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lbl}>Likelihood (1–5)</label>
                  <select value={form.likelihood} onChange={e => setForm({...form,likelihood:e.target.value})} style={inp}>
                    {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={lbl}>Due date</label>
                  <input type="date" value={form.due} onChange={e => setForm({...form,due:e.target.value})} style={inp} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #f1f5f9" }}>
                <button onClick={closeModal} style={{ padding: "9px 20px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#64748b", fontFamily: font, fontWeight: 600 }}>Cancel</button>
                <button onClick={save} style={{ padding: "9px 20px", border: "none", borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: font }}>Save Risk</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}