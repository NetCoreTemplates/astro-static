import React, { useEffect } from 'react'
import { useAuth, Loading } from '@servicestack/react'
import { client, Routes, useAppReady } from './gateway'
import { Authenticate } from '@/lib/dtos'

export const Redirecting = () => {
    return <Loading className="py-2 pl-4">redirecting ...</Loading>
}

type ValidateAuthProps = {
    role?: string
    permission?: string
    redirectTo?: string
}
/** Only renders Component for signed-in users (with the required role or permission), otherwise redirects */
export function ValidateAuth<TOriginalProps extends object>(Component: React.FC<TOriginalProps>, validateProps?: ValidateAuthProps) {
    const { role, permission } = validateProps ?? {}
    const ValidatedComponent: React.FC<TOriginalProps> = (props) => {
        const ready = useAppReady()
        const { user, isAuthenticated, hasRole } = useAuth()

        const shouldRedirect = () =>
            !isAuthenticated
                ? Routes.signin(validateProps?.redirectTo ?? location.pathname)
                : role && !hasRole(role)
                  ? Routes.forbidden()
                  : permission && !hasRole(permission)
                    ? Routes.forbidden()
                    : null

        useEffect(() => {
            // Auth state isn't known until init() has run in the browser
            if (!ready) return
            const goTo = shouldRedirect()
            if (goTo) {
                // Astro pages are separate HTML documents, so redirects are full page loads
                location.replace(goTo)
            }
        }, [ready, user])

        if (!ready) {
            return <Loading className="py-2 pl-4" />
        }

        if (shouldRedirect()) {
            return <Redirecting />
        }

        return <Component {...props} />
    }

    return ValidatedComponent
}

// appAuth is a hook, but keeps its name for compatibility with the other templates
export function appAuth() {
    // oxlint-disable-next-line react/rules-of-hooks
    const authState = useAuth()
    // oxlint-disable-next-line react/rules-of-hooks
    const ready = useAppReady()
    async function revalidate() {
        try {
            const response = await client.post(new Authenticate())
            authState.signIn(response)
        } catch {
            authState.signOut()
        }
    }
    async function signOut(redirectTo?: string) {
        await client.post(new Authenticate({ provider: 'logout' }))
        authState.signOut()
        if (redirectTo) {
            location.href = redirectTo
        }
    }
    return { ...authState, ready, revalidate, signOut }
}
