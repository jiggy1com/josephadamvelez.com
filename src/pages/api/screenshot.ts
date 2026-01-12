import puppeteer from 'puppeteer';
import { NextApiRequest, NextApiResponse } from 'next';

const mobileViewport = {
    width: 375,
    height: 800,
};

const desktopViewport = {
    width: 1440,
    height: 900,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Extract the target URL from the request query or body
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    let browser;
    try {
        // Launch a headless browser instance.
        // 'headless: "new"' uses the new Headless mode.
        // @ts-ignore
        browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        const dimensions = req.query.mobile ? mobileViewport : desktopViewport;
        await page.setViewport({
            ...dimensions,
            deviceScaleFactor: 1,
        });

        // Navigate to the specified URL and wait for the page to load
        await page.goto(url as unknown as string, { waitUntil: 'networkidle2' });

        // Capture a screenshot as a binary buffer
        const screenshotBuffer = await page.screenshot({ type: 'png' });

        // Set the response headers for an image and send the buffer
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(screenshotBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong with the screenshot process' });
    } finally {
        // Ensure the browser is closed even if an error occurs
        if (browser) {
            await browser.close();
        }
    }
}
