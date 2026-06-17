import { useState } from "react";

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

function Badge({ text }) {
  const styles = {
    Low: { background: "#EAF3DE", color: "#27500A" },
    Medium: { background: "#FAEEDA", color: "#633806" },
    High: { background: "#FAECE7", color: "#712B13" },
    Critical: { background: "#FCEBEB", color: "#791F1F" },
    Open: { background: "#E6F1FB", color: "#0C447C" },
    "In Progress": { background: "#FAEEDA", color: "#633806" },
    Resolved: { background: "#EAF3DE", color: "#27500A" },
  };
  const s = styles[text] || {};
  return (
    <span style={{ ...s, display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
      {text}
    </span>
  );
}

function ScoreCell({ value }) {
  const color = value <= 3 ? "#27500A" : value <= 8 ? "#633806" : value <= 12 ? "#712B13" : "#791F1F";
  return <span style={{ color, fontWeight: 600, fontSize: 15 }}>{value}</span>;
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

  const inp = { width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, marginTop: 4, boxSizing: "border-box" };
  const labelStyle = { fontSize: 13, color: "#555", display: "block", marginBottom: 8 };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem", color: "#111" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0 }}>Risk Register</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "4px 0 0" }}>Healthcare Compliance — HIPAA / PIPEDA</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{ padding: "8px 16px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>⬇ Export CSV</button>
          <button onClick={openAdd} style={{ padding: "8px 16px", border: "1px solid #111", borderRadius: 8, background: "#111", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>+ Add Risk</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
        {[["Total Risks", risks.length, "#111"], ["Open", open, "#C0392B"], ["Critical", critical, "#791F1F"], ["Resolved", resolved, "#27500A"]].map(([lbl, val, color]) => (
          <div key={lbl} style={{ background: "#f7f7f7", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 6 }}>{lbl}</div>
            <div style={{ fontSize: 26, fontWeight: 600, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
        <select value={filterSev} onChange={e => setFilterSev(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}>
          <option value="">All severities</option>
          <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}>
          <option value="">All statuses</option>
          <option>Open</option><option>In Progress</option><option>Resolved</option>
        </select>
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f7f7f7" }}>
              {["Risk", "Description", "Severity", "Likelihood", "Score", "Owner", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontWeight: 500, fontSize: 12, color: "#666", borderBottom: "1px solid #eee" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: "2.5rem", textAlign: "center", color: "#888" }}>No risks found. Add one above.</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 12px", fontWeight: 500 }}>{r.title}</td>
                <td style={{ padding: "10px 12px", color: "#666", maxWidth: 200 }}>{r.desc}</td>
                <td style={{ padding: "10px 12px" }}><Badge text={r.severity} /></td>
                <td style={{ padding: "10px 12px", textAlign: "center" }}>{r.likelihood}/5</td>
                <td style={{ padding: "10px 12px" }}><ScoreCell value={score(r)} /></td>
                <td style={{ padding: "10px 12px" }}>{r.owner}</td>
                <td style={{ padding: "10px 12px" }}><Badge text={r.status} /></td>
                <td style={{ padding: "10px 12px" }}>
                  <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", marginRight: 4, fontSize: 16 }}>✏️</button>
                  <button onClick={() => deleteRisk(r.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div onClick={e => e.target === e.currentTarget && closeModal()} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.5rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: "1.25rem" }}>{editId ? "Edit risk" : "Add risk"}</h2>
            {[["Risk title", "title", "text", "e.g. Unauthorized data access"], ["Description", "desc", "textarea", "Brief description..."], ["Owner", "owner", "text", "e.g. Esther A."]].map(([lbl, key, type, ph]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>{lbl}</label>
                {type === "textarea"
                  ? <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={{ ...inp, minHeight: 72, resize: "vertical" }} />
                  : <input type="text" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} style={inp} />}
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["Severity", "severity", ["Low", "Medium", "High", "Critical"]], ["Status", "status", ["Open", "In Progress", "Resolved"]]].map(([lbl, key, opts]) => (
                <div key={key} style={{ marginBottom: "1rem" }}>
                  <label style={labelStyle}>{lbl}</label>
                  <select value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={inp}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Likelihood (1–5)</label>
                <select value={form.likelihood} onChange={e => setForm({ ...form, likelihood: e.target.value })} style={inp}>
                  {[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>Due date</label>
                <input type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} style={inp} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: "1rem" }}>
              <button onClick={closeModal} style={{ padding: "8px 18px", border: "1px solid #ddd", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>Cancel</button>
              <button onClick={save} style={{ padding: "8px 18px", border: "1px solid #111", borderRadius: 8, background: "#111", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Save risk</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
