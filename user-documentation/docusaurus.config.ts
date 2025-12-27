import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'LawFlow Documentation',
  tagline: 'Legal Practice Management Made Simple',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://docs.lawflow.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'lawflow', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en', 'es'],
  // },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lawflow/lawflow/edit/main/user-documentation/',
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'LawFlow Blog',
          blogDescription: 'Latest updates, tips, and insights from the LawFlow team',
          postsPerPage: 6,
          blogSidebarTitle: 'Recent Posts',
          blogSidebarCount: 5,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/lawflow/lawflow/edit/main/user-documentation/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-XXXXXXXXXX',
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
        googleAnalytics: {
          trackingID: 'G-XXXXXXXXXX',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],


  themeConfig: {
    // Replace with your project's social card
    image: 'img/lawflow-social-card.jpg',
    navbar: {
      title: 'LawFlow Docs',
      logo: {
        alt: 'LawFlow Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/lawflow/lawflow',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started',
            },
            {
              label: 'Core Workflows',
              to: '/docs/core-workflows/matters',
            },
            {
              label: 'Technical Setup',
              to: '/docs/technical-setup',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/lawflow/lawflow',
            },
            {
              label: 'Discord',
              href: 'https://discord.gg/lawflow',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'LawFlow App',
              href: 'https://app.lawflow.app',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} LawFlow. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
