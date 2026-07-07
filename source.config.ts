import { defineConfig, defineDocs } from 'fumadocs-mdx/config';

export const docs = defineDocs({
  dir: 'content/docs',
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
    rehypeCodeOptions: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      langs: [
        'bash',
        'batch',
        'c',
        'cmake',
        'json',
        'jsonc',
        'ini',
        'makefile',
        'mermaid',
        'powershell',
        'python',
        'yaml',
      ],
      defaultLanguage: 'text',
      langAlias: {
        kconfig: 'ini',
        dts: 'c',
        devicetree: 'c',
        make: 'makefile',
      },
    },
  },
});
