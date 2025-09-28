const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const FILE = path.join(__dirname, 'data', 'posts.xlsx');
const JSON_FILE = path.join(__dirname, 'data', 'posts.json');

if (!fs.existsSync(path.join(__dirname,'data'))) fs.mkdirSync(path.join(__dirname,'data'));

// initialize if missing
function ensure(){
  if (!fs.existsSync(FILE)){
    const ws = XLSX.utils.json_to_sheet([]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'posts');
    XLSX.writeFile(wb, FILE);
  }
  if (!fs.existsSync(JSON_FILE)) fs.writeFileSync(JSON_FILE, JSON.stringify([],null,2));
}

function readAll(){
  ensure();
  try{
    const wb = XLSX.readFile(FILE);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, {defval:''});
    return data;
  }catch(e){ console.error('readAll error', e); return []; }
}

function appendRows(rows){
  ensure();
  try{
    // normalize rows to objects with id, platform, text, sentiment, engagement, themes(array), url, created_at
    const existing = readAll();
    const out = existing.slice();
    rows.forEach(r=>{
      const obj = {
        id: r.id || uuidv4(),
        platform: r.platform || 'Unknown',
        text: r.text || r.content || '',
        sentiment: r.sentiment || 'Neutral/Informational',
        engagement: Number(r.engagement||r.engagements||0) || 0,
        themes: Array.isArray(r.themes) ? r.themes : (r.themes? (r.themes.toString().split('|').map(s=>s.trim()).filter(Boolean)) : []),
        url: r.url || r.link || '',
        created_at: r.created_at || new Date().toISOString()
      };
      out.push(obj);
    });
    const ws = XLSX.utils.json_to_sheet(out);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'posts');
    XLSX.writeFile(wb, FILE);
    fs.writeFileSync(JSON_FILE, JSON.stringify(out,null,2));
    return rows.length;
  }catch(e){ console.error('appendRows error', e); return 0; }
}

module.exports = { readAll, appendRows };
