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
import { navItems } from '@/config/NavConfig';

export default function Home() {
    return (
        <>
            <Nav navItems={navItems} />
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
