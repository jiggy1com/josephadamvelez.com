import { Head, Html, Main, NextScript } from 'next/document';
import { fontUbuntu } from '@/utils/fonts';

export default function Document() {
    return (
        <Html lang="en" className={fontUbuntu.className}>
            <Head />
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
