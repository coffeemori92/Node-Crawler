import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const crawler = async () => {
    try{
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1536, 864', '--disable-notifications']
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.106 Safari/537.36');
        await page.setViewport({
            width: 1536,
            height: 864
        });
        await page.goto('https://twitter.com', {
            waitUntil: 'networkidle0'
        });
        await page.type('input[name="session[username_or_email]"]', process.env.EMAIL);
        await page.type('input[name="session[password]"]', process.env.PASSWORD);
        await page.click('.css-1dbjc4n.r-eqz5dr.r-1777fci .css-901oao.css-16my406.r-1qd0xha.r-ad9z0x.r-bcqeeo.r-qvutc0');
        await page.waitForNavigation();
    }catch(error){
        console.log(error);
    }
};

crawler();