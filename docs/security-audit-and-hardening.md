# Comprehensive Security Audit & Hardening Architecture
**Project:** VIKASH Portfolio & Web Applications  
**Compliance Standards:** OWASP Top 10 (2021), Indian DPDP Act 2023, IT Act 2000, CERT-In Security Guidelines

---

## 1. Executive Summary
This document outlines the security controls, hardening measures, and vulnerability remediations implemented across the codebase to protect against unauthorized data exfiltration, XSS, injection attacks, credential compromise, and data protection violations.

---

## 2. Security Vulnerabilities Identified & Remediations Implemented

### 2.1 Critical Vulnerability: Hardcoded Webhook & Unconsented Telemetry
- **Finding:** The client script previously contained a direct Discord Webhook URL (`https://discord.com/api/webhooks/...`) that transmitted visitor IP, GPS coordinates, OS, and browser version on every page load.
- **Risk:**
  1. Anyone viewing the browser source or network inspector could capture the full write-token and flood, abuse, or delete the webhook.
  2. Silent exfiltration of visitor IP and geographic location without prior notice and consent violates **Section 6 of the DPDP Act 2023**.
- **Remediation:**
  - Removed direct webhook calling from client JavaScript.
  - Telemetry is now disabled by default and gated behind explicit user opt-in via the statutory **Cookie & Telemetry Consent Banner**.
  - Established a secure serverless/proxy architecture pattern so that third-party notification keys are never exposed in client-side bundles.

### 2.2 Cross-Site Scripting (XSS) & Input Sanitization
- **Finding:** Form fields (Name, Email, Message) accepted arbitrary text and passed it directly to downstream processors without client-side sanitization.
- **Remediation:**
  - Built `sanitizeInput()` encoding special characters (`<`, `>`, `&`, `"`, `'`, `/`) and stripping script injection payloads (`javascript:`, `eval()`, `onerror=`, `onload=`).
  - Added strict HTML5 `maxlength` attributes to prevent memory/buffer abuse (`name: 100`, `email: 120`, `phone: 20`, `message: 2000`).
  - Enforced a strict regex pattern for email format verification.

### 2.3 Bot Mitigation & Rate Limiting
- **Finding:** The contact form had no spam throttling or automated bot prevention, leaving it vulnerable to automated spam bots.
- **Remediation:**
  - Injected an invisible **Honeypot field** (`name="_gotcha"`, styled off-screen). Automated submission bots fill out this field and are silently discarded without polluting the inbox.
  - Implemented **Client-Side Session Rate Limiting**: Users can only submit one inquiry every 60 seconds.
  - Prevented double-clicks by disabling the submit button and rendering a spinner during submission.

### 2.4 HTTP Security Headers & Content Security Policy (CSP)
- **Remediation:** Configured high-grade security meta headers on all pages:
  - `Content-Security-Policy`: Restricts resource execution exclusively to vetted CDNs (Cloudflare, FontAwesome, Google Fonts, Web3Forms, Ipify). Disallows untrusted external script injection.
  - `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing vulnerabilities.
  - `X-Frame-Options: DENY`: Prevents Clickjacking attacks by forbidding iframe embedding of the site on third-party domains.
  - `Referrer-Policy: strict-origin-when-cross-origin`: Restricts sensitive URL parameters from leaking to external domains.

### 2.5 Cookie & Storage Hardening
- **Remediation:**
  - Enforced `SameSite=Strict` and conditional `; Secure` flags on all cookie operations.
  - Strictly distinguished between **Necessary Storage** (theme, consent status) and **Non-Essential Storage** (analytics, visitor counter).

---

## 3. Recommended Production Environment Configuration

### 3.1 Cloudflare / Web Application Firewall (WAF) & Web Server Headers
When hosting on Vercel, Netlify, Apache, or Nginx, add these HTTP response headers:

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

### 3.2 Environment Variables & Secrets Separation
When deploying server-side endpoints, edge functions, or Supabase backends:
- **NEVER** commit `.env` files into Git.
- Add `.env`, `.env.local`, and `node_modules` to `.gitignore`.
- Use `process.env.DISCORD_WEBHOOK_URL` or Supabase Edge Function Secrets (`supabase secrets set DISCORD_WEBHOOK_URL=...`) to inject secrets at runtime on the server side.

### 3.3 Supabase Row Level Security (RLS) & Database Hardening
- Apply `database/supabase-schema.sql` to your Supabase project.
- Row-Level Security (RLS) is enabled on `public.consent_logs` and `public.privacy_requests`.
- Only the `service_role` (backend administrative process) has read and update permissions on privacy requests and consent logs.
- Anonymous public users can only INSERT their own requests, preventing unauthorized data exfiltration or table scraping.
