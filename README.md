# JP Anniversary — Discount Registration

This small app registers users for a discount code. It provides a frontend form and two backend endpoints: one to validate a discount code (`check_discount.php`) and another to register a user for a discount (`process.php`).

**Requirements**
- PHP (with PDO + pdo_mysql)
- MySQL (or MariaDB)
- XAMPP (recommended for Windows)
- Place the project in `c:\xampp\htdocs\jp_anniversarry`

**Quick Summary**
- Frontend: `index.html`, `script.js`, `styles.css`
- Backend: `backend/config.php`, `backend/check_discount.php`, `backend/process.php`

**Database**
- Database name: `jp_anniversarry` (configured in `backend/config.php`)
- Database port: `3310` (see `backend/config.php`)

**Suggested SQL to create tables**
Run these statements in phpMyAdmin or via the `mysql` CLI to create the minimal schema expected by the backend:


**How to import SQL (Windows, PowerShell)**

```powershell
# From project root (example)
mysql -u root -p -P 3310 < path\to\db.sql
# or use phpMyAdmin at http://localhost/phpmyadmin
```

**Backend configuration**
- `backend/config.php` contains DB connection values. By default in this project:
  - host: `localhost`
  - port: `3310`
  - db: `jp_anniversarry`
  - user: `root`
  - pass: `` (empty)

Modify those values if your MySQL instance uses different credentials or port.

**Endpoints**
- `GET backend/check_discount.php?discount=CODE`
  - Response (200): `{"exists": true, "message": "Discount code is valid."}`
  - Response (404): `{"exists": false, "message": "Discount code not found."}`
  - Response (400/405/500): JSON with `exists:false` and `message`

- `POST backend/process.php` (form submission)
  - Expected form fields: `discount`, `name`, `email`, `phone`
  - Successful response (200): `{"success": true, "message": "New record created successfully."}`
  - Duplicate registration (409): `{"success": false, "message": "The **Discount Code** is already registered with this **Email** or **Phone** number."}`
  - Validation errors (400), method errors (405), DB errors (500) return JSON messages with `success:false`.

**Frontend files**
- `index.html` — landing page and registration form.
- `script.js` — handles fetch/AJAX calls to the backend endpoints and client-side validation.
- `styles.css` — basic styles.
- `images/` — assets used by the site.

**Security & production notes**
- This app is minimal and intended for local/XAMPP testing only.
- Use HTTPS and proper host configuration in production.
- Add server-side rate limiting and CAPTCHA to reduce abuse.
- Sanitize and validate inputs more strictly as needed.
- Consider prepared statements (already used) and avoid exposing detailed DB errors in production.

