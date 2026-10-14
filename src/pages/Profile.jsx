// Profile section shared by all role dashboards; profile and password changes use the API adapter.
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { Badge, Card, Field, useToast } from "../components/ui";

export default function Profile() {
  const { user, update } = useAuth(), toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || "", address: user.address || "" });
  const [p, setP] = useState({ old: "", nw: "" });
  const [prefs, setPrefs] = useState({ email: true, sms: true, twofa: false });
  const save = async () => {
    if (f.name.trim().length < 3) return toast("Enter a valid name", true);
    update(await api.updateProfile(user.id, f)); toast("Profile updated");
  };
  const pass = async () => {
    if (p.nw.length < 6) return toast("New password must be at least 6 characters", true);
    try { await api.changePassword(user.id, p.old, p.nw); setP({ old: "", nw: "" }); toast("Password changed"); } catch (e) { toast(String(e), true); }
  };
  return (
    <div className="g2">
      <Card title="Personal details" action={<Badge s={user.kyc === "Verified" ? "Verified" : "Pending"} />}>
        <Field label="Full name"><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Email"><input value={user.email} disabled /></Field>
        <Field label="Mobile"><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="Address"><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
        <button className="btn" onClick={save}>Save changes</button>
      </Card>
      <div>
        <Card title="Change password">
          <Field label="Current password"><input type="password" value={p.old} onChange={(e) => setP({ ...p, old: e.target.value })} /></Field>
          <Field label="New password"><input type="password" value={p.nw} onChange={(e) => setP({ ...p, nw: e.target.value })} /></Field>
          <button className="btn navy" onClick={pass}>Update password</button>
        </Card>
        <Card title="Settings">
          {[["email", "Email alerts"], ["sms", "SMS alerts"], ["twofa", "Two-factor authentication"]].map(([k, l]) => (
            <div className="sw" key={k}><span>{l}</span><input type="checkbox" checked={prefs[k]} onChange={() => setPrefs({ ...prefs, [k]: !prefs[k] })} /></div>
          ))}
        </Card>
      </div>
    </div>
  );
}
