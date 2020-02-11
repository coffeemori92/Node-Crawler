import puppeteer from 'puppeteer';
import db from './models';

const crawler = async () => {
    await db.sequelize.sync();
    try{
        let browser = await puppeteer.launch({
            headless: false,
            args: ['--disable-notifications']
        });
        let page = await browser.newPage();
        await page.goto('http://spys.one/free-proxy-list/KR/');
        const proxies = await page.evaluate(() => {
            const ips = Array.from(document.querySelectorAll('tr > td:first-of-type > .spy14')).map(e => {
                return e.textContent.replace(/document\.write\(.+\)/, '');
            });
            const types = Array.from(document.querySelectorAll('tr > td:nth-of-type(2)')).slice(5).map(e => {
                return e.textContent;
            });
            const latencies = Array.from(document.querySelectorAll('tr > td:nth-of-type(6) .spy1')).map(e => {
                return e.textContent;
            });
            return ips.map((e, i) => {
                return {
                    ip: e,
                    type: types[i],
                    latency: latencies[i]
                };
            });
        });
        // console.log(proxies);
        console.log(proxies.filter(e => e.type.startsWith('HTTP')).sort((a, b) => a.latency - b.latency));
        const filtered = proxies.filter(e => e.type.startsWith('HTTP')).sort((a, b) => a.latency - b.latency);
        await Promise.all(filtered.map(async (e) => {
            return db.Proxy.upsert({
                ip: e.ip,
                type: e.type,
                latency: e.latency
            });
        }));
        await page.close();
        await browser.close();
        const fatestProxy = await db.Proxy.findOne({
            order: [['latency', 'ASC']]
        });
        browser = await puppeteer.launch({
            headless: false,
            args: [
                '--disable-notifications',
                `--proxy-server=${fatestProxy.ip}`
            ]
        });
        // const context1 = await browser.createIncognitoBrowserContext();
        // const context2 = await browser.createIncognitoBrowserContext();
        // const context3 = await browser.createIncognitoBrowserContext();
        // console.log(await browser.browserContexts());
        // const page1 = await context1.newPage();
        // page = await browser.newPage();
        // await page.goto('https://naver.com');
        // await page.waitFor(1000);
        // await page.close();
        // await browser.close();
        await db.sequelize.close();
        console.log(filtered[0].ip);
    }catch(error){
        console.log(error);
    }
};

crawler();