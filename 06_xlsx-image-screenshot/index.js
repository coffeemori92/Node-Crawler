import xlsx from 'xlsx';
import puppeteer from 'puppeteer';
import add_to_sheet from './add_to_sheet';
import fs from 'fs';
import axios from 'axios';
import path from 'path';

const workbook = xlsx.readFile(path.join(__dirname, 'xlsx/data.xlsx'));
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

fs.readdir(path.join(__dirname, 'screenshot'), err => {
    if(err){
        console.log('screenshot 폴더를 생성합니다.');
        fs.mkdirSync(path.join(__dirname, 'screenshot'));
    }
});

fs.readdir(path.join(__dirname, 'poster'), err => {
    if(err){
        console.log('poster 폴더를 생성합니다.');
        fs.mkdirSync(path.join(__dirname, 'poster'));
    }
});

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--window-size=1536, 864']
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1536,
            height: 864
        });
        add_to_sheet(ws, 'C1', 's', '평점');
        for(const [i, e] of records.entries()){
            await page.goto(e.링크);
            const result = await page.evaluate(() => {
                const scoreEl = document.querySelector('.score.score_left .star_score');
                let score = '';
                if(scoreEl){
                    score = scoreEl.textContent;
                }
                const imageEl = document.querySelector('.poster img');
                let image = '';
                if(imageEl){
                    image = imageEl.src;
                }
                return {
                    score, image
                };
            });
            if(result.score){
                const newCell = `C${i + 2}`;
                console.log(e.제목, '평점', result.score.trim(), newCell);
                add_to_sheet(ws, newCell, 'n', result.score.trim());
            }
            if(result.image){
                await page.screenshot({
                    path: path.join(__dirname, `screenshot/${e.제목}.png`),
                    fullPage: true
                });
                const imgResult = await axios.get(result.image.replace(/\?.*$/, ''), {
                    responseType: 'arraybuffer'
                });
                fs.writeFileSync(path.join(__dirname, `poster/${e.제목}.jpg`), imgResult.data);
            }
            await page.waitFor(1000);
        }
        await page.close();
        await browser.close();
        xlsx.writeFile(workbook, path.join(__dirname, 'xlsx/result.xlsx'));
    }catch(error){
        console.log(error);
    }
};

crawler();