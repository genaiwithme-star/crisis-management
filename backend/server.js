const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const storage = require('./storage');
const XLSX = require('xlsx');

const app = express();
app.use(cors());
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({extended:true}));

app.post('/api/posts', (req,res)=>{
  const data = req.body;
  const rows = Array.isArray(data) ? data : [data];
  const added = storage.appendRows(rows);
  res.json({ok:true, added});
});

app.get('/api/posts', (req,res)=>{
  const all = storage.readAll();
  res.json(all.reverse()); // newest first
});

app.get('/api/report', (req,res)=>{
  const all = storage.readAll();
  const total = all.length;
  const counts = {'Strongly Positive':0,'Positive':0,'Neutral/Informational':0,'Negative':0,'Strongly Negative':0};
  all.forEach(p=>{ counts[p.sentiment] = (counts[p.sentiment]||0)+1; });
  res.json({total, counts});
});

app.get('/api/download-excel', (req,res)=>{
  const file = path.join(__dirname,'data','posts.xlsx');
  if (!fs.existsSync(file)) return res.status(404).send('No excel');
  res.download(file, 'posts.xlsx');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log('CrisisWatch backend running on port', PORT));
