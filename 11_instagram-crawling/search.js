import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import db from './models';

dotenv.config();

const crawler = async () => {
    try{
        await db.sequelize.sync();
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1536, 864', '--disable-notifications'],
            userDataDir: 'C:\Users\me\AppData\Local\Google\Chrome\User Data' // 로그인된 정보 저장
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1080,
            height: 864
        });
        await page.goto('https://instagram.com');
        if(await page.$('a[href="/coffeemori/"]')){
            console.log('이미 로그인 되어 있습니다.');
        }else{
            await page.waitForSelector('button.L3NKy'); // facebook으로 로그인 버튼
            await page.click('button.L3NKy');
            await page.waitForNavigation(); // facebook 로그인으로 넘어가는 것을 기다림
            await page.waitForSelector('#email');
            await page.type('#email', process.env.EMAIL);
            await page.type('#pass', process.env.PASSWORD);
            await page.waitForSelector('#loginbutton');
            await page.click('#loginbutton');
            await page.waitForNavigation();
            console.log('로그인을 완료했습니다.');
        }
        await page.waitForSelector('input.XTCLo');
        await page.click('input.XTCLo');
        await page.keyboard.type('맛집');
        await page.waitForSelector('.drKGC');
        const href = await page.evaluate(() => {
            return document.querySelector('.drKGC a:first-child').href;
        });
        await page.goto(href);
    }catch(error){
        console.log(error);
    }
};

crawler();