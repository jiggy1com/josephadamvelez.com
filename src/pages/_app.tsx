import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fontUbuntu } from '@/utils/fonts';
import { BruhNav } from '@/components/bruh/BruhNav';
import { SessionProvider } from '@/hooks/useSession';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    // BruhNav is rendered once here and persists across /bruh/* navigations.
    // This is what makes menu state (open/closed) survive router.push — the
    // Nav component doesn't unmount, so its state doesn't reset.
    const showBruhNav = router.pathname.startsWith('/bruh');

    return (
        <>
            <Head>
                <title>{pageProps?.title ?? 'Joseph Adam Velez .com'}</title>
                <meta name="description" content="" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
                />
            </Head>
            <div className={fontUbuntu.className}>
                <SessionProvider>
                    {showBruhNav && <BruhNav />}
                    <Component {...pageProps} />
                </SessionProvider>
            </div>
        </>
    );
}
