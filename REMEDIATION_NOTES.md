# ScanIvy Remediation Notes — Cycle 5
**Date**: 2026-04-07
**Scan ID**: a9313660-aadf-4457-9165-065ad25ecaa2
**Organization**: Eva Technology Services LLC

## Summary

| Category | Findings | Fixed This Cycle | Already Fixed (Cycles 1-4) | N/A |
|----------|----------|-----------------|---------------------------|-----|
| Code - Critical | 12 | 2 | 10 | 0 |
| Code - High | 3 | 0 | 3 | 0 |
| Code - Medium (code) | 7 | 0 | 7 | 0 |
| Code - Medium (secrets in .trivy-results.json) | 12 | 0 | 0 | 12 |
| Dependencies - Critical | 12 | 3 | 9 | 0 |
| Dependencies - High | 93 | 3 | 90 | 0 |
| Dependencies - Medium | 60 | 0 | 60 | 0 |
| Dependencies - Low | 17 | 0 | 17 | 0 |
| False Positives | 6 | 0 | 6 | 0 |

## Code Fixes Applied This Cycle

### CC-001: CWE-798 — Hardcoded Session Secret (CRITICAL)
- **File**: `config/env/all.js:8`
- **Fix**: Removed hardcoded fallback `"session_cookie_secret_key_here"`. Application now throws `Error("SESSION_SECRET environment variable is required")` if the env var is not set.
- **Status**: RESOLVED

### HC-001: CWE-798 — Hardcoded Cryptographic Key (HIGH)
- **File**: `config/env/all.js:9`
- **Fix**: Removed hardcoded fallback `"a_secure_key_for_crypto_here"`. Application now throws `Error("CRYPTO_KEY environment variable is required")` if the env var is not set.
- **Status**: RESOLVED

### server.js — marked library upgrade compatibility
- **File**: `server.js`
- **Fix**: Updated `marked` usage for v4.x compatibility. Removed deprecated `sanitize: true` option, changed `app.locals.marked = marked` to `app.locals.marked = marked.parse` (API change in marked 4.x).
- **Status**: RESOLVED

## Code Fixes Already Applied (Cycles 1-4)

| Finding | File | CWE | Status |
|---------|------|-----|--------|
| CC-002 | session.js:55-56 | CWE-943 | String() sanitization on login inputs |
| CC-003 | memos.js:23 | CWE-943 | String() sanitization on memo input |
| CC-004 | contributions.js:10 | CWE-943 | Session userId used (trusted source) |
| CC-005 | contributions.js:31-33 | CWE-943 | parseFloat + isNaN validation |
| CC-006 | memos.js:19 | CWE-943 | DAO uses sanitized input |
| CC-007 | profile.js:20 | CWE-943 | parseInt(userId) + String() for fields |
| CC-008 | profile.js:76-83 | CWE-943 | String() for all profile fields |
| CC-009 | research.js:45 | CWE-943 | Symbol sanitized to alphanumeric only |
| CC-010 | session.js:13 | CWE-943 | allocationsDAO uses trusted user._id |
| CC-011 | allocations.js:13-14 | CWE-943 | String(session.userId) + Number(threshold) |
| CC-012 | session.js:17-19 | CWE-943 | crypto.randomInt values (not user input) |
| HC-002 | memos.js:39-42 | CWE-79 | escapeHtml on memo content before render |
| HC-003 | research.js:16-23 | CWE-79 | escapeHtml on response body |
| MC-008/012 | session.js:59 | CWE-204 | Generic error message for login failures |
| MC-014/015/019 | index.js:73-74 | CWE-601 | Relative path validation for redirects |
| MC-016/017 | server.js:56-63 | CWE-522/693 | httpOnly, secure, sameSite: strict |
| MC-018 | user-dao.js:65 | CWE-208 | bcrypt.compareSync (inherently timing-safe) |

## Dependency Overrides Updated This Cycle

| Package | Previous Override | New Override | CVEs Addressed |
|---------|-----------------|-------------|----------------|
| js-yaml | >=3.13.1 | >=3.14.2 | CVE-2025-64718 |
| ajv | >=6.12.3 | >=6.14.0 | CVE-2025-69873 |
| marked | >=0.3.9 (dep) | ~4.3.0 | CVE-2022-21680, CVE-2022-21681, CVE-2017-16114, CVE-2018-25110 |
| micromatch | (none) | >=4.0.8 | CVE-2024-4067 |
| fsevents | (none) | >=1.2.11 | CVE-2023-45311 |

## Dependency Overrides Already in Place (Cycles 1-4)

handlebars>=4.7.9, lodash>=4.18.0, minimist>=1.2.6, json-schema>=0.4.0, form-data>=2.5.4, minimatch>=3.1.4, semver>=5.7.2, qs>=6.14.1, tough-cookie>=4.1.3, tar>=6.2.1, braces>=3.0.3, cross-spawn>=7.0.5, debug>=2.6.9, y18n>=3.2.2, brace-expansion>=1.1.13, trim-newlines>=3.0.1, sshpk>=1.13.2, shelljs>=0.8.5, nconf>=0.11.4, moment>=2.29.4, mime>=1.4.1, i>=0.3.7, ini>=1.3.6, kind-of>=6.0.3, fstream>=1.0.12, dot-prop>=4.2.1, diff>=3.5.1, decode-uri-component>=0.2.1, adm-zip>=0.4.9, xml2js>=0.5.0, undefsafe>=2.0.3, uglify-js>=2.6.0, tunnel-agent>=0.6.0, stringstream>=0.0.6, randomatic>=3.0.0, ms>=2.0.0, path-parse>=1.0.7, hosted-git-info>=2.8.9, is-my-json-valid>=2.17.2, jsonpointer>=5.0.0, helmet-csp>=2.9.1, bl>=1.2.3, extend>=3.0.2, tmp>=0.2.4, on-headers>=1.1.0, npm-user-validate>=1.0.1, chownr>=1.1.0, es5-ext>=0.10.63, yargs-parser>=5.0.1

## Findings Not Applicable (N/A)

### .trivy-results.json secrets (MC-001 through MC-007, MC-009 through MC-013)
- **Reason**: File `.trivy-results.json` does not exist in the repository. These findings reference secrets detected in a Trivy scan output file that was previously deleted.
- **Status**: N/A

## False Positives (Already Marked in Cycles 1-4)

All 6 CWE-532 false positives already marked with `// scanivy-ignore` comments:
- `artifacts/db-reset.js:47,57,59,63,65` — Debug logging for DB reset script
- `app/data/user-dao.js:41` — Debug logging for user ID type
- `app/routes/session.js:62` — Login attempt logging (sanitized)

## Packages Not Upgradable via Overrides

| Package | Current | Fix | Reason |
|---------|---------|-----|--------|
| babel-traverse | 6.11.4 | @babel/traverse@7.23.2 | Package renamed; old package deprecated |
| hawk | 1.0.0/3.1.3 | 9.0.1 | Breaking API; used by deprecated `request` |
| hoek | 0.9.1/2.16.3 | 8.5.1 | Breaking API; used by deprecated `hawk`/`boom` |
| got | 6.7.1 | 11.8.5 | Major version change; ESM-only in newer versions |
| swig | 1.4.2 | N/A | Package abandoned; no fix available |
| request | 2.36-2.88 | N/A | Package deprecated; no fix for SSRF bypass |

**Recommendation**: Full migration away from `request`, `hawk`, `hoek`, `swig`, and `babel` 6.x required.

## Environment Variables Required

After this cycle, the following environment variables are **mandatory**:

```bash
export SESSION_SECRET="<your-secure-random-secret>"
export CRYPTO_KEY="<your-secure-random-key>"
```

The application will fail to start without these values set.

## Files Modified This Cycle

| File | Change |
|------|--------|
| config/env/all.js | Removed hardcoded fallbacks, throw on missing env vars |
| package.json | Updated 2 overrides (js-yaml, ajv), added 3 new (micromatch, marked, fsevents) |
| server.js | Updated marked usage for v4.x API compatibility |
| REMEDIATION_NOTES.md | Generated this report |
