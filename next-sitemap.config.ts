/** @type {import('next-sitemap').Config} */
const config = {
  siteUrl: process.env.SITE_URL || 'https://finova.doitfun.web.id',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};

export default config;
