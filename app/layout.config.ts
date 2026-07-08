import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: '芯海 Zephyr EC 方案',
    url: '/',
  },
  links: [
    {
      text: '快速上手',
      url: '/docs/getting-started',
      active: 'nested-url',
    },
    {
      text: '开发指南',
      url: '/docs/development',
      active: 'nested-url',
    },
    {
      text: '移植指南',
      url: '/docs/porting',
      active: 'nested-url',
    },
    {
      text: '最佳实践',
      url: '/docs/best-practices',
      active: 'nested-url',
    },
    {
      text: '参考',
      url: '/docs/reference',
      active: 'nested-url',
    },
  ],
};
