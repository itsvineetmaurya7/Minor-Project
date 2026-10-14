// Public home page; its links navigate to the authentication routes registered in App.jsx.
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Landmark, ShieldCheck, Zap, PiggyBank, HandCoins, Smartphone, TrendingUp, Headphones, Users, FileText, Lock, CheckCircle2, ArrowRight } from "lucide-react";

const features = [
  [PiggyBank, "Smart Accounts", "Savings and current accounts with instant balance enquiry."],
  [Zap, "Instant Transfers", "IMPS, NEFT and UPI-style transfers with OTP protection."],
  [Users, "Beneficiaries", "Save payees once and pay them in seconds."],
  [HandCoins, "Easy Loans", "Apply online, use the EMI calculator, track approval."],
  [FileText, "Statements", "Filter by date and download CSV or print."],
  [Smartphone, "Bill Payments", "Electricity, mobile, DTH, gas and more in one place."],
  [Headphones, "24x7 Support", "Raise tickets and get replies from our team."],
  [TrendingUp, "Spending Insights", "Charts that show where your money goes."],
];
const rates = [["Savings Account", "3.5%"], ["Fixed Deposit", "7.1%"], ["Home Loan", "8.5%"], ["Education Loan", "9.2%"]];

function useReveal() {
  // Reveal landing sections when they enter the viewport; .rv and .in are styled in index.css.
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.15 });
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function Landing() {
  useReveal();
  return (
    <div>
      <header className="ln"><div className="in">
        <div className="brand"><Landmark size={24} /> IAMT <b>Bank</b></div>
        <nav className="lk"><a href="#features">Features</a><a href="#how">How it works</a><a href="#rates">Rates</a><a href="#security">Security</a></nav>
        <div style={{ display: "flex", gap: 10 }}><Link to="/login" className="btn ghost sm">Login</Link><Link to="/register" className="btn sm">Open account</Link></div>
      </div></header>

      <section className="lh"><div className="sec">
        <div>
          <h1>Banking built for the way you <span>live</span>.</h1>
          <p>Manage accounts, send money, pay bills and apply for loans, securely, from any device, any time.</p>
          <div className="cta"><Link to="/register" className="btn white lg">Open free account <ArrowRight size={18} /></Link><Link to="/login" className="btn light lg">Login</Link></div>
          <div className="lstats"><div><h3>24x7</h3><small>Access</small></div><div><h3>256-bit</h3><small>Encryption</small></div><div><h3>0 ₹</h3><small>Minimum balance</small></div></div>
        </div>
        <div className="vis">
          <div className="fc a"><small>Total balance</small><h2>₹2,00,250.75</h2><small>Savings · 1000200030</small></div>
          <div className="fc b"><small>Transfer successful</small><h2 className="cr">₹5,000</h2><small>to Sandeep Kumar</small></div>
          <div className="fc c"><small>Loan status</small><h3>Approved</h3><small>Education loan</small></div>
        </div>
      </div></section>

      <section className="sec" id="features">
        <h2 className="t rv">Everything you need, in one app</h2><p className="st rv">Complete digital banking for customers, employees and administrators.</p>
        <div className="fg">{features.map(([I, t, d], i) => (
          <div className="fcard rv" key={t} style={{ transitionDelay: i * 60 + "ms" }}><div className="si blue"><I size={22} /></div><h3>{t}</h3><p>{d}</p></div>
        ))}</div>
      </section>

      <section className="alt" id="how"><div className="sec">
        <h2 className="t rv">Get started in 3 steps</h2><p className="st rv">No branch visit, no paperwork.</p>
        <div className="steps rv">{[["Register", "Create your account in a minute."], ["Verify KYC", "Our team verifies your details."], ["Bank anywhere", "Transfer, pay and borrow online."]].map(([t, d], i) => (
          <div key={t}><b>{i + 1}</b><h3>{t}</h3><p className="mute">{d}</p></div>
        ))}</div>
      </div></section>

      <section className="sec" id="rates">
        <h2 className="t rv">Our interest rates</h2><p className="st rv">Transparent rates, updated by the bank in real time.</p>
        <div className="g4 rv">{rates.map(([n, r]) => <div className="card stat" key={n}><div className="si green"><TrendingUp size={22} /></div><div><small>{n}</small><h2>{r} p.a.</h2></div></div>)}</div>
      </section>

      <section className="alt" id="security"><div className="sec" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 30, alignItems: "center" }}>
        <div className="rv"><h2 className="t" style={{ textAlign: "left" }}>Security first</h2>
          {["OTP-verified fund transfers", "Role-based access for customers, employees and admins", "JWT-based sessions (backend integration ready)", "Freeze your account instantly"].map((t) => <p key={t} style={{ display: "flex", gap: 10, margin: "12px 0" }}><CheckCircle2 color="#16a34a" size={20} />{t}</p>)}</div>
        <div className="card rv" style={{ textAlign: "center", padding: 40 }}><ShieldCheck size={56} color="#2563eb" /><h3 style={{ margin: "12px 0 6px" }}>Bank-grade protection</h3><p className="mute">Your money and data stay safe.</p><Lock size={20} color="#64748b" /></div>
      </div></section>

      <section className="sec"><div className="band rv"><h2>Ready to switch to smarter banking?</h2><p>Open your account today.</p><Link to="/register" className="btn white lg">Get started</Link></div></section>
      <footer className="ft">© 2026 IAMT Bank · BCA-507 Minor Project · Demo application, no real money involved</footer>
    </div>
  );
}
