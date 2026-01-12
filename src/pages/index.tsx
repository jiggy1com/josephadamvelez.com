import Head from 'next/head';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { SideProjects } from '@/components/side-projects/SideProjects';
import { About } from '@/components/about/About';
import { Skills } from '@/components/skills/Skills';
import { Resume } from '@/components/resume/Resume';
import { Social } from '@/components/social/Social';
import { Contact } from '@/components/contact/Contact';
import { Nav } from '@/components/nav/Nav';
import { Hero } from '@/components/hero/Hero';
import { Footer } from '@/components/Footer/footer';

export default function Home() {
    return (
        <>
            <Head>
                <title>Joseph Adam Velez .com</title>
                <meta name="description" content="" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
                />
            </Head>
            <Nav />
            <Hero />
            <About />
            <Skills />
            <Portfolio />
            <SideProjects />
            <Resume />
            <Social />
            <Contact />
            <Footer />
        </>
    );
}
