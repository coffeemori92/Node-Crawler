import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import db from './models';

dotenv.config();

const crawler = async () => {
    try{
        await db.sequelize.sync();
        const email = process.env.EMAIL;
        const password = process.env.PASSWORD;
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1536, 864', '--disable-notifications']
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1080,
            height: 864
        });
        await page.goto('https://facebook.com');
        await page.type('#email', email);
        await page.type('#pass', password);
        await page.waitFor(1000);
        await page.click('#loginbutton');
        await page.waitForResponse((res) => {
            return res.url().includes('login_attempt');
        });
        await page.waitForSelector('textarea');
        await page.click('textarea');
        await page.waitForSelector('._5rpb > div');
        console.log('찾음');
        await page.keyboard.type('쳇봇 동작중');
        await page.waitForSelector('._6c0o button');
        await page.waitFor(5000);
        await page.close();
        await browser.close();
    }catch(error){
        console.log(error);
    }
};

crawler();