import styles from './SideProjects.module.scss';
import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';

type SideProject = {
    name: string;
    description: string;
    technologies?: string[];
    link?: string;
    github?: string;
    image?: string;
};

type SideProjectList = SideProject[];

export function SideProjects() {
    const projectsList: SideProjectList = [
        {
            name: 'JosephAdamVelez.com',
            description:
                'A personal portfolio/resume website built with Next.js and hosted on Vercel, showcasing my skills, projects, and experience as a web developer.',
            technologies: ['Next.js', 'React', 'TypeScript', 'Vercel'],
            link: 'https://www.josephadamvelez.com',
            github: 'https://github.com/jiggy1com/josephadamvelez.com',
            image: '',
        },
        {
            name: 'Vue SiteBuilder',
            description:
                'A (from scratch) site builder application built with Vue.js for creating and managing websites with drag-and-drop functionality. Docker is used to create two containers, one for the Vue frontend and another for the NGINX web server.',
            technologies: ['Vue.js', 'Vuex', 'MySQL', 'NGINX', 'Mail-in-a-Box API', 'Docker'],
            link: 'https://www.meanwebapp.com',
            github: '',
            image: '',
        },
        {
            name: 'NextJS SiteBuilder',
            description: `A modern site builder application developed using Next.js, built on top of my legacy ColdFusion site builder's database, enabling users to design and deploy websites with ease.`,
            technologies: ['Next.js', 'React', 'MySQL', 'Mail-in-a-Box API', 'Vercel'],
            link: 'https://www.ibuildyourwebsite.net/',
            github: '',
            image: 'nextjs-site-builder.png',
        },
        {
            name: 'First SiteBuilder (ColdFusion)',
            description:
                'The original site builder application created with ColdFusion, providing foundational features for website creation and management.',
            technologies: ['ColdFusion', 'Lucee', 'MySQL', 'Xmail API', 'NGINX'],
            link: 'https://www.ibuildyoursite.com/',
            github: '',
            image: 'ibys-com.png',
        },
        {
            name: 'Bamby Bungalow',
            description:
                'A brochure website for a vacation rental property, showcasing amenities, availability, and booking options for potential guests.',
            technologies: ['NextJS', 'VRBO API', 'PriceLabs API', 'Vercel'],
            link: 'https://www.bambybungalow.com/',
            github: '',
            image: 'bamby-bungalow.png',
        },
        {
            name: 'Flora Health Insurance',
            description:
                'A simple data collection form generating leads and base quote for various insurance plans and resources for individuals and families.',
            technologies: ['NextJS', 'React', 'Node.js', 'Vercel'],
            link: 'https://www.florahealthinsurance.com/',
            github: '',
            image: 'flora-health-insurance.png',
        },
        {
            name: 'Intermittent Fasting Mom',
            description:
                'A tree site used to provide links to other sites about intermittent fasting, providing tips, recipes, and success stories for moms.',
            technologies: ['NextJS', 'Vercel'],
            link: 'https://intermittentfastingmom.com/',
            github: '',
            image: 'intermittent-fasting-mom.png',
        },
        {
            name: 'The Movie Database',
            description:
                'This is a project I started to learn React. A comprehensive database of movies and TV shows, offering reviews, ratings, and recommendations for entertainment enthusiasts. I am in the process of rewriting this project using NextJS.',
            technologies: ['React 14', 'TMDB API'],
            link: 'https://jv-react-tmdb.herokuapp.com/',
            github: 'https://github.com/jiggy1com/react-tmdb',
            image: '',
        },
        {
            name: 'RosterRhino.team',
            description:
                'This project originally started with building a simple site for my weekend soccer team, Tyros Football Club, featuring team news, match schedules, player profiles, and fan engagement features. Then I expanded it to support multiple teams and leagues.',
            technologies: ['PHP', 'MySQL'],
            link: 'https://rosterrhino.team/',
            github: 'https://github.com/jiggy1com/tyrosfc.com',
            image: 'roster-rhino.png',
        },
        {
            name: 'React Copy to Clipboard',
            description:
                'I found myself using multiple sources to copy from, but knowing where to look became overwhelming. So I created this simple app to organize and maintain things I frequently copy and paste while on the job.',
            technologies: ['NextJS', 'React', 'MongoDB', 'Vercel'],
            link: 'https://www.jiggy1.com/',
            github: 'https://github.com/jiggy1com/react-copy-to-clipboard',
            image: 'clipboard-manager.png',
        },
    ];

    return (
        <Section id={'side-projects'}>
            <article>
                <H1>Side Projects</H1>

                {/*<p>Below are some of my own personal projects I've worked on over the years.</p>*/}
                {/*<p>In some cases I've kept the repository private for security purposes.</p>*/}

                <div className={styles.sideProjectList}>
                    <div>
                        <p>
                            Here are some of my own personal projects I've worked on over the years.
                            I feel that side projects are a great way to learn new technologies and
                            improve my skills.
                        </p>
                        <p>In some cases I've kept the repository private for security purposes.</p>
                        <p>Enjoy!</p>
                    </div>
                    {projectsList.map((project) => {
                        return (
                            <div key={project.name}>
                                <h2>{project.name}</h2>

                                {project.image && !project.link && (
                                    <img
                                        src={'/images/side-projects/' + project.image}
                                        alt={project.name}
                                    />
                                )}

                                {project.image && project.link && (
                                    <a href={project.github} target="_blank" rel="noopener ">
                                        <img
                                            src={'/images/side-projects/' + project.image}
                                            alt={project.name}
                                        />
                                    </a>
                                )}

                                <p>{project.description}</p>

                                {project.technologies && (
                                    <p>
                                        <strong>Technologies:</strong>{' '}
                                        {project.technologies.join(', ')}
                                    </p>
                                )}

                                {project.link && (
                                    <p>
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener"
                                            className={'button full-width'}>
                                            Website
                                        </a>
                                    </p>
                                )}
                                {project.github && (
                                    <p>
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            rel="noopener"
                                            className={'button full-width'}>
                                            GitHub Repo
                                        </a>
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/*<h2>Vue SiteBuilder</h2>*/}

                {/*<h2>NextJS SiteBuilder</h2>*/}

                {/*<h2>First SiteBuilder (ColdFusion)</h2>*/}

                {/*<h2>Bamby Bungalow</h2>*/}

                {/*<h2>Flora Health Insurance</h2>*/}

                {/*<a href={'https://www.florahealthinsurance.com/'} target={'_blank'}>*/}
                {/*    https://www.florahealthinsurance.com/*/}
                {/*</a>*/}

                {/*intermittentfastingmom.com*/}

                {/*The Movie Database*/}

                {/*TyrosFC.com*/}

                {/*https://github.com/jiggy1com/react-copy-to-clipboard*/}
            </article>
        </Section>
    );
}
