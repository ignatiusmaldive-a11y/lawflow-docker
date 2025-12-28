import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/index',
        'getting-started/quick-start',
      ],
    },
    {
      type: 'category',
      label: 'Core Workflows',
      items: [
        'core-workflows/matters',
        'core-workflows/tasks',
        'core-workflows/documents',
      ],
    },
    {
      type: 'category',
      label: 'Technical Setup',
      items: [
        'technical-setup/index',
        'technical-setup/local-development',
        'technical-setup/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
