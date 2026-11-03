import { defineConfig, lazyPlugins } from 'vite-plus'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// Astro has its own Vite config (see astro.config.mjs), this file only configures the
// Vite+ toolchain: `vp lint`, `vp fmt` and `vp test` (Vitest).

// Generated, never lint or format
const generated = ['src/lib/dtos.ts']

export default defineConfig({
    // lazyPlugins skips loading plugins for `vp check/lint/fmt`
    plugins: lazyPlugins(() => [react()]),
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'happy-dom',
        include: ['src/**/*.test.{ts,tsx}'],
    },
    lint: {
        ignorePatterns: ['dist/**', 'public/**', '.astro/**', ...generated],
        plugins: ['oxc', 'typescript', 'unicorn', 'react'],
        categories: {
            correctness: 'error', // ~ eslint:recommended
        },
        env: { browser: true, builtin: true },
        rules: {
            // typescript-eslint recommended
            'typescript/ban-ts-comment': 'error',
            'typescript/no-duplicate-enum-values': 'error',
            'typescript/no-empty-object-type': 'error',
            'typescript/no-explicit-any': 'error',
            'typescript/no-extra-non-null-assertion': 'error',
            'typescript/no-misused-new': 'error',
            'typescript/no-namespace': 'error',
            'typescript/no-non-null-asserted-optional-chain': 'error',
            'typescript/no-require-imports': 'error',
            'typescript/no-this-alias': 'error',
            'typescript/no-unnecessary-type-constraint': 'error',
            'typescript/no-unsafe-declaration-merging': 'error',
            'typescript/no-unsafe-function-type': 'error',
            'typescript/no-wrapper-object-types': 'error',
            'typescript/prefer-as-const': 'error',
            'typescript/prefer-namespace-keyword': 'error',
            'typescript/triple-slash-reference': 'error',
            // eslint-plugin-react-hooks recommended
            'react/rules-of-hooks': 'error',
            'react/exhaustive-deps': 'warn',
            // eslint-plugin-react-refresh
            'react/only-export-components': ['warn', { allowConstantExport: true }],
            // new in Oxlint's correctness category, not in the previous ESLint config
            'typescript/no-floating-promises': 'warn',
            'react/purity': 'warn',
        },
        options: {
            typeAware: true,
            typeCheck: true, // replaces `tsc -b`
        },
    },
    fmt: {
        semi: false,
        singleQuote: true,
        tabWidth: 4,
        printWidth: 160,
        ignorePatterns: ['dist/**', 'public/**', '.astro/**', ...generated],
        overrides: [
            { files: ['**/*.json'], options: { tabWidth: 2 } }, // match npm's package.json indent
        ],
    },
})
