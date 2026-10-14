// Public login and registration forms; successful login state is managed by AuthContext.
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Landmark, ShieldCheck, Zap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Field } from "../components/ui";

const Aside = ({ title }) => (
  <div className="aside">
    <div className="brand"><Landmark size={26} /> IAMT <b>Bank</b></div>
    <h1>{title}</h1>
    <p>Secure, fast and simple digital banking for everyone.</p>
    <ul><li><ShieldCheck size={18} /> OTP-protected transfers</li><li><Zap size={18} /> Instant payments and bill pay</li></ul>
  </div>
);

export function Login() {
  // Login delegates credentials to AuthContext, which calls the configured API adapter.
  const { login } = useAuth(), go = useNavigate(), loc = useLocation();
  const [f, setF] = useState({ email: "", password: "" }), [err, setErr] = useState(""), [show, setShow] = useState(false), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (!/^\S+@\S+\.\S+$/.test(f.email) || !f.password) return setErr("Enter a valid email and password");
    setBusy(true);
    try { const u = await login(f.email, f.password); go("/" + u.role.toLowerCase()); } catch (x) { setErr(String(x)); setBusy(false); }
  };
  return (
    <div className="auth"><Aside title="Welcome back" />
      <div className="aform"><form onSubmit={submit}>
        <h2>Login</h2><p className="mute" style={{ textAlign: "left", padding: "0 0 18px" }}>Access your IAMT Bank account</p>
        {loc.state?.msg && <p className="ok" style={{ marginBottom: 10 }}>{loc.state.msg}</p>}
        <Field label="Email"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
        <Field label="Password"><div style={{ position: "relative" }}><input type={show ? "text" : "password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <button type="button" className="ib" style={{ position: "absolute", right: 6, top: 5 }} onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>
        {err && <p className="err">{err}</p>}
        <button className="btn" style={{ width: "100%" }} disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
        <div className="demo">{[["Customer", "customer@bank.com"], ["Employee", "employee@bank.com"], ["Admin", "admin@bank.com"]].map(([n, e]) => (
          <button type="button" key={n} className="btn ghost sm" onClick={() => setF({ email: e, password: "1234" })}>{n}</button>))}</div>
        <p className="mute" style={{ padding: 0 }}>Demo password: 1234 · New here? <Link to="/register" style={{ color: "#2563eb" }}>Open account</Link></p>
      </form></div>
    </div>
  );
}

export function Register() {
  // Registration calls the shared API adapter, then sends the user to login with a confirmation message.
  const go = useNavigate();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" }), [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    if (f.name.trim().length < 3) return setErr("Enter your full name");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Enter a valid email");
    if (!/^[6-9]\d{9}$/.test(f.phone)) return setErr("Enter a valid 10-digit mobile number");
    if (f.password.length < 6) return setErr("Password must be at least 6 characters");
    if (f.password !== f.confirm) return setErr("Passwords do not match");
    try { await api.register(f); go("/login", { state: { msg: "Account created! Please login." } }); } catch (x) { setErr(String(x)); }
  };
  return (
    <div className="auth"><Aside title="Open your account in minutes" />
      <div className="aform"><form onSubmit={submit}>
        <h2>Create account</h2><p className="mute" style={{ textAlign: "left", padding: "0 0 18px" }}>Free savings account, zero paperwork</p>
        <Field label="Full name"><input value={f.name} onChange={set("name")} /></Field>
        <Field label="Email"><input type="email" value={f.email} onChange={set("email")} /></Field>
        <Field label="Mobile number"><input value={f.phone} onChange={set("phone")} maxLength={10} /></Field>
        <Field label="Password"><input type="password" value={f.password} onChange={set("password")} /></Field>
        <Field label="Confirm password"><input type="password" value={f.confirm} onChange={set("confirm")} /></Field>
        {err && <p className="err">{err}</p>}
        <button className="btn" style={{ width: "100%" }}>Create account</button>
        <p className="mute" style={{ padding: "14px 0 0" }}>Already registered? <Link to="/login" style={{ color: "#2563eb" }}>Login</Link></p>
      </form></div>
    </div>
  );
}
