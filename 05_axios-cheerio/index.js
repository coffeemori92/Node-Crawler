import xlsx from 'xlsx';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';

const workbook = xlsx.readFile(path.join(__dirname, 'xlsx/data.xlsx'));
// console.log(Object.keys(workbook.Sheets));
const ws =workbook.Sheets.영화목록;
// console.log(ws);
const records = xlsx.utils.sheet_to_json(ws);
// console.log(records);

for (const [i, e] of records.entries()){
//c    console.log(i, e);
}

const crawler = async () => {
    await Promise.all(records.map(async e => {
        const response = await axios.get(e.링크);
        if(response.status === 200){
            const html = response.data;
//            console.log(html);
            const $ = cheerio.load(html);
            const text = $('.score.score_left .star_score').text().trim();
            console.log(e.제목, '평점', text);
        }
    }));
};

const crawler2 = async () => {
    for(const [i, e] of records.entries()){
        const response = await axios.get(e.링크);
        if(response.status === 200){
            const html = response.data;
            const $ = cheerio.load(html);
            const text = $('.score.score_left .star_score').text().trim();
            console.log(e.제목, '평점', text);
        }
    }
};

crawler2();