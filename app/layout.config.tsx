import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <img
        src="/ec-firmware-manual/media/chipsea-logo.png"
        alt="Chipsea 芯海科技 · 返回首页"
        className="h-7 w-auto"
      />
    ),
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
    {
      text: 'Q&A',
      url: '/docs/qa',
      active: 'nested-url',
    },
  ],
};
