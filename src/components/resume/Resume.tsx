import {H1} from "@/components/heading/H1";
import {Section} from "@/components/section/Section";
import {TempComponent} from "@/components/temp/TempComponent";
import {ResumeItem} from "@/components/resume/ResumeItem";

export function Resume() {

    const resumeConfig = [
        {
            date: 'Jan 2016 - Present',
            title: 'Lead Software Engineer (PHP / Front-end)',
            company: 'CBS Interactive / Paramount, San Francisco, CA',
            subheading: 'CBS Interactive provides a global audience access to show content including cast, clips, stories, and online streaming of your favorite CBS shows. ',
            responsibilities: [
                `Manage multiple teams by facilitating their needs within and across other front-end, back-end, tracking and international teams.`,
                `Team focus includes domestic and international purchase flow, account management, A/B testing, internal Customer Service Tool and Employment Benefits site.`,
                `Participate in inception and architectural meetings with Design and/or Product`,
                `Break down sprint projects into smaller tasks`,
                `Code Review`,
                `Help on demand via Slack messaging/huddles, Zoom meetings`,
                `Management trainings, and One on Ones with direct reports`,
                `Lead team breakouts for dedicated time to go over questions, upcoming features, breakdown projects, POC or just chit chat about anything`,
                `Participate in daily scrum meetings, bi-weekly sprint planning, sprint review and scrum of scrum meetings.`,
            ],
            environment: 'PHP, Vue, NextJS/React, Nginx, Docker, Git, PhpStorm, Mac',
        },
        {
            date: `Aug 2012 - Nov 2015`,
            title: `Front-end Developer`,
            company: `Surfline/Wavetrack Inc., Huntington Beach, CA Aug 2012-Nov 2015`,
            subheading: `Surfline provides the world with surf reports & forecasts including swell, wind, tide, buoy and other related weather data. Surfline's other properties, FishTrack and Buoyweather, also provide similar data, as well as fishing charts and fishing reports.`,
            responsibilities: [

                `Participate in daily scrum meetings, weekly sprint planning and sprint grooming meetings.`,
                `Develop and maintain RESTful API end points for desktop sites, mobile sites, and mobile apps.`,
                `Develop Surfline forecast pages with JavaScript "forecast" object`,
                `Develop Fishing Reports integrating with FilePicker.io JavaScript API`,
                `http://www.fishtrack.com/fishing-reports/northern-california-region_58692`,
                `Develop Fishing Charts using NOAA imagery data (AVHRR, MODIS, VIIRS, etc)`,
                `http://www.fishtrack.com/fishing-charts/northern-california_58692`,
                `Develop back end API for Fishtrack mobile app`,
                `http://benefits.fishtrack.com/fishtrack_app_premium/`,
                `Develop Surfline's "Wave of the Winter" and "GoPro of the World" mini sites`,
                `http://www.surfline.com/gopro-of-the-world/III/`,
                `http://www.surfline.com/wave-of-the-winter/2014-2015/`,
                `Develop map view of surf spots using Google Maps integration`,
                `http://www.surfline.com/surf-report/ocean-beach-sf-northern-california_4127/satellite-view/`,
                `Use of prepared statements to prevent SQL injection`,
                `JavaScript API integration with FilePicker.io, Google Maps, Leaflet Maps`,
                `Develop Grads scripts, servlets and other JSP scripts`,
                `Maintain Surfline's State Parks's platform`,
                `Maintain Surfline's AngularJS mobile site`,
                `Develop home page modal for new visitors`,
                `Redis and Varnish caching`,
                `Use of multiple CDNs, including secure CDN`,
                `Cross browser testing`,
                `Contest / Landing page development`,
                `Bug fixes and Git branching`,

            ],
            environment: `MS SQL 2005, ColdFusion 8 & 9, Linux, Apache, Macbook Pro, SVN, Git`,
        },
        {
            date: `Nov 2014 - Oct 2015`,
            title: `Front-end Developer`,
            company: `SmallBizPro, Los angeles, CA`,
            subheading: `SmallBizPro enables business owners to upload, store, and access their important organizational documents, files, financials, policies & procedures, and reports. SmallBizPro also allows vendors, such as banks, to search their client directory for the purpose of pre-approving business loans.`,
            responsibilities: [

                `Create the site from the ground up using Bootstrap for a mobile friendly experience`,
                `Media Queries for specific styles on Desktop, Tablet or Phone devices`,
                `MySQL database and relational tables setup`,
                `Prepared statements (queries) to prevent SQL injection`,
                `Object oriented code`, `Uploadifive integration`,
                `Built-in JSON on Request for a custom API environment during Ajax requests`,
                `Custom CMS to maintain products, events, workshops, industries, users, documents and more`,
                `Various forms with JavaScript validation and calculations`,
                `Custom e-commerce UI/UX`,
                `AuthorizeNet payment gateway integration including subscriptions`,
                `SSL installation, CloudFlare implementation, and Apache mod_rewrite rules`,
            ],
            environment: `Windows, Apache, ColdFusion, MySQL, Git`,
        },
        {
            date: `Aug 2011 - Mar 2012`,
            title: `Front-end Developer`,
            company: `Interactive Tax Group, Newport Beach, Aug 2011-Mar 2012`,
            subheading: `Interactive Tax Group provides a directory of tax professionals, and tax related blogs. `,
            responsibilities: [
                `Create WordPress CMS plugin based on mocks`,
                `Create complex registration form for tax professionals`,
                `Create searchable directory listings`,
                `Payment gateway integration with recurring payments`,
                `Customize WordPress theme and various plugins`,
            ],
            environment: `LAMP (Linux, Apache, MySQL, PHP), WordPress`,
        },
        {
            date: `2008 - 2012`,
            title: `Front-end Developer`,
            company: `Dermstore, El Segundo, CA 2008-2012`,
            subheading: `Dermstore provides a very large e-commerce system including subscription based products for the beauty industry, bulk targeted email campaigns, and various in-house developed beauty products.`,
            responsibilities: [

                `Develop website and shopping cart system for the BeautyFIX brand`,
                `Cut up and develop pixel perfect designs from PSD files`,
                `Multiple redesign development`,
                `Request various queries to the DBA`,
                `Landing page development and iterations for A/B testing`,
                `Create HTML emails and deploy to user base`,

            ],
            environment: `LAMP (Linux, Apache, MySQL, PHP), ColdFusion, MS SQL, SVN`,
        },
        {
            date: ``,
            title: `Front-end Developer`,
            company: `White Barn Group, Lake Forest, CA`,
            subheading: `White Barn Group was a full service Interactive Agency executing on creative brand initiatives for clients such as Del Taco, IHOP, Yoshinoya, Toyota, ABC/Disney, VitalStream and others.`,
            responsibilities: [],
            environment: ``,
        },
        {
            date: ``,
            title: `Front-end Developer`,
            company: `EwingBeland, Monrovia, CA`,
            subheading: `EwingBeland was a full service Interactive Agency executing on creative brand initiatives for local clients such as Southern California Edison, Champion Broadband, Ventura Foods, and others.`,
            responsibilities: [],
            environment: ``,
        },
        {
            date: ``,
            title: `Front-end Developer`,
            company: `Webcreators, Newport Beach, CA`,
            subheading: `Webcreators provides a proprietary web site building technology and private labels their software.`,
            responsibilities: [],
            environment: ``,
        },

    ];

    return (
        <Section id={"resume"}>
            <article>
                <H1>Resume</H1>
                <button onClick={() => {
                    window.open('/Joe-Velez-Resume-2016-Resume-Only-Detailed.pdf')
                }}>Download
                </button>
                {resumeConfig.map((item, index) => {
                    return <ResumeItem item={item} key={index}/>
                })}
            </article>
        </Section>
    );
}