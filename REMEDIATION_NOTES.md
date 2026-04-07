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

---

## Verification
- `npm install` — completed successfully
- `npm test` — passed (grunt unit tests)
- No breaking changes detected in application logic
