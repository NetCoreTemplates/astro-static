import { useSyncExternalStore } from 'react'
import { JsonServiceClient } from '@servicestack/client'
import { Authenticate } from '@/lib/dtos'

export function isServerRoute(path: string) {
    return path.startsWith('/Identity')
}

export const Routes = {
    signin: (redirectTo?: string) => '/Identity/Account/Login' + (redirectTo ? `?ReturnUrl=${encodeURIComponent(redirectTo)}` : ''),
    forbidden: () => '/forbidden',
}

export const client = new JsonServiceClient()

// Pages are prerendered at build time without a signed-in user, so auth state is only known
// after init() has run in the browser. Auth-protected islands wait for it before redirecting.
// Every React island on a page imports this same module, so they all share one init() and auth state.
let ready = false
const listeners = new Set<() => void>()
function setReady() {
    ready = true
    listeners.forEach((listener) => listener())
}
function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

/** true once init() has loaded the App's metadata and auth state */
export function useAppReady() {
    return useSyncExternalStore(
        subscribe,
        () => ready,
        () => false, // always false while prerendering
    )
}

let initPromise: Promise<unknown> | null = null

// Load Metadata & Auth State on Startup, runs once per page load in the browser (see withApp() in lib/app.tsx)
export function init() {
    if (typeof window === 'undefined') return Promise.resolve()
    return (initPromise ??= (async () => {
        // Loaded on demand so prerendering never touches browser-only APIs
        const { useMetadata, authContext } = await import('@servicestack/react')
        // oxlint-disable-next-line react/rules-of-hooks -- useMetadata is a factory, not a React hook
        const metadata = useMetadata(client)
        const authCtx = authContext()
        try {
            await Promise.all([
                metadata.loadMetadata(),
                client
                    .post(new Authenticate())
                    .then((r) => authCtx.signIn(r))
                    .catch(() => authCtx.signOut()),
            ])
        } finally {
            setReady()
        }
    })())
}

export function getRedirect(searchParams: URLSearchParams) {
    const redirect = searchParams.get('redirect')
    return redirect && Array.isArray(redirect) ? redirect[0] : redirect
}
