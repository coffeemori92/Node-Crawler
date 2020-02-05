import parse from 'csv-parse/lib/sync';
import csvStringify from 'csv-stringify/lib/sync';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const csv = fs.readFileSync(path.join(__dirname, 'csv/data.csv'));
const records = parse(csv.toString('utf-8'));

const crawler = async () => {
    const result = [];
    const browser = await puppeteer.launch({headless: process.env.NODE_ENV === 'production'});
    await Promise.all(records.map(async (e, i) => {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36');
        await page.goto(e[1]);
        // const 태그핸들러 = await page.$(선택자);
        // const scoreEl = await page.$('.score.score_left .star_score');
        // if(scoreEl){
        //     const text = await page.evaluate(tag => tag.textContent.trim(), scoreEl);
        //     console.log(e[0], '평점', text);
        //     result[i] = [e[0], e[1], text];
        // }
        const text = await page.evaluate(() => {
            const score = document.querySelector('.score.score_left .star_score');
            if(score){
                return score.textContent.trim();
            }
        });
        if(text) {
            console.log(e[0], '평점', text);
            result[i] = [e[0], e[1], text];
        }
        await page.waitFor(3000);
        await page.close();
    }));
    // const [page, page2, page3] = await Promise.all([
    //     browser.newPage(),
    //     browser.newPage(),
    //     browser.newPage()
    // ]);
    // await Promise.all([
    //     page.goto('https://google.com'),
    //     page2.goto('https://naver.com'),
    //     page3.goto('https://daum.net')
    // ]);
    // console.log('working');
    // await Promise.all([
    //    page.waitFor(3000),
    //    page2.waitFor(1000),
    //    page3.waitFor(2000) 
    // ]);
    // await page.close();
    // await page2.close();
    // await page3.close();
    await browser.close();
    const str = csvStringify(result);
    fs.writeFileSync(path.join(__dirname, 'csv/result.csv'), str);
};

crawler();