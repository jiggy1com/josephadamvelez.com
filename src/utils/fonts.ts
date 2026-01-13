import { Poiret_One, Ubuntu } from 'next/font/google';
// import {Geist, Geist_Mono} from 'next/font/google'
// import {Material_Symbols_Outlined} from 'next/font/google'

export const fontUbuntu = Ubuntu({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-ubuntu',
});

export const fontPoiretOne = Poiret_One({
    weight: ['400'],
    subsets: ['latin'],
    variable: '--font-poiret-one',
});

// export const fontGeistSans = Geist({
//     variable: "--font-geist-sans",
//     subsets: ["latin"],
// });
//
// export const fontGeistMono = Geist_Mono({
//     variable: "--font-geist-mono",
//     subsets: ["latin"],
// })

// export const fontMaterialSymbolsOutlined = Material_Symbols_Outlined({
//     weight: ['400', '700'],
//     subsets: ['latin'],
//     variable: '--font-material-symbols-outlined',
// })
