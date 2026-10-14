// Employee portal for KYC, loan decisions, support tickets, and transaction review.
// Actions call the shared API adapter and reload affected data after updates.
import { useState } from "react";
import { LayoutDashboard, Users, HandCoins, LifeBuoy, Activity, UserCog, ShieldCheck, Clock, MessageSquare, Receipt } from "lucide-react";
import { api } from "../api";
import Layout from "../components/Layout";
import { Badge, Card, Loader, Stat, Table, useLoad, useToast, inr, short, sum, lastMonths } from "../components/ui";
import { LineChart } from "../components/charts";
import Profile from "./Profile";

const nav = [["overview", "Overview", LayoutDashboard], ["customers", "Customers & KYC", Users], ["loans", "Loan Review", HandCoins], ["tickets", "Support Tickets", LifeBuoy], ["monitor", "Transaction Monitor", Activity], ["profile", "Profile", UserCog]];

function Overview() {
  const [d] = useLoad(async () => ({ s: await api.stats(), t: await api.allTxns() }));
  if (!d) return <Loader />;
  const M = lastMonths(6);
  return (
    <>
      <div className="g4" style={{ marginBottom: 18 }}>
        <Stat icon={ShieldCheck} label="Pending KYC" value={d.s.pendingKyc} tone="amber" /><Stat icon={Clock} label="Pending loans" value={d.s.pendingLoans} tone="blue" />
        <Stat icon={MessageSquare} label="Open tickets" value={d.s.openTickets} tone="red" /><Stat icon={Receipt} label="Transactions" value={d.s.txnCount} tone="green" />
      </div>
      <Card title="Monthly transaction volume"><LineChart labels={M.map((m) => m.label)} data={M.map((m) => sum(d.t.filter((x) => x.date.startsWith(m.key))))} /></Card>
    </>
  );
}

function Customers() {
  const [u, load] = useLoad(api.users), [q, setQ] = useState(""), toast = useToast();
  if (!u) return <Loader />;
  const rows = u.filter((x) => x.role === "CUSTOMER" && x.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Card title="Customers & KYC">
      <div className="filters"><input placeholder="Search customer…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Table head={["Name", "Email", "Phone", "Balance", "KYC", "Action"]} rows={rows.map((x) => (
        <tr key={x.id}><td><b>{x.name}</b></td><td>{x.email}</td><td>{x.phone}</td><td>{inr(x.balance)}</td><td><Badge s={x.kyc} /></td>
          <td>{x.kyc === "Pending" && <button className="btn ok sm" onClick={async () => { await api.setKyc(x.id); load(); toast("KYC verified"); }}>Verify KYC</button>}</td></tr>))} />
    </Card>
  );
}

function LoanReview() {
  const [l, load] = useLoad(() => api.loans()), toast = useToast();
  if (!l) return <Loader />;
  const set = async (id, s) => { await api.setLoan(id, s); load(); toast("Loan " + s.toLowerCase()); };
  return (
    <Card title="Loan applications">
      <Table head={["Date", "Customer", "Type", "Amount", "Tenure", "Status", "Action"]} rows={l.map((x) => (
        <tr key={x.id}><td>{x.date}</td><td>{x.userName}</td><td>{x.type}</td><td>{inr(x.amount)}</td><td>{x.tenure} mo</td><td><Badge s={x.status} /></td>
          <td>{x.status === "Pending" && <><button className="btn ok sm" onClick={() => set(x.id, "Approved")}>Approve</button> <button className="btn no sm" onClick={() => set(x.id, "Rejected")}>Reject</button></>}</td></tr>))} />
    </Card>
  );
}

function Tickets({ me }) {
  const [t, load] = useLoad(() => api.tickets()), [r, setR] = useState({}), toast = useToast();
  if (!t) return <Loader />;
  const send = async (id, resolve) => { await api.replyTicket(id, me, r[id], resolve); setR({ ...r, [id]: "" }); load(); toast(resolve ? "Ticket resolved" : "Reply sent"); };
  return (
    <Card title="Customer support tickets">{t.map((x) => (
      <div className="tk" key={x.id}>
        <div className="row"><b>{x.subject}</b><span><Badge s={x.priority === "High" ? "Flagged" : "Normal"} /> <Badge s={x.status} /></span></div>
        <small className="mute" style={{ padding: 0, display: "block", textAlign: "left" }}>{x.userName} · {x.category} · {x.date}</small><p style={{ fontSize: 14, margin: "6px 0" }}>{x.message}</p>
        {x.replies.map((p, i) => <div className="rp" key={i}><b>{p.by}:</b> {p.text}</div>)}
        {x.status !== "Resolved" && <div className="filters" style={{ marginTop: 10 }}><input placeholder="Write a reply…" value={r[x.id] || ""} onChange={(e) => setR({ ...r, [x.id]: e.target.value })} />
          <button className="btn sm" style={{ flex: "none" }} onClick={() => r[x.id] ? send(x.id, false) : toast("Write a reply first", true)}>Reply</button><button className="btn ok sm" style={{ flex: "none" }} onClick={() => send(x.id, true)}>Resolve</button></div>}
      </div>))}</Card>
  );
}

function Monitor() {
  const [t] = useLoad(() => api.allTxns());
  if (!t) return <Loader />;
  return (
    <Card title="All transactions (amounts ≥ ₹50,000 are flagged for review)">
      <Table head={["Date", "Account", "Description", "Amount", "Risk"]} rows={t.slice(0, 40).map((x) => (
        <tr key={x.id}><td>{x.date}</td><td>{x.acc}</td><td>{x.desc}</td><td className={x.type === "CREDIT" ? "cr" : "dr"}><b>{x.type === "CREDIT" ? "+" : "−"}{inr(x.amount)}</b></td><td><Badge s={x.amount >= 50000 ? "Flagged" : "Normal"} /></td></tr>))} />
    </Card>
  );
}

export default function Employee() {
  const me = JSON.parse(sessionStorage.getItem("session") || "{}").user?.name || "Employee";
  return <Layout base="/employee" nav={nav} render={(s) => ({ overview: <Overview />, customers: <Customers />, loans: <LoanReview />, tickets: <Tickets me={me} />, monitor: <Monitor />, profile: <Profile /> }[s])} />;
}
