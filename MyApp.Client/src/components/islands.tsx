// React components used as interactive Astro islands, e.g. `<UserMenu client:load />`.
// Each is wrapped with withApp() so it can call ServiceStack APIs and share the signed-in user.
import { DarkModeToggle as SsDarkModeToggle, PrimaryButton, SecondaryButton } from '@servicestack/react'
import { withApp } from '@/lib/app'
import { appAuth, ValidateAuth } from '@/lib/auth'
import HelloApiComponent from './HelloApi'
import Page from './Page'

export const HelloApi = withApp(HelloApiComponent)

// Reads the current color scheme on its first render, so use it with client:only="react" to avoid a hydration mismatch
export const DarkModeToggle = withApp(function DarkModeToggle() {
    return <SsDarkModeToggle />
})

/** Sign in link, or the signed-in user's avatar linking to their profile */
export const UserMenu = withApp(function UserMenu() {
    const { user, ready } = appAuth()
    if (!ready) return <span className="inline-block h-8 w-8" />
    if (!user) {
        return (
            <a
                href={`/Identity/Account/Login?ReturnUrl=${encodeURIComponent(location.pathname)}`}
                className="whitespace-nowrap rounded-md px-3 py-1.5 text-[15px] font-bold text-gray-700 ring-1 ring-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
            >
                Sign In
            </a>
        )
    }
    return (
        <a href="/profile" className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" title={user.userName}>
            <img className="h-8 w-8 rounded-full" src={user.profileUrl} alt="" />
            <span className="sr-only">{user.userName} Profile</span>
        </a>
    )
})

/** Home page profile / sign out buttons */
export const AuthButtons = withApp(function AuthButtons() {
    const { user, ready, signOut } = appAuth()
    if (!ready) return <div className="h-10" />
    return (
        <div className="flex items-center space-x-4">
            {user ? (
                <>
                    <a
                        href="/profile"
                        className="max-w-xs rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 lg:p-2 lg:rounded-md lg:hover:bg-gray-50 dark:lg:hover:bg-gray-800 dark:ring-offset-black"
                        id="user-menu-button"
                    >
                        <img className="h-8 w-8 rounded-full" src={user.profileUrl} alt="User Profile" />
                        <span className="hidden ml-3 text-gray-700 dark:text-gray-300 text-sm font-medium lg:block">{user.userName}</span>
                    </a>
                    <SecondaryButton onClick={() => signOut('/')}>Sign Out</SecondaryButton>
                </>
            ) : (
                <SecondaryButton href="/profile" className="items-center">
                    🙍🏻‍♂️ My Profile
                </SecondaryButton>
            )}
        </div>
    )
})

function ProfileComponent() {
    const { user, signOut } = appAuth()
    return (
        <Page title={(user!.displayName || user!.userName) + ' Profile'}>
            <div className="mx-auto flex flex-col items-center">
                <img className="my-4 size-36 rounded-full" src={user.profileUrl} alt="User Profile" />
                <div className="text-gray-900 dark:text-gray-100">{user.displayName}</div>
                <div className="text-gray-700 dark:text-gray-300">{user.userName}</div>
                <div className="mt-2">
                    {(user.roles || []).map((role) => (
                        <span
                            key={role}
                            className="ml-3 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium leading-5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                        >
                            {role}
                        </span>
                    ))}
                </div>
                <SecondaryButton className="mt-8" onClick={() => signOut('/')}>
                    Sign Out
                </SecondaryButton>
                <PrimaryButton className="mt-8" href="/Identity/Account/Manage">
                    Identity Auth Account
                </PrimaryButton>
                <SecondaryButton className="mt-8" href="/">
                    🏠 Home
                </SecondaryButton>
            </div>
        </Page>
    )
}

/** Signed-in user's profile, redirects to the Identity login page when signed out */
export const Profile = withApp(ValidateAuth(ProfileComponent))
