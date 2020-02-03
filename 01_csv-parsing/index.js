import parse from 'csv-parse/lib/sync';
import path from 'path';
import fs from 'fs';

const csv = fs.readFileSync(path.join(__dirname, 'csv/data.csv'));
const records = parse(csv.toString('utf-8'));
records.forEach((e, i) => {
    console.log(i, e);
});