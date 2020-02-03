import xlsx from 'xlsx';
import path from 'path';

const workbook = xlsx.readFile(path.join(__dirname, 'xlsx/data.xlsx'));
// console.log(Object.keys(workbook.Sheets));
const ws =workbook.Sheets.영화목록;
// console.log(ws);

const records = xlsx.utils.sheet_to_json(ws);
// console.log(records);

for (const [i, e] of records.entries()){
    console.log(i, e);
}