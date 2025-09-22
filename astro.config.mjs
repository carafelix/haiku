import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { populateFrontmatter } from './src/utils/frontmatter.ts'

export default defineConfig({
    site: 'https://mysite.com',
    devToolbar: {
        enabled: false,
    },
    integrations: [sitemap()],
    prefetch: true,
    vite: {
        ssr: {
            noExternal: ['smartypants'],
        },
    },
    markdown: {
        remarkPlugins: [populateFrontmatter],
    },
})
