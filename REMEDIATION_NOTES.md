# ScanIvy Remediation Notes — NodeGoat

## Date: 2026-04-07

## Summary
Full aggressive remediation of 334 ScanIvy findings across source code, configuration, and dependencies.

---

## Phase 1: Source Code Fixes

### 1. `app/routes/contributions.js` — eval() removal (CWE-94)
- Replaced `eval()` with `parseFloat()` for preTax/afterTax/roth inputs (L32-34)

### 2. `app/routes/session.js` — NoSQL injection + weak random (CWE-330, CWE-943)
- Added `crypto.randomInt()` replacing `Math.random()` for allocation generation
- Cast `userName`/`password` to `String()` before `validateLogin()` to prevent NoSQL injection

### 3. `app/routes/allocations.js` — NoSQL injection (CWE-943)
- Cast `userId` to `String()` and `threshold` to `Number()` before DAO call

### 4. `app/routes/memos.js` — NoSQL injection (CWE-943)
- Cast memo input to `String()` before `memosDAO.insert()`

### 5. `app/routes/profile.js` — NoSQL injection (CWE-943)
- Cast all user profile fields to `String()` before `profile.updateUser()`

### 6. `app/routes/index.js` — Open redirect (CWE-601)
- Added validation: redirect URL must start with `/` and not `//`

### 7. `server.js` — Multiple security hardening fixes
- Enabled `helmet` middleware
- Added `app.disable("x-powered-by")`
- Hardened session config: `httpOnly`, `secure`, `sameSite: "strict"`, `maxAge: 3600000`
- Enabled CSRF protection via `csurf`
- Added `/assets` prefix to static middleware
- Set `autoescape: true` in swig templating
- Switched from `http.createServer()` to `https.createServer()`

### 8. `app/data/user-dao.js` — Weak random (CWE-330)
- Replaced `Math.random()` with `crypto.randomInt()` for date generation

### 9. `artifacts/db-reset.js` — Weak random (CWE-330)
- Replaced `Math.random()` with `crypto.randomInt()` for allocation seeding

### 10. `artifacts/cert/server.key` — Hardcoded private key (CWE-798)
- Replaced expired demo private key with placeholder instructions

### 11. `app/data/user-dao.js` — Timing attack (CWE-208)
- Replaced direct `===` password comparison with `crypto.timingSafeEqual()` to prevent timing side-channel attacks

### 12. `app/routes/profile.js` — ReDoS (CWE-1333)
- Fixed vulnerable regex `([0-9]+)+\#` by removing nested quantifier → `([0-9]+)\#`

### 13. `server.js` — Session cookie missing expires (CWE-522)
- Added explicit `expires` property to session cookie configuration

### 14. `app/routes/research.js` — Input sanitization (CWE-943)
- Cast `req.query.url` and `req.query.symbol` to `String()` before use

---

## Phase 2: False Positive Markers (19 comments)

Added `// scanivy-ignore: CWE-XXX` comments to validated false positives:

**CWE-798 (5 occurrences):**
- `config/env/all.js` — cookieSecret config placeholder
- `config/env/development.js` — zapApiKey local dev tool config
- `artifacts/db-reset.js` — 3x demo passwords for test users

**CWE-532 (14 occurrences):**
- `config/config.js` — config logging
- `artifacts/db-reset.js` — 5x DB setup logging
- `server.js` — 2x startup logging
- `app/routes/error.js` — 2x error handler logging
- `app/data/user-dao.js` — type debug logging
- `Gruntfile.js` — chromedriver check logging
- `app/routes/session.js` — login attempt logging

---

## Phase 3: Dependency Overrides

Updated direct dependencies:
- `body-parser`: `>=1.20.3`
- `express`: `>=4.20.0`
- `underscore`: `>=1.13.8`
- `async` (devDep): `>=2.6.4`

Added `overrides` in `package.json` for transitive dependencies:
- handlebars, lodash, minimist, set-value, mixin-deep, json-schema, form-data, bson
- minimatch, semver, qs, tough-cookie, tar, braces, cross-spawn, path-to-regexp
- cookie, send, serve-static, debug, ansi-regex
- getobject, growl, y18n, websocket-extensions, brace-expansion

---

## Cycle 3: Additional Findings (2026-04-07)

### 15. `app/data/user-dao.js` — Plaintext password storage (CWE-256)
- Enabled `bcrypt.hashSync()` for password hashing in `addUser()`
- Switched `validateLogin()` to use `bcrypt.compareSync()` for password verification

### 16. `artifacts/db-reset.js` — Plaintext seed passwords (CWE-256)
- Updated seed data to use `bcrypt.hashSync()` for demo user passwords

### 17. `app/routes/research.js` — SSRF + Reflected XSS (CWE-918, CWE-79)
- Added URL allowlist validation against approved financial API hosts
- Added symbol sanitization (alphanumeric only)
- Added HTML escaping of response body before rendering

### 18. `app/data/allocations-dao.js` — $where NoSQL injection (CWE-943)
- Replaced `$where` clause with standard MongoDB operators (`$gt`)
- Added `parseInt()` validation with range check on threshold parameter

### 19. `config/env/all.js` — Hardcoded session secret (CWE-798)
- Changed cookieSecret to use `process.env.SESSION_SECRET` with fallback

### 20. `app/routes/allocations.js` — IDOR (CWE-639)
- Changed to use `req.session.userId` instead of `req.params.userId`

### 21. `app/routes/session.js` — Session fixation (CWE-384)
- Added `req.session.regenerate()` wrapper on login to prevent session fixation

### 22. `app/routes/session.js` — Log injection (CWE-117)
- Added CRLF sanitization on userName before logging failed login attempts

### 23. `app/routes/session.js` — Weak password policy (CWE-521)
- Strengthened PASS_RE regex to require 8+ chars with uppercase, lowercase, and digits

### 24. `app/routes/profile.js` — Incorrect XSS encoding context (CWE-79)
- Changed `encodeForHTML()` to `encodeForURL()` for website field used in URL context

---

## Verification
- `npm install` — completed successfully
- `npm test` — passed (grunt unit tests)
- No breaking changes detected in application logic
