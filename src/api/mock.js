/* In-memory backend used through src/api/index.js. Endpoint comments map methods to planned REST routes. */
const wait = (v, ms = 280) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms));
const fail = (m) => new Promise((_, r) => setTimeout(() => r(m), 280));
const uid = () => Date.now() + Math.floor(Math.random() * 999);
const day = (d = 0) => { const x = new Date(); x.setDate(x.getDate() - d); return x.toISOString().slice(0, 10); };
const IFSC = "IAMT0000113";
const mk = (id, name, email, phone, address, role, kyc = "Verified") => ({ id, name, email, phone, address, password: "1234", role, kyc, active: true });

// Shared collections below model the records returned by the mock API methods.
const db = {
  users: [
    mk(1, "Rahul Verma", "customer@bank.com", "9876543210", "Indirapuram, Ghaziabad", "CUSTOMER"),
    mk(2, "Priya Singh", "priya@bank.com", "9811122233", "Sector 62, Noida", "CUSTOMER", "Pending"),
    mk(3, "Sandeep Kumar", "sandeep@bank.com", "9899900011", "Shastri Nagar, Meerut", "CUSTOMER"),
    mk(50, "Amit Sharma", "employee@bank.com", "9000000050", "Ghaziabad Branch", "EMPLOYEE"),
    mk(99, "Bank Admin", "admin@bank.com", "9000000099", "Head Office", "ADMIN"),
  ],
  accounts: [
    { no: "1000200030", userId: 1, type: "Savings", balance: 148250.75, ifsc: IFSC, frozen: false },
    { no: "1000200031", userId: 1, type: "Current", balance: 52000, ifsc: IFSC, frozen: false },
    { no: "2000300040", userId: 2, type: "Savings", balance: 12400, ifsc: IFSC, frozen: false },
    { no: "3000400050", userId: 3, type: "Savings", balance: 86300, ifsc: IFSC, frozen: false },
  ],
  txns: [],
  beneficiaries: [
    { id: 1, userId: 1, name: "Sandeep Kumar", accNo: "3000400050", bank: "IAMT Bank", ifsc: IFSC },
    { id: 2, userId: 1, name: "Priya Singh", accNo: "2000300040", bank: "IAMT Bank", ifsc: IFSC },
  ],
  loans: [
    { id: 1, userId: 1, type: "Education Loan", amount: 300000, tenure: 48, purpose: "MBA fees", status: "Approved", date: day(40) },
    { id: 2, userId: 2, type: "Personal Loan", amount: 150000, tenure: 36, purpose: "Wedding", status: "Pending", date: day(3) },
    { id: 3, userId: 3, type: "Home Loan", amount: 2500000, tenure: 180, purpose: "Flat purchase", status: "Pending", date: day(1) },
  ],
  tickets: [
    { id: 1, userId: 2, subject: "Debit card not working", category: "Cards", priority: "High", message: "Card declined at ATM since yesterday.", status: "Open", date: day(2), replies: [] },
    { id: 2, userId: 1, subject: "Update mobile number", category: "Profile", priority: "Low", message: "Please update my registered mobile number.", status: "Resolved", date: day(12), replies: [{ by: "Amit Sharma", text: "Your number has been updated.", date: day(11) }] },
  ],
  notes: [
    { id: 1, userId: 1, text: "₹65,000 credited to your account (Salary).", date: day(9), read: false },
    { id: 2, userId: 1, text: "Your education loan application was approved.", date: day(38), read: true },
    { id: 3, userId: 1, text: "Reminder: electricity bill due in 3 days.", date: day(3), read: false },
  ],
  rates: [
    { id: 1, title: "Savings Account", rate: 3.5 }, { id: 2, title: "Fixed Deposit (1–5 yrs)", rate: 7.1 },
    { id: 3, title: "Home Loan", rate: 8.5 }, { id: 4, title: "Education Loan", rate: 9.2 },
    { id: 5, title: "Personal Loan", rate: 11.5 }, { id: 6, title: "Car Loan", rate: 9.0 },
  ],
  audit: [],
};

const seed = (acc, list) => list.forEach(([d, type, amount, desc, category], i) =>
  db.txns.push({ id: i + 1 + db.txns.length, acc, type, amount, desc, category, date: day(d), status: "Success" }));
