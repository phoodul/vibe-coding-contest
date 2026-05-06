import * as XLSX from 'xlsx';
import { resolve } from 'node:path';

const path = resolve(process.cwd(), 'user_docs/suneung_science/answers.xlsx');
const wb = XLSX.readFile(path);
console.log('Sheet names:', wb.SheetNames);
for (const name of wb.SheetNames) {
  const sheet = wb.Sheets[name];
  console.log('\n=== Sheet:', name, '===');
  console.log('Range:', sheet['!ref']);

  const arr = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false });
  console.log('First 8 rows:');
  for (let i = 0; i < Math.min(8, arr.length); i++) {
    console.log(`  [${i}]`, JSON.stringify(arr[i]));
  }
  console.log(`Total rows: ${arr.length}`);
}
