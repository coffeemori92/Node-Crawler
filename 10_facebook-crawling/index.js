import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import db from './models';

dotenv.config();

const crawler = async () => {
    try{
        await db.sequelize.sync();
        const email = process.env.EMAIL;
        const password = process.env.PASSWORD;
        const broswer = await puppeteer.launch({
            headless: false, 
            args: ['--window-size=1536, 864', '--disable-notifications']
        });
        const page = await broswer.newPage();
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
        let result = [];
        while(result.length < 10){
            await page.waitForSelector('[id^=hyperfeed_story_id]:first-child');
            const newPost = await page.evaluate(() => {
                window.scrollTo(0, 0);
                const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
                const name = firstFeed.querySelector('.fwb.fcg') && firstFeed.querySelector('.fwb.fcg').textContent;
                const content = firstFeed.querySelector('.userContent') && firstFeed.querySelector('.userContent').textContent;
                const img = firstFeed.querySelector('[class=mtm] img') && firstFeed.querySelector('[class=mtm] img').src;
                const postId = firstFeed.id.split('_').slice(-1)[0];
                return {
                    name, img, content, postId
                };
            });
            const exist = await db.Facebook.findOne({
                where: {
                    postId: newPost.postId
                }
            });
            if(!exist && newPost.name){
                result.push(newPost);
            }
            console.log(newPost);
            await page.waitFor(1000);
            await page.evaluate(() => {
                const firstFeed = document.querySelector('[id^=hyperfeed_story_id]:first-child');
                firstFeed.parentNode.removeChild(firstFeed);
                window.scrollBy(0, 200);
            });
            await page.waitFor(1000);
        }
        await Promise.all(result.map(r => {
            return db.Facebook.create({
               postId: r.postId,
               media: r.img,
               writer: r.name,
               content: r.content
            });
        }));
        console.log(result.length);
        await page.waitFor(1000);
        await page.click('#userNavigationLabel');
        await page.waitFor(20000);
        await page.click('li.navSubmenu:last-child');
        await page.close();
        await broswer.close();
    }catch(error){
        console.log(error);
    }
};

crawler();