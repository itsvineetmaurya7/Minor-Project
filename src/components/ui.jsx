// Shared presentation components, formatting helpers, and data-loading utilities used by dashboard pages.
import { createContext, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

export const inr = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const short = (n) => "₹" + (n >= 1e7 ? (n / 1e7).toFixed(1) + "Cr" : n >= 1e5 ? (n / 1e5).toFixed(1) + "L" : Math.round(n / 1000) + "k");
export const sum = (a) => a.reduce((s, x) => s + x.amount, 0);
export const dayStr = (d = 0) => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
export const lastMonths = (n = 6) => {
  const d = new Date(), out = [];
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({ key: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`, label: x.toLocaleString("en", { month: "short" }) });
  }
  return out;
};
export const downloadCsv = (name, head, rows) => {
  // Convert supplied table rows into a CSV file downloaded by the browser.
  const t = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([t], { type: "text/csv" }));
  a.download = name; a.click();
};

const tone = { Success: "green", Approved: "green", Verified: "green", Resolved: "green", Active: "green", Normal: "green", Rejected: "red", Failed: "red", Frozen: "red", Flagged: "red", Inactive: "red", Pending: "amber", Open: "amber", "In Progress": "blue" };
export const Badge = ({ s }) => <span className={"badge " + (tone[s] || "blue")}>{s}</span>;

export const Card = ({ title, action, children, className = "" }) => (
  <section className={"card " + className}>
    {(title || action) && <div className="row ch"><h3>{title}</h3>{action}</div>}
    {children}
  </section>
);

export const Stat = ({ icon: I, label, value, tone: t = "blue" }) => (
  <div className="card stat"><div className={"si " + t}><I size={22} /></div><div><small>{label}</small><h2>{value}</h2></div></div>
);

export const Table = ({ head, rows, empty = "No records found" }) => (
  <div className="wrap"><table>
    <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.length ? rows : <tr><td colSpan={head.length} className="mute">{empty}</td></tr>}</tbody>
  </table></div>
);

export const Field = ({ label, children }) => <label className="fld"><span>{label}</span>{children}</label>;
export const Loader = () => <div className="loader"><i /></div>;

export function Modal({ title, onClose, children }) {
  return (
    <div className="mo" onClick={onClose}>
      <div className="md" onClick={(e) => e.stopPropagation()}>
        <div className="row"><h3>{title}</h3><button className="ib" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

const T = createContext(() => {});
export const useToast = () => useContext(T);
export function ToastProvider({ children }) {
  const [m, setM] = useState(null);
  const show = (text, bad) => { setM({ text, bad }); setTimeout(() => setM(null), 3000); };
  return <T.Provider value={show}>{children}{m && <div className={"toast" + (m.bad ? " bad" : "")}>{m.text}</div>}</T.Provider>;
}

export function useLoad(fn, deps = []) {
  // Load data on mount or dependency changes; return a reload function for refreshing after updates.
  const [d, setD] = useState(null);
  const load = () => fn().then(setD);
  useEffect(() => { load(); }, deps);
  return [d, load];
}

export const TxnTable = ({ txns }) => (
  <Table head={["Date", "Description", "Category", "Amount", "Status"]} rows={txns.map((t) => (
    <tr key={t.id}>
      <td>{t.date}</td><td>{t.desc}</td><td><span className="chip">{t.category}</span></td>
      <td className={t.type === "CREDIT" ? "cr" : "dr"}><b>{t.type === "CREDIT" ? "+" : "−"}{inr(t.amount)}</b></td>
      <td><Badge s={t.status} /></td>
    </tr>
  ))} />
);
