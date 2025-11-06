# TownesDev docs-site (Docusaurus)

This small scaffold makes the repository `docs/` folder available as a Docusaurus site. It is designed for local intranet hosting (TSERVER) or to be built by CI and deployed to GitHub Pages / Vercel.

Quick start (from `app/web/townesdev-app`):

```powershell
cd docs-site; npm install
npm run start
```

To build a static site:

```powershell
npm run build
npm run serve
```

Notes:

- The Docusaurus config points to `../docs` so you can keep editing docs in-place.
- Installing deps is required the first time. CI can run `npm ci` in `docs-site` and publish the `build` output.
