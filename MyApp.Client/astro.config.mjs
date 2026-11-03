// @ts-check
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, fontProviders } from 'astro/config'

const target = process.env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}`
    : process.env.ASPNETCORE_URLS
      ? process.env.ASPNETCORE_URLS.split(';')[0]
      : 'https://localhost:5001'

// Public URL of the deployed App, used for canonical URLs, RSS and the sitemap
const site = process.env.KAMAL_DEPLOY_HOST ? `https://${process.env.KAMAL_DEPLOY_HOST}` : target

// https://astro.build/config
export default defineConfig({
    site,
    // Static export (Astro's default): every page is prerendered to MyApp.Client/dist, which is served from MyApp/wwwroot
    output: 'static',
    build: {
        // /about => about.html, served without the .html by MapCleanUrls() in Program.cs
        format: 'file',
    },
    trailingSlash: 'never',
    integrations: [mdx(), sitemap(), react()],
    server: {
        host: true, // Listen on all interfaces (both IPv4 and IPv6)
        port: 5173, // .NET's NodeProxy proxies to port 5173 in development
    },
    vite: {
        plugins: [tailwindcss()],
        server: {
            strictPort: true, // fail instead of silently moving to a port .NET isn't proxying
        },
    },
    fonts: [
        {
            provider: fontProviders.local(),
            name: 'Atkinson',
            cssVariable: '--font-atkinson',
            fallbacks: ['sans-serif'],
            options: {
                variants: [
                    {
                        src: ['./src/assets/fonts/atkinson-regular.woff'],
                        weight: 400,
                        style: 'normal',
                        display: 'swap',
                    },
                    {
                        src: ['./src/assets/fonts/atkinson-bold.woff'],
                        weight: 700,
                        style: 'normal',
                        display: 'swap',
                    },
                ],
            },
        },
    ],
})