const SAL = "Salary – IAMT Pvt Ltd", RENT = "House rent";
seed("1000200030", [
  [2, "DEBIT", 1499, "Electricity bill – UPPCL", "Bills"], [4, "DEBIT", 2350, "Swiggy order", "Food"], [6, "DEBIT", 12000, RENT, "Rent"],
  [9, "CREDIT", 65000, SAL, "Salary"], [14, "DEBIT", 3200, "Amazon purchase", "Shopping"], [16, "DEBIT", 52000, "Transfer to Sandeep Kumar", "Transfer"],
  [19, "DEBIT", 899, "Mobile recharge", "Bills"], [24, "DEBIT", 5400, "IRCTC train tickets", "Travel"], [32, "CREDIT", 65000, SAL, "Salary"],
  [35, "DEBIT", 12000, RENT, "Rent"], [41, "DEBIT", 2100, "Pharmacy", "Health"], [47, "DEBIT", 4300, "Myntra purchase", "Shopping"],
  [55, "CREDIT", 65000, SAL, "Salary"], [58, "DEBIT", 12000, RENT, "Rent"], [63, "DEBIT", 1800, "Zomato order", "Food"],
  [70, "DEBIT", 6200, "Flight – Delhi to Pune", "Travel"], [85, "CREDIT", 65000, SAL, "Salary"], [88, "DEBIT", 12000, RENT, "Rent"],
  [93, "DEBIT", 2750, "BigBasket grocery", "Food"], [110, "CREDIT", 65000, SAL, "Salary"], [113, "DEBIT", 12000, RENT, "Rent"],
  [120, "DEBIT", 8800, "Laptop accessories", "Shopping"], [140, "CREDIT", 65000, SAL, "Salary"], [150, "DEBIT", 3900, "Doctor consultation", "Health"],
]);
seed("1000200031", [[12, "CREDIT", 40000, "Business receipt", "Income"], [20, "DEBIT", 15000, "Vendor payment", "Shopping"]]);
seed("2000300040", [[5, "CREDIT", 30000, "Salary", "Salary"], [8, "DEBIT", 4000, "Shopping mall", "Shopping"]]);
seed("3000400050", [[3, "CREDIT", 52000, "Received from Rahul Verma", "Transfer"], [18, "DEBIT", 9000, "EMI payment", "Bills"]]);

const nameOf = (id) => db.users.find((u) => u.id === id)?.name || "Unknown";
const log = (t) => db.audit.unshift({ id: uid(), text: t, date: new Date().toLocaleString("en-IN") });
const notify = (userId, text) => db.notes.unshift({ id: uid(), userId, text, date: day(0), read: false });
const strip = ({ password, ...u }) => u;
const sorted = (l) => l.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
const debit = (a, amount, desc, category) => {
  a.balance -= amount;
  db.txns.push({ id: uid(), acc: a.no, type: "DEBIT", amount, desc, category, date: day(0), status: "Success" });
};

