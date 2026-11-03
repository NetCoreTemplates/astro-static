import { useEffect, type ComponentType } from 'react'
import { ClientContext } from '@servicestack/react'
import { client, init } from './gateway'

/**
 * Wraps a React component used as an Astro island (e.g. `<HelloApi client:load />`).
 * Each island is a separate React root, so each needs its own ClientContext for useClient().
 * The first island to hydrate loads the App's metadata and auth state, which all islands share.
 */
export function withApp<P extends object>(Component: ComponentType<P>) {
    const AppIsland = (props: P) => {
        useEffect(() => {
            void init()
        }, [])
        return (
            <ClientContext.Provider value={client}>
                <Component {...props} />
            </ClientContext.Provider>
        )
    }
    AppIsland.displayName = `withApp(${Component.displayName || Component.name || 'Component'})`
    return AppIsland
}
