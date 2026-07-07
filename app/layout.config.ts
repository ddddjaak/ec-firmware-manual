import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: 'Chipsea Zephyr EC Manual',
    url: '/',
  },
  links: [
    {
      text: 'Getting Started',
      url: '/docs/getting-started',
      active: 'nested-url',
    },
    {
      text: 'Development',
      url: '/docs/development',
      active: 'nested-url',
    },
    {
      text: 'Porting',
      url: '/docs/porting',
      active: 'nested-url',
    },
    {
      text: 'Best Practices',
      url: '/docs/best-practices',
      active: 'nested-url',
    },
    {
      text: 'Reference',
      url: '/docs/reference',
      active: 'nested-url',
    },
  ],
};
