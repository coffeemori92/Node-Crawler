import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import ytdl from 'ytdl-core';
import fs from 'fs';
import db from './models';

dotenv.config();

const crawler = async () => {
    try{
        // const browserFetcher = puppeteer.createBrowserFetcher();
        // const revisionInfo = await browserFetcher.download('741767');
        const browser = await puppeteer.launch({
            headless: false,
            // executablePath: revisionInfo.executablePath,
            args: ['--window-size=1536, 864', '--disable-notifications']
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1536,
            height: 864
        });
        await page.goto('https://youtube.com', {
            waitUntil: 'networkidle0'
        });
        await page.waitForSelector('#buttons ytd-button-renderer:last-child a');
        await page.click('#buttons ytd-button-renderer:last-child a');
        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        });
        await page.waitForSelector('#identifierId');
        await page.type('#identifierId', process.env.EMAIL);
        await page.waitForSelector('#identifierNext');
        await page.click('#identifierNext');
        await page.waitForNavigation({
            waitUntil: 'networkidle2'
        });
        await page.waitForSelector('input[aria-label="비밀번호 입력"]');
        await page.evaluate(password => {
            document.querySelector('input[aria-label="비밀번호 입력"]').value = password;
        }, process.env.PASSWORD);
        // await page.type('input[aria-label="비밀번호 입력"]', process.env.PASSWORD);
        await page.waitForSelector('#passwordNext');
        await page.waitFor(3000);
        await page.click('#passwordNext');

        await page.goto('https://www.youtube.com/feed/trendig', {
            waitUntil: 'networkidle0'
        });
        await page.waitForSelector('ytd-video-renderer');
        await page.click('ytd-video-renderer');

        const url = await page.url();
        const title = await page.title();

        const info = await ytdl.getInfo(url);

        ytdl(url).pipe(fs.createWriteStream(`${info.title.replace(/\u20A9/g, '')}.mp4`));

    }catch(error){
        console.log(error);
    }
};

crawler();