// Docusaurus config that points the docs plugin at the repository's docs/ folder.
module.exports = {
  title: 'TownesDev Docs',
  tagline: 'Internal platform docs',
  url: 'http://localhost',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'TownesDev',
  projectName: 'web-app',
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          // Use the repo docs folder as the source of truth
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          // Docusaurus expects a string or array for customCss. Point to the brand CSS file.
          customCss: require.resolve('./src/css/custom-brand.css'),
        },
      },
    ],
  ],
}
