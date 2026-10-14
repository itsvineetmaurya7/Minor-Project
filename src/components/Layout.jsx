// Shared dashboard frame: each role supplies its own navigation and section renderer.
// This connects route sections, authentication actions, notifications, and the mobile sidebar.
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Menu, Bell, LogOut, Landmark } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";


export default function Layout({ base, nav, render }) {
  const [dark, setDark] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    document.body.classList.toggle("dark-mode", dark);
    localStorage.setItem("darkMode", dark);
  }, [dark]);
  const { section = "" } = useParams();
  const { user, logout } = useAuth();
  const go = useNavigate();
  const [open, setOpen] = useState(false), [bell, setBell] = useState(false), [notes, setNotes] = useState([]);
  const sec = nav.some((n) => n[0] === section) ? section : nav[0][0];
  const cur = nav.find((n) => n[0] === sec);
  useEffect(() => { api.notifications(user.id).then(setNotes); setBell(false); }, [sec]);
  const unread = notes.filter((n) => !n.read).length;

  return (
    <div className="shell">
      {open && <div className="ov" onClick={() => setOpen(false)} />}
      <aside className={"sb" + (open ? " open" : "")}>
        <div className="brand"><Landmark size={22} /> IAMT <b>Bank</b></div>
        <small className="role">{user.role} PORTAL</small>
        <nav>
          {nav.map(([k, l, I]) => (
            <Link key={k} to={`${base}/${k}`} onClick={() => setOpen(false)} className={"nv" + (sec === k ? " on" : "")}><I size={18} />{l}</Link>
          ))}
        </nav>
        <button className="nv out" onClick={() => { logout(); go("/"); }}><LogOut size={18} />Logout</button>
      </aside>
      <div className="mainc">
        <header className="tb">
          <button className="ib mob" onClick={() => setOpen(true)}><Menu /></button>
          <h2>{cur[1]}</h2>
          <div className="tbr">
            <button
                 className="ib"
                 onClick={() => setDark((prev) => !prev)}
                 title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {dark ? "☀️" : "🌙"}
            </button>
            <div className="bellw">
              <button className="ib" onClick={() => setBell(!bell)}><Bell size={20} />{unread > 0 && <i className="dot">{unread}</i>}</button>
              {bell && (
                <div className="pop">
                  <b>Notifications</b>
                  {notes.length ? notes.slice(0, 5).map((n) => <p key={n.id} className={n.read ? "" : "unr"}>{n.text}<small>{n.date}</small></p>) : <p>No notifications</p>}
                </div>
              )}
            </div>
            <div className="av">{user.name[0]}</div><span className="un">{user.name}</span>
          </div>
        </header>
        <main key={sec} className="page">{render(sec)}</main>
      </div>
    </div>
  );
}
