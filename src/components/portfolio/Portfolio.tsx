import { H1 } from '@/components/heading/H1';
import { Section } from '@/components/section/Section';
import { PortfolioItem } from '@/components/portfolio/PortfolioItem';
import styles from './Portfolio.module.scss';

export function Portfolio() {
    const portfolioList = [
        {
            folder: 'supsouthlaketahoe.com',
            siteName: 'SUP South Lake Tahoe',
            description:
                'A stylish 5 page responsive brochure website for SUP rentals in Lake Tahoe.',
            technology: [
                'PHP',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 3',
                'Instagram API',
                'WordPress',
                'FancyBox',
            ],
            images: 6,
        },
        {
            folder: 'smallbizpro.net',
            siteName: 'SmallBizPro',
            description:
                'SmallBizPro allows business owners to conveniently upload, store, and access their important organizational documents.',
            technology: [
                'ColdFusion',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 3',
                'AuthorizeNet API',
                'YouTube API',
            ],
            images: 15,
        },
        {
            folder: 'nationsurfboards.com',
            siteName: 'Nation Surfboards',
            description:
                '4 page brochure site for custom surfboard design. E-commerce provided by SquareUp.com.',
            technology: [
                'PHP',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 2',
                'Flexslider',
                'Instagram API',
                'Vimeo API',
            ],
            images: 4,
        },
        {
            folder: 'suplove.com',
            siteName: 'SUP Love',
            description:
                'SUP Love is a boutique stand-up paddleboard (SUP) provider. Custom shopping cart with AuthorizeNet integration. Also implemented canada.suplove.com using a single source code.',
            technology: [
                'PHP',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 2',
                'WordPress',
                'Custom WordPress CMS Plugin',
                'Instagram API',
                'Twitter Feed',
                'AuthorizeNet API',
                'Google Maps API',
            ],
            images: 13,
        },
        {
            folder: 'cookandeattheusa.com',
            siteName: 'Cook and Eat the USA',
            description:
                'Chef Marla provides cooking classes with regional-based recipes. Online registration fees are processed through AuthorizeNet.',
            technology: [
                'PHP',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 3',
                'Custom CMS',
                'AuthorizeNet API',
            ],
            images: 11,
        },
        {
            folder: 'nationmfg.com',
            siteName: 'Nation Golf',
            description: '4 page brochure site for golf wear. E-commerce provided by SquareUp.com.',
            technology: [
                'PHP',
                'HTML',
                'CSS',
                'JS',
                'jQuery',
                'Bootstrap 3',
                'Large scaling video',
            ],
            images: 5,
        },
        {
            folder: 'diversityinv.com',
            siteName: 'Diversity Investigative Services',
            description:
                "5 page brochure site for Orange County's premier private investigative services. This site uses my proprietary site building technology wrapped with Bootstrap 3. Also implemented a custom UI for investigators to upload daily reports over HTTPS, and allow the site owner to update their clients on the status of their case. (not shown)",
            technology: ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 2', 'Flexslider'],
            images: 5,
        },
        {
            folder: 'kidsfurnituresuperstore.us',
            siteName: 'Kids Furniture Superstore',
            description:
                'Kids Furniture Superstore provides Los Angeles residents a plethora of baby and kids furniture, over 4000 listed products. This site uses my proprietary site building technology wrapped with Bootstrap 3.',
            technology: ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3', 'Flexslider'],
            images: 7,
        },
        {
            folder: 'kdsdiscount.com',
            siteName: 'KDS Discount',
            description:
                'KDS Discount provides Los Angeles residents a plethora of baby and kids furniture, over 3000 listed products. E-commerce enabled. This site uses my proprietary site building technology wrapped with Bootstrap 3.',
            technology: ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3'],
            images: 6,
        },
        {
            folder: 'babyfurnituresuperstore.us',
            siteName: 'Baby Furniture Superstore',
            description:
                'Baby Furniture Superstore provides Los Angeles residents a plethora of baby furniture, over 3000 listed products. This site uses my proprietary site building technology wrapped with Bootstrap 3.',
            technology: ['ColdFusion', 'HTML', 'CSS', 'JS', 'jQuery', 'Bootstrap 3'],
            images: 4,
        },
    ] as PortfolioItem[];

    return (
        <Section id={'portfolio'}>
            <article>
                <H1>Portfolio</H1>

                <p>
                    Some of these websites may no longer exist, but I have some screen shots and
                    maybe some code.
                </p>

                <div className={styles.portfolioList}>
                    {portfolioList.map((portfolioItem: PortfolioItem, index) => (
                        <PortfolioItem portfolioItem={portfolioItem} key={index} />
                    ))}
                </div>
            </article>
        </Section>
    );
}
