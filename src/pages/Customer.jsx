// Customer portal: its sections read and update customer records through the shared API adapter.
// Layout supplies the dashboard frame; shared UI and chart components keep sections consistent.
import { useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, Wallet, ArrowLeftRight, Users, Receipt, FileText, HandCoins, Zap, LifeBuoy, Bell, UserCog, Eye, EyeOff, Snowflake, Trash2, Download, Printer, Copy, Smartphone, Droplets, Flame, Tv, Wifi, Lightbulb, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { Badge, Card, Field, Loader, Modal, Table, TxnTable, useLoad, useToast, inr, short, sum, lastMonths, dayStr, downloadCsv } from "../components/ui";
import { Bars, Donut } from "../components/charts";
import Profile from "./Profile";

const nav = [
  ["overview", "Overview", LayoutDashboard], ["accounts", "Accounts", Wallet], ["transfer", "Fund Transfer", ArrowLeftRight],
  ["beneficiaries", "Beneficiaries", Users], ["transactions", "Transactions", Receipt], ["statements", "Statements", FileText],
  ["loans", "Loans", HandCoins], ["bills", "Bill Payments", Zap], ["support", "Support", LifeBuoy],
  ["notifications", "Notifications", Bell], ["profile", "Profile", UserCog],
];
const COLORS = ["#0a1f44", "#2563eb", "#38bdf8", "#818cf8", "#94a3b8", "#1e40af"];
const myTxns = async (uid) => api.txns((await api.accounts(uid)).map((x) => x.no));

function Overview({ user }) {
  const [d] = useLoad(async () => ({ a: await api.accounts(user.id), t: await myTxns(user.id) }));
  if (!d) return <Loader />;
  const { a, t } = d, total = a.reduce((s, x) => s + x.balance, 0), M = lastMonths(6);
  const by = (type) => M.map((m) => sum(t.filter((x) => x.type === type && x.date.startsWith(m.key))));
  const cats = {};
  t.filter((x) => x.type === "DEBIT").forEach((x) => (cats[x.category] = (cats[x.category] || 0) + x.amount));
  const spend = Object.entries(cats).map(([label, value], i) => ({ label, value, color: COLORS[i % 6] }));
  return (
    <>
      <div className="hero-card">
        <div><p>Total balance</p><h1>{inr(total)}</h1><span>{a.length} accounts · Welcome back, {user.name.split(" ")[0]}</span></div>
        <div className="qa">{[["transfer", "Send", ArrowLeftRight], ["bills", "Pay bills", Zap], ["loans", "Loans", HandCoins], ["statements", "Statement", FileText]].map(([k, l, I]) => <Link key={k} to={`/customer/${k}`}><I size={20} />{l}</Link>)}</div>
      </div>
      <div className="g2">
        <Card title="Income vs Expense (6 months)"><Bars labels={M.map((m) => m.label)} series={[{ name: "Income", color: "#2563eb", data: by("CREDIT") }, { name: "Expense", color: "#38bdf8", data: by("DEBIT") }]} /></Card>
        <Card title="Spending by category"><Donut data={spend} center={short(sum(t.filter((x) => x.type === "DEBIT")))} fmt={short} /></Card>
      </div>
      <Card title="Recent transactions"><TxnTable txns={t.slice(0, 6)} /></Card>
    </>
  );
}

function Accounts({ user }) {
  const [a, load] = useLoad(() => api.accounts(user.id)), [hide, setHide] = useState(false), toast = useToast();
  if (!a) return <Loader />;
  return (
    <>
      <div className="row" style={{ marginBottom: 16 }}><h3>Balance enquiry</h3>
        <button className="btn ghost" onClick={() => setHide(!hide)}>{hide ? <Eye size={16} /> : <EyeOff size={16} />} {hide ? "Show" : "Hide"} balance</button></div>
      <div className="g3">{a.map((x) => (
        <div key={x.no} className={"acc" + (x.frozen ? " frozen" : "")}>
          <div className="row"><b>{x.type} Account</b><Badge s={x.frozen ? "Frozen" : "Active"} /></div>
          <h2>{hide ? "₹ ••••••" : inr(x.balance)}</h2><p>A/c {x.no}</p><p>IFSC {x.ifsc} · Ghaziabad Branch</p>
          <div className="row">
            <button className="btn sm light" onClick={() => { navigator.clipboard?.writeText(x.no); toast("Account number copied"); }}><Copy size={14} /> Copy</button>
            <button className="btn sm light" onClick={async () => { await api.freeze(x.no); load(); toast(x.frozen ? "Account unfrozen" : "Account frozen"); }}><Snowflake size={14} /> {x.frozen ? "Unfreeze" : "Freeze"}</button>
          </div>
        </div>))}</div>
    </>
  );
}

function Transfer({ user }) {
  const [d, load] = useLoad(async () => ({ a: await api.accounts(user.id), b: await api.beneficiaries(user.id) }));
  const [f, setF] = useState({ from: "", to: "", mode: "IMPS", amount: "", remark: "" }), [otp, setOtp] = useState(null), [done, setDone] = useState(null), toast = useToast();
  if (!d) return <Loader />;
  const from = d.a.find((x) => x.no === f.from) || d.a[0], amt = Number(f.amount);
  const check = () => {
    if (!/^\d{10}$/.test(f.to)) return toast("Select a beneficiary or enter a 10-digit account number", true);
    if (f.to === from.no) return toast("Cannot transfer to the same account", true);
    if (!(amt > 0)) return toast("Enter a valid amount", true);
    if (from.frozen) return toast("This account is frozen", true);
    if (amt > from.balance) return toast("Insufficient balance", true);
    setOtp("");
  };
  const pay = async () => {
    if (otp !== "123456") return toast("Invalid OTP (demo OTP: 123456)", true);
    try { const r = await api.transfer({ from: from.no, to: f.to, mode: f.mode, amount: amt, remark: f.remark }); setOtp(null); setDone(r); setF({ ...f, to: "", amount: "", remark: "" }); load(); }
    catch (e) { toast(String(e), true); setOtp(null); }
  };
  return (
    <div className="g2">
      <Card title="Send money">
        <Field label="From account"><select value={from.no} onChange={(e) => setF({ ...f, from: e.target.value })}>{d.a.map((x) => <option key={x.no} value={x.no}>{x.type} · {x.no} ({inr(x.balance)})</option>)}</select></Field>
        <Field label="Saved beneficiary"><select value={d.b.some((b) => b.accNo === f.to) ? f.to : ""} onChange={(e) => setF({ ...f, to: e.target.value })}><option value="">Select beneficiary</option>{d.b.map((b) => <option key={b.id} value={b.accNo}>{b.name} · {b.accNo}</option>)}</select></Field>
        <Field label="Or account number"><input value={f.to} maxLength={10} onChange={(e) => setF({ ...f, to: e.target.value })} /></Field>
        <div className="g2" style={{ gap: 12 }}>
          <Field label="Mode"><select value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}><option>IMPS</option><option>NEFT</option><option>RTGS</option><option>UPI</option></select></Field>
          <Field label="Amount (₹)"><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        </div>
        <Field label="Remark (optional)"><input value={f.remark} onChange={(e) => setF({ ...f, remark: e.target.value })} /></Field>
        <button className="btn" onClick={check}>Continue</button>
      </Card>
      <Card title="Secure transfers"><p className="mute" style={{ textAlign: "left", padding: 0 }}>Every transfer is confirmed with a one-time password. Account balance is checked before the payment goes through. Frozen accounts cannot send money.</p></Card>
      {otp !== null && <Modal title="Verify with OTP" onClose={() => setOtp(null)}>
        <p className="mute" style={{ padding: "0 0 12px", textAlign: "left" }}>Sending {inr(amt)} to {f.to}. Enter OTP (demo: 123456)</p>
        <Field label="6-digit OTP"><input value={otp} maxLength={6} onChange={(e) => setOtp(e.target.value)} /></Field><button className="btn" style={{ width: "100%" }} onClick={pay}>Confirm payment</button></Modal>}
      {done && <Modal title="Payment receipt" onClose={() => setDone(null)}><div className="rcpt"><CheckCircle2 size={48} color="#16a34a" /><h2>{inr(done.amount)} sent</h2><p>To {done.to} via {done.mode}</p><p>Ref {done.ref} · {done.date}</p></div></Modal>}
    </div>
  );
}

