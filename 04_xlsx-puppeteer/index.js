import xlsx from 'xlsx';
import puppeteer from 'puppeteer';
import add_to_sheet from './add_to_sheet';
import path from 'path';

const workbook = xlsx.readFile(path.join(__dirname, 'xlsx/data.xlsx'));
const ws = workbook.Sheets.영화목록;
const records = xlsx.utils.sheet_to_json(ws);

const crawler = async () => {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        add_to_sheet(ws, 'C1', 's', '평점');
        for(const [i, e] of records.entries()){
            await page.goto(e.링크);
            const text = await page.evaluate(() => {
                const socre = document.querySelector('.score.score_left .star_score');
                return socre.textContent;
            });
            if(text){
                const newCell = `C${i + 2}`;
                console.log(e.제목, '평점', text.trim(), newCell);
                add_to_sheet(ws, newCell, 'n', text.trim());
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