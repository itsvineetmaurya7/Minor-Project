// Admin portal for system overview, user controls, rate management, reports, and audit history.
// Sections share the dashboard Layout, API adapter, reusable UI, and chart components.
import { useState } from "react";
import { LayoutDashboard, Users, Percent, BarChart3, ScrollText, UserCog, Banknote, HandCoins, Receipt, Download } from "lucide-react";
import { api } from "../api";
import Layout from "../components/Layout";
import { Badge, Card, Field, Loader, Stat, Table, useLoad, useToast, inr, short, sum, lastMonths, downloadCsv } from "../components/ui";
import { Bars, Donut, LineChart } from "../components/charts";
import Profile from "./Profile";

const nav = [["overview", "Overview", LayoutDashboard], ["users", "User Management", Users], ["rates", "Interest Rates", Percent], ["reports", "Reports", BarChart3], ["audit", "Audit Log", ScrollText], ["profile", "Profile", UserCog]];

function Overview() {
  const [d] = useLoad(async () => ({ s: await api.stats(), t: await api.allTxns(), l: await api.loans(), a: await api.audit() }));
  if (!d) return <Loader />;
  const M = lastMonths(6), cnt = (s) => d.l.filter((x) => x.status === s).length;
  return (
    <>
      <div className="g4" style={{ marginBottom: 18 }}>
        <Stat icon={Users} label="Customers" value={d.s.customers} /><Stat icon={Banknote} label="Total deposits" value={short(d.s.deposits)} tone="green" />
        <Stat icon={HandCoins} label="Loans disbursed" value={short(d.s.disbursed)} tone="amber" /><Stat icon={Receipt} label="Transactions" value={d.s.txnCount} tone="blue" />
      </div>
      <div className="g2">
        <Card title="Transaction volume"><LineChart labels={M.map((m) => m.label)} data={M.map((m) => sum(d.t.filter((x) => x.date.startsWith(m.key))))} /></Card>
        <Card title="Loan applications"><Donut center={d.l.length} data={[{ label: "Approved", value: cnt("Approved"), color: "#2563eb" }, { label: "Pending", value: cnt("Pending"), color: "#38bdf8" }, { label: "Rejected", value: cnt("Rejected"), color: "#0a1f44" }]} /></Card>
      </div>
      <Card title="Recent activity"><Table head={["Time", "Event"]} rows={d.a.slice(0, 5).map((x) => <tr key={x.id}><td>{x.date}</td><td>{x.text}</td></tr>)} empty="No activity yet" /></Card>
    </>
  );
}

function UserMgmt() {
  const [u, load] = useLoad(api.users), [f, setF] = useState({ name: "", email: "", password: "" }), toast = useToast();
  if (!u) return <Loader />;
  const add = async () => {
    if (f.name.trim().length < 3 || !/^\S+@\S+\.\S+$/.test(f.email) || f.password.length < 6) return toast("Enter name, valid email and 6+ character password", true);
    try { await api.addEmployee(f); setF({ name: "", email: "", password: "" }); load(); toast("Employee added"); } catch (e) { toast(String(e), true); }
  };
  return (
    <>
      <Card title="Add employee"><div className="g4" style={{ alignItems: "end" }}>
        {[["name", "Name", "text"], ["email", "Email", "email"], ["password", "Temporary password", "password"]].map(([k, l, t]) => <Field key={k} label={l}><input type={t} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
        <div className="fld"><button className="btn" style={{ width: "100%" }} onClick={add}>Add employee</button></div></div></Card>
      <Card title="All users"><Table head={["Name", "Email", "Role", "KYC", "Status", "Action"]} rows={u.map((x) => (
        <tr key={x.id}><td><b>{x.name}</b></td><td>{x.email}</td><td><span className="chip">{x.role}</span></td><td><Badge s={x.kyc} /></td><td><Badge s={x.active ? "Active" : "Inactive"} /></td>
          <td>{x.role !== "ADMIN" && <button className="btn ghost sm" onClick={async () => { await api.setActive(x.id); load(); }}>{x.active ? "Deactivate" : "Activate"}</button>}</td></tr>))} /></Card>
    </>
  );
}

function Rates() {
  const [r] = useLoad(api.rates), toast = useToast();
  if (!r) return <Loader />;
  return (
    <Card title="Interest rates (changes reflect for customers)"><Table head={["Product", "Rate % p.a."]} rows={r.map((x) => (
      <tr key={x.id}><td><b>{x.title}</b></td><td><input type="number" step="0.1" defaultValue={x.rate} style={{ width: 100 }} onBlur={async (e) => { const v = Number(e.target.value); if (v > 0 && v < 30) { await api.setRate(x.id, v); toast("Rate updated"); } else toast("Enter a rate between 0 and 30", true); }} /></td></tr>))} /></Card>
  );
}

function Reports() {
  const [t] = useLoad(() => api.allTxns());
  if (!t) return <Loader />;
  const M = lastMonths(6), by = (type) => M.map((m) => sum(t.filter((x) => x.type === type && x.date.startsWith(m.key))));
  return (
    <Card title="Monthly credits vs debits" action={<button className="btn ghost sm" onClick={() => downloadCsv("all-transactions.csv", ["Date", "Account", "Description", "Category", "Type", "Amount"], t.map((x) => [x.date, x.acc, x.desc, x.category, x.type, x.amount]))}><Download size={14} /> Export CSV</button>}>
      <Bars labels={M.map((m) => m.label)} series={[{ name: "Credits", color: "#0a1f44", data: by("CREDIT") }, { name: "Debits", color: "#38bdf8", data: by("DEBIT") }]} />
    </Card>
  );
}

function Audit() {
  const [a] = useLoad(api.audit);
  if (!a) return <Loader />;
  return <Card title="Audit log"><Table head={["Time", "Event"]} rows={a.map((x) => <tr key={x.id}><td>{x.date}</td><td>{x.text}</td></tr>)} empty="No events yet. Actions will appear here." /></Card>;
}

export default function Admin() {
  return <Layout base="/admin" nav={nav} render={(s) => ({ overview: <Overview />, users: <UserMgmt />, rates: <Rates />, reports: <Reports />, audit: <Audit />, profile: <Profile /> }[s])} />;
}
