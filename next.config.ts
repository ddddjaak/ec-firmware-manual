import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const isStaticExport = process.env.NEXT_STATIC_EXPORT === '1';

const nextConfig = {
  output: isStaticExport ? ('export' as const) : undefined,
  trailingSlash: true,
  basePath: '/zephyr-ec-learning-system',
  images: {
    unoptimized: true,
  },
  transpilePackages: ['flexsearch'],
};

export default withMDX(nextConfig);
