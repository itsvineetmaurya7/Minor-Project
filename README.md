# IAMT Digital Bank – Frontend (React + Vite)

Landing page, Login, Registration + 3 role dashboards (Customer, Employee, Admin).

## Run
```
npm install
npm run dev
```

## Demo logins (password 1234)
- Customer: customer@bank.com
- Employee: employee@bank.com
- Admin: admin@bank.com
- Transfer OTP (demo): 123456

## Backend ke liye (baad mein)
- `src/api/mock.js` : abhi saara data yahin hai. Har function ke upar REST endpoint comment hai.
- `src/api/http.js` : JWT Bearer token ke saath fetch helper ready hai.
- `src/api/index.js`: `export const api = mock;` ko real API se replace karna.
- Spring Boot: `@CrossOrigin("http://localhost:5173")` aur roles CUSTOMER / EMPLOYEE / ADMIN.

## Structure
- src/pages: Landing, Login, Register, Customer, Employee, Admin, Profile
- src/components: Layout (sidebar + topbar), ui (cards, tables, modal, toast), charts (SVG)
- src/context: AuthContext (session + token)
