import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const crawler = async () => {
    try{
        const browser = await puppeteer.launch({
            headless: false,
            // args: ['--window-size=1536, 864']
            args: ['--disable-notifications']
        });
        const page = await browser.newPage();
        // await page.setViewport({
        //     width: 1536,
        //     height: 864
        // });
        await page.goto('https://www.facebook.com/');
        // const id = process.env.EMAIL;
        // const password = process.env.PASSWORD;
        // await page.evaluate((id , password) => {
        //     document.querySelector('#email').value = id;
        //     document.querySelector('#pass').value = password;
        //     document.querySelector('#loginbutton').click(); 
        // }, id, password);
        await page.type('#email', process.env.EMAIL);
        await page.type('#pass', process.env.PASSWORD);
        await page.hover('#loginbutton');
        await page.waitFor(3000);
        await page.click('#loginbutton');
        await page.waitFor(20000);
        await page.click('#userNavigationLabel');
        await page.waitFor(20000);
        await page.click('li.navSubmenu:last-child');
        await page.close();
        await browser.close();
    }catch(error){
        console.log(error);
    }
};

crawler();