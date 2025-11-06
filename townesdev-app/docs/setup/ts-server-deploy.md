# Deploying the docs site to TSERVER (Windows)

This page describes a minimal, secure, and reproducible way to host the built Docusaurus `build/` output on an internal Windows server (TSERVER). It includes three recommended approaches, a suggested CI flow, and a short example of using NSSM to run a static server as a Windows service.

Recommendation

- Quick: build in CI, produce a ZIP artifact, and have TSERVER extract it to `C:\sites\townesdev-docs\build`. Run a lightweight static server as a service (NSSM) and optionally reverse-proxy via IIS or Caddy.
- Production: prefer a reverse-proxy (IIS or Caddy) in front of static files for TLS and host routing.

Options overview

- NSSM + Node static server: Fast to implement on Windows; run `npx serve -s build -l 3334` as a service.
- IIS + URL Rewrite + ARR: Enterprise-friendly, TLS via IIS, robust management.
- Caddy: Small binary, automatic TLS (public hosts), easy reverse-proxying.

CI + deploy flow (recommended)

1. CI builds the Docusaurus site and uploads a `.zip` artifact.
2. TSERVER pulls the artifact (CI push or manual), extracts to the target folder, and restarts the service or lets the proxy serve new files.

If you'd like, I added two helper scripts in `scripts/`:

- `scripts/deploy-docs.ps1` — extracts a ZIP artifact to the target folder and restarts the site service (supports NSSM or native Windows services).
- `scripts/install-nssm-service.ps1` — installs an NSSM service that runs a Node static server (for quick deployments).

You can run the installer script once (Admin) and then use `deploy-docs.ps1` from your CI runner or a scheduled job to update the content.
