import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '1a9'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'c39'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'adb'),
            routes: [
              {
                path: '/accessibility-testing',
                component: ComponentCreator('/accessibility-testing', '227'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/api-guidelines',
                component: ComponentCreator('/api-guidelines', 'a14'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture-overview',
                component: ComponentCreator('/architecture-overview', '216'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/auth',
                component: ComponentCreator('/architecture/auth', 'bb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/bot-integration',
                component: ComponentCreator('/architecture/bot-integration', '33e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/caching',
                component: ComponentCreator('/architecture/caching', '4c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/data-layer',
                component: ComponentCreator('/architecture/data-layer', '6e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/multi-service',
                component: ComponentCreator('/architecture/multi-service', 'dd5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/overview',
                component: ComponentCreator('/architecture/overview', '391'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/payments',
                component: ComponentCreator('/architecture/payments', '624'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/performance',
                component: ComponentCreator('/architecture/performance', '027'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/architecture/route-groups',
                component: ComponentCreator('/architecture/route-groups', '210'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/audit/',
                component: ComponentCreator('/audit/', '04b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/audit/checkpoint-review',
                component: ComponentCreator('/audit/checkpoint-review', '7c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/audit/DOCS_AUDIT_COMPREHENSIVE',
                component: ComponentCreator('/audit/DOCS_AUDIT_COMPREHENSIVE', 'a7c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/audit/repo-issues',
                component: ComponentCreator('/audit/repo-issues', 'd8b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/',
                component: ComponentCreator('/development/', 'c92'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/advanced-features',
                component: ComponentCreator('/development/advanced-features', 'c40'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/ai-agents',
                component: ComponentCreator('/development/ai-agents', 'b22'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/onboarding-status',
                component: ComponentCreator('/development/onboarding-status', '462'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/pdf-reports',
                component: ComponentCreator('/development/pdf-reports', '468'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/performance-optimization',
                component: ComponentCreator('/development/performance-optimization', '8b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/development/testing-pdf-email',
                component: ComponentCreator('/development/testing-pdf-email', '5ce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/',
                component: ComponentCreator('/guides/', 'a06'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/email-integration',
                component: ComponentCreator('/guides/email-integration', 'a5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/launch-roadmap-2026',
                component: ComponentCreator('/guides/launch-roadmap-2026', '3ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/monitoring',
                component: ComponentCreator('/guides/monitoring', 'cb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/portal-flow',
                component: ComponentCreator('/guides/portal-flow', '249'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/sanity-preview',
                component: ComponentCreator('/guides/sanity-preview', '76b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/security',
                component: ComponentCreator('/guides/security', '2a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/standards',
                component: ComponentCreator('/guides/standards', 'b81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/stripe-webhooks-runbook',
                component: ComponentCreator('/guides/stripe-webhooks-runbook', 'b37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/testing',
                component: ComponentCreator('/guides/testing', '712'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/workflow',
                component: ComponentCreator('/guides/workflow', '6a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/onboarding-plan',
                component: ComponentCreator('/onboarding-plan', 'd68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/READY_FOR_LAUNCH',
                component: ComponentCreator('/READY_FOR_LAUNCH', 'a5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup',
                component: ComponentCreator('/setup', '5ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup/deployment',
                component: ComponentCreator('/setup/deployment', '200'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup/environment',
                component: ComponentCreator('/setup/environment', '1c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup/local-development',
                component: ComponentCreator('/setup/local-development', 'ff7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup/sanity',
                component: ComponentCreator('/setup/sanity', '857'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/setup/ts-server-deploy',
                component: ComponentCreator('/setup/ts-server-deploy', '004'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/SOT',
                component: ComponentCreator('/SOT', 'b43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'efa'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