export const mock = {
  // POST /auth/login  ->  { token (JWT), user }
  login: (email, password) => {
    const u = db.users.find((x) => x.email === email && x.password === password);
    if (!u) return fail("Invalid email or password");
    if (!u.active) return fail("Your account has been deactivated");
    log(`${u.name} (${u.role}) logged in`);
    return wait({ token: "mock-jwt-" + u.id, user: strip(u) });
  },
  // POST /auth/register
  register: (f) => {
    if (db.users.some((u) => u.email === f.email)) return fail("Email already registered");
    const u = { ...mk(uid(), f.name, f.email, f.phone, "", "CUSTOMER", "Pending"), password: f.password };
    db.users.push(u);
    db.accounts.push({ no: "4" + String(Math.floor(1e8 + Math.random() * 9e8)), userId: u.id, type: "Savings", balance: 0, ifsc: IFSC, frozen: false });
    notify(u.id, "Welcome to IAMT Bank! Complete your KYC to unlock all features.");
    log(`New customer registered: ${u.name}`);
    return wait(true);
  },
  // PUT /users/{id}
  updateProfile: (id, p) => { const u = db.users.find((x) => x.id === id); Object.assign(u, p); return wait(strip(u)); },
  // PUT /users/{id}/password
  changePassword: (id, oldP, newP) => {
    const u = db.users.find((x) => x.id === id);
    if (u.password !== oldP) return fail("Current password is incorrect");
    u.password = newP; log(`${u.name} changed password`); return wait(true);
  },
  // GET /accounts?userId=
  accounts: (u) => wait(db.accounts.filter((a) => a.userId === u)),
  // PUT /accounts/{no}/freeze
  freeze: (no) => { const a = db.accounts.find((x) => x.no === no); a.frozen = !a.frozen; log(`Account ${no} ${a.frozen ? "frozen" : "unfrozen"}`); return wait(true); },
  // GET /transactions?accounts=
  txns: (nos) => wait(sorted(db.txns.filter((t) => nos.includes(t.acc)))),
  // GET /transactions (employee/admin)
  allTxns: () => wait(sorted([...db.txns])),
  // POST /transactions/transfer
  transfer: ({ from, to, mode, amount, remark }) => {
    const a = db.accounts.find((x) => x.no === from);
    if (a.frozen) return fail("Account is frozen");
    if (amount > a.balance) return fail("Insufficient balance");
    const rcv = db.accounts.find((x) => x.no === to);
    debit(a, amount, remark || `${mode} transfer to ${to}`, "Transfer");
    if (rcv) {
      rcv.balance += amount;
      db.txns.push({ id: uid(), acc: to, type: "CREDIT", amount, desc: "Received from " + nameOf(a.userId), category: "Transfer", date: day(0), status: "Success" });
      notify(rcv.userId, `₹${amount.toLocaleString("en-IN")} received from ${nameOf(a.userId)}.`);
    }
    notify(a.userId, `₹${amount.toLocaleString("en-IN")} sent to ${to} via ${mode}.`);
    log(`Transfer ₹${amount} from ${from} to ${to}`);
    return wait({ ref: "TXN" + uid(), amount, to, mode, date: day(0) });
  },
  // POST /bills/pay
  payBill: ({ from, biller, consumer, amount }) => {
    const a = db.accounts.find((x) => x.no === from);
    if (a.frozen) return fail("Account is frozen");
    if (amount > a.balance) return fail("Insufficient balance");
    debit(a, amount, `${biller} bill – ${consumer}`, "Bills");
    notify(a.userId, `${biller} bill of ₹${amount.toLocaleString("en-IN")} paid.`);
    return wait(true);
  },
  // GET/POST/DELETE /beneficiaries
  beneficiaries: (u) => wait(db.beneficiaries.filter((b) => b.userId === u)),
  addBeneficiary: (b) => { db.beneficiaries.push({ id: uid(), ...b }); return wait(true); },
  delBeneficiary: (id) => { db.beneficiaries = db.beneficiaries.filter((b) => b.id !== id); return wait(true); },
  // GET /loans?userId=   POST /loans   PUT /loans/{id}/status
  loans: (u) => wait(db.loans.filter((l) => !u || l.userId === u).map((l) => ({ ...l, userName: nameOf(l.userId) }))),
  applyLoan: (l) => { db.loans.push({ id: uid(), ...l, status: "Pending", date: day(0) }); log(`Loan application: ${l.type} ₹${l.amount}`); return wait(true); },
  setLoan: (id, status) => {
    const l = db.loans.find((x) => x.id === id); l.status = status;
    notify(l.userId, `Your ${l.type} application was ${status.toLowerCase()}.`); log(`${l.type} #${id} ${status}`); return wait(true);
  },
  // GET/POST /tickets   PUT /tickets/{id}/reply
  tickets: (u) => wait(db.tickets.filter((t) => !u || t.userId === u).map((t) => ({ ...t, userName: nameOf(t.userId) }))),
  raiseTicket: (t) => { db.tickets.unshift({ id: uid(), ...t, status: "Open", date: day(0), replies: [] }); return wait(true); },
  replyTicket: (id, by, text, resolve) => {
    const t = db.tickets.find((x) => x.id === id);
    if (text) t.replies.push({ by, text, date: day(0) });
    if (resolve) { t.status = "Resolved"; notify(t.userId, `Your ticket "${t.subject}" was resolved.`); } else t.status = "In Progress";
    return wait(true);
  },
  // GET /notifications   PUT /notifications/read
  notifications: (u) => wait(db.notes.filter((n) => n.userId === u)),
  markRead: (u) => { db.notes.filter((n) => n.userId === u).forEach((n) => (n.read = true)); return wait(true); },
  // GET /users   PUT /users/{id}/kyc   PUT /users/{id}/active   POST /users (employee)
  users: () => wait(db.users.map((u) => ({ ...strip(u), balance: db.accounts.filter((a) => a.userId === u.id).reduce((s, a) => s + a.balance, 0) }))),
  setKyc: (id) => { const u = db.users.find((x) => x.id === id); u.kyc = "Verified"; notify(id, "Your KYC has been verified."); log(`KYC verified: ${u.name}`); return wait(true); },
  setActive: (id) => { const u = db.users.find((x) => x.id === id); u.active = !u.active; log(`${u.name} ${u.active ? "activated" : "deactivated"}`); return wait(true); },
  addEmployee: (f) => {
    if (db.users.some((u) => u.email === f.email)) return fail("Email already exists");
    db.users.push({ ...mk(uid(), f.name, f.email, "", "Branch", "EMPLOYEE"), password: f.password }); log(`Employee added: ${f.name}`); return wait(true);
  },
  // GET /rates   PUT /rates/{id}
  rates: () => wait(db.rates),
  setRate: (id, rate) => { db.rates.find((r) => r.id === id).rate = rate; log(`Rate updated (#${id}) to ${rate}%`); return wait(true); },
  // GET /audit
  audit: () => wait(db.audit.slice(0, 40)),
  // GET /stats
  stats: () => wait({
    customers: db.users.filter((u) => u.role === "CUSTOMER").length,
    pendingKyc: db.users.filter((u) => u.kyc === "Pending").length,
    pendingLoans: db.loans.filter((l) => l.status === "Pending").length,
    openTickets: db.tickets.filter((t) => t.status !== "Resolved").length,
    deposits: db.accounts.reduce((s, a) => s + a.balance, 0),
    disbursed: db.loans.filter((l) => l.status === "Approved").reduce((s, l) => s + l.amount, 0),
    txnCount: db.txns.length,
  }),
};