function Beneficiaries({ user }) {
  const [b, load] = useLoad(() => api.beneficiaries(user.id)), [f, setF] = useState({ name: "", accNo: "", bank: "IAMT Bank", ifsc: "" }), toast = useToast();
  if (!b) return <Loader />;
  const add = async () => {
    if (!f.name.trim() || !/^\d{10}$/.test(f.accNo) || !f.ifsc.trim()) return toast("Enter name, 10-digit account number and IFSC", true);
    await api.addBeneficiary({ ...f, userId: user.id }); setF({ name: "", accNo: "", bank: "IAMT Bank", ifsc: "" }); load(); toast("Beneficiary added");
  };
  return (
    <div className="g2">
      <Card title="Add beneficiary">
        {[["name", "Name"], ["accNo", "Account number"], ["bank", "Bank"], ["ifsc", "IFSC code"]].map(([k, l]) => <Field key={k} label={l}><input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
        <button className="btn" onClick={add}>Add beneficiary</button>
      </Card>
      <Card title="Saved beneficiaries"><Table head={["Name", "Account", "Bank", ""]} rows={b.map((x) => (
        <tr key={x.id}><td>{x.name}</td><td>{x.accNo}</td><td>{x.bank}</td><td><button className="ib" onClick={async () => { await api.delBeneficiary(x.id); load(); toast("Removed"); }}><Trash2 size={16} color="#dc2626" /></button></td></tr>))} /></Card>
    </div>
  );
}

function Transactions({ user }) {
  const [t] = useLoad(() => myTxns(user.id)), [q, setQ] = useState(""), [ty, setTy] = useState(""), [c, setC] = useState("");
  if (!t) return <Loader />;
  const rows = t.filter((x) => (!q || x.desc.toLowerCase().includes(q.toLowerCase())) && (!ty || x.type === ty) && (!c || x.category === c));
  return (
    <Card title="Transaction history">
      <div className="filters">
        <input placeholder="Search description…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={ty} onChange={(e) => setTy(e.target.value)}><option value="">All types</option><option value="CREDIT">Credit</option><option value="DEBIT">Debit</option></select>
        <select value={c} onChange={(e) => setC(e.target.value)}><option value="">All categories</option>{[...new Set(t.map((x) => x.category))].map((x) => <option key={x}>{x}</option>)}</select>
      </div>
      <TxnTable txns={rows} />
    </Card>
  );
}

function Statements({ user }) {
  const [d] = useLoad(async () => ({ a: await api.accounts(user.id), t: await myTxns(user.id) }));
  const [acc, setAcc] = useState(""), [from, setFrom] = useState(dayStr(60)), [to, setTo] = useState(dayStr(0));
  if (!d) return <Loader />;
  const a = d.a.find((x) => x.no === acc) || d.a[0];
  const rows = d.t.filter((x) => x.acc === a.no && x.date >= from && x.date <= to);
  const cr = sum(rows.filter((x) => x.type === "CREDIT")), dr = sum(rows.filter((x) => x.type === "DEBIT"));
  return (
    <Card title="Account statement">
      <div className="filters noprint">
        <select value={a.no} onChange={(e) => setAcc(e.target.value)}>{d.a.map((x) => <option key={x.no} value={x.no}>{x.type} · {x.no}</option>)}</select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /><input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button className="btn ghost" onClick={() => downloadCsv(`statement-${a.no}.csv`, ["Date", "Description", "Category", "Type", "Amount"], rows.map((x) => [x.date, x.desc, x.category, x.type, x.amount]))}><Download size={16} /> CSV</button>
        <button className="btn" onClick={() => window.print()}><Printer size={16} /> Print</button>
      </div>
      <p className="mute" style={{ textAlign: "left", padding: "0 0 8px" }}>IAMT Bank · {user.name} · A/c {a.no} · {from} to {to}</p>
      <div className="sumbox"><div><small>Credits</small><b className="cr">{inr(cr)}</b></div><div><small>Debits</small><b className="dr">{inr(dr)}</b></div><div><small>Current balance</small><b>{inr(a.balance)}</b></div></div>
      <TxnTable txns={rows} />
    </Card>
  );
}

const RATES = { "Home Loan": 8.5, "Education Loan": 9.2, "Personal Loan": 11.5, "Car Loan": 9.0 };
function Loans({ user }) {
  const [l, load] = useLoad(() => api.loans(user.id)), [f, setF] = useState({ type: "Home Loan", amount: "", tenure: "60", purpose: "" }), toast = useToast();
  if (!l) return <Loader />;
  const P = Number(f.amount), n = Number(f.tenure), r = RATES[f.type] / 1200;
  const emi = P > 0 && n > 0 ? (P * r * (1 + r) ** n) / ((1 + r) ** n - 1) : 0;
  const apply = async () => {
    if (!(P >= 10000)) return toast("Minimum loan amount is ₹10,000", true);
    if (!(n >= 6 && n <= 360)) return toast("Tenure must be 6 to 360 months", true);
    await api.applyLoan({ userId: user.id, type: f.type, amount: P, tenure: n, purpose: f.purpose }); setF({ ...f, amount: "", purpose: "" }); load(); toast("Application submitted");
  };
  return (
    <div className="g2">
      <Card title="Apply for a loan">
        <Field label="Loan type"><select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{Object.keys(RATES).map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Amount (₹)"><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Tenure (months)"><input type="number" value={f.tenure} onChange={(e) => setF({ ...f, tenure: e.target.value })} /></Field>
        <Field label="Purpose"><input value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} /></Field>
        <div className="sumbox"><div><small>EMI @ {RATES[f.type]}%</small><b>{inr(emi)}</b></div><div><small>Interest</small><b>{inr(emi * n - P || 0)}</b></div><div><small>Total payable</small><b>{inr(emi * n)}</b></div></div>
        <button className="btn" onClick={apply}>Submit application</button>
      </Card>
      <Card title="My applications"><Table head={["Date", "Type", "Amount", "Status"]} rows={l.map((x) => <tr key={x.id}><td>{x.date}</td><td>{x.type}</td><td>{inr(x.amount)}</td><td><Badge s={x.status} /></td></tr>)} /></Card>
    </div>
  );
}

const BILLERS = [["Electricity", Lightbulb], ["Water", Droplets], ["Mobile", Smartphone], ["Gas", Flame], ["DTH", Tv], ["Broadband", Wifi]];
function Bills({ user }) {
  const [d, load] = useLoad(async () => { const a = await api.accounts(user.id); return { a, t: (await api.txns(a.map((x) => x.no))).filter((x) => x.category === "Bills") }; });
  const [f, setF] = useState({ biller: "Electricity", consumer: "", amount: "", from: "" }), toast = useToast();
  if (!d) return <Loader />;
  const pay = async () => {
    if (f.consumer.trim().length < 6) return toast("Enter a valid consumer / mobile number", true);
    if (!(Number(f.amount) > 0)) return toast("Enter a valid amount", true);
    try { await api.payBill({ from: f.from || d.a[0].no, biller: f.biller, consumer: f.consumer, amount: Number(f.amount) }); setF({ ...f, consumer: "", amount: "" }); load(); toast("Bill paid successfully"); } catch (e) { toast(String(e), true); }
  };
  return (
    <>
      <Card title="Pay a bill (simulation)">
        <div className="tiles">{BILLERS.map(([n, I]) => <button key={n} className={"tile" + (f.biller === n ? " on" : "")} onClick={() => setF({ ...f, biller: n })}><I size={24} />{n}</button>)}</div>
        <div className="g3">
          <Field label="Consumer / mobile no."><input value={f.consumer} onChange={(e) => setF({ ...f, consumer: e.target.value })} /></Field>
          <Field label="Amount (₹)"><input type="number" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
          <Field label="Pay from"><select value={f.from || d.a[0].no} onChange={(e) => setF({ ...f, from: e.target.value })}>{d.a.map((x) => <option key={x.no} value={x.no}>{x.type} · {x.no}</option>)}</select></Field>
        </div>
        <button className="btn" onClick={pay}>Pay {f.biller} bill</button>
      </Card>
      <Card title="Recent bill payments"><TxnTable txns={d.t.slice(0, 6)} /></Card>
    </>
  );
}

function Support({ user }) {
  const [t, load] = useLoad(() => api.tickets(user.id)), [f, setF] = useState({ subject: "", category: "Accounts", priority: "Medium", message: "" }), toast = useToast();
  if (!t) return <Loader />;
  const send = async () => {
    if (!f.subject.trim() || !f.message.trim()) return toast("Fill subject and message", true);
    await api.raiseTicket({ ...f, userId: user.id }); setF({ ...f, subject: "", message: "" }); load(); toast("Ticket raised");
  };
  return (
    <div className="g2">
      <Card title="Raise a support ticket">
        <Field label="Subject"><input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></Field>
        <div className="g2" style={{ gap: 12 }}>
          <Field label="Category"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{["Accounts", "Cards", "Loans", "Transfers", "Profile"].map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Priority"><select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })}><option>Low</option><option>Medium</option><option>High</option></select></Field>
        </div>
        <Field label="Message"><textarea rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></Field>
        <button className="btn" onClick={send}>Submit ticket</button>
      </Card>
      <Card title="My tickets">{t.length ? t.map((x) => (
        <div className="tk" key={x.id}><div className="row"><b>{x.subject}</b><Badge s={x.status} /></div><small className="mute" style={{ padding: 0, display: "block", textAlign: "left" }}>{x.category} · {x.priority} · {x.date}</small><p style={{ fontSize: 14, marginTop: 6 }}>{x.message}</p>
          {x.replies.map((r, i) => <div className="rp" key={i}><b>{r.by}:</b> {r.text}</div>)}</div>)) : <p className="mute">No tickets yet</p>}</Card>
    </div>
  );
}

function Notifications({ user }) {
  const [n, load] = useLoad(() => api.notifications(user.id));
  if (!n) return <Loader />;
  return (
    <Card title="Notifications" action={<button className="btn ghost sm" onClick={async () => { await api.markRead(user.id); load(); }}>Mark all read</button>}>
      {n.length ? n.map((x) => <div key={x.id} className={"nt" + (x.read ? "" : " unr")}><Bell size={18} /><div>{x.text}<small className="mute" style={{ display: "block", padding: 0, textAlign: "left" }}>{x.date}</small></div></div>) : <p className="mute">You are all caught up</p>}
    </Card>
  );
}

export default function Customer() {
  const { user } = useAuth();
  return <Layout base="/customer" nav={nav} render={(s) => ({
    overview: <Overview user={user} />, accounts: <Accounts user={user} />, transfer: <Transfer user={user} />, beneficiaries: <Beneficiaries user={user} />,
    transactions: <Transactions user={user} />, statements: <Statements user={user} />, loans: <Loans user={user} />, bills: <Bills user={user} />,
    support: <Support user={user} />, notifications: <Notifications user={user} />, profile: <Profile />,
  }[s])} />;
}
