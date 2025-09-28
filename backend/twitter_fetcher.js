const fetch = require('node-fetch');
const BACKEND = process.env.BACKEND || 'http://localhost:8080';
const BEARER = process.env.TWITTER_BEARER_TOKEN;
const KEYWORDS = process.env.KEYWORDS || 'CompanyXYZ OR @CompanyXYZ OR #CompanyXYZ';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL || 30000);

if (!BEARER) { console.error('TWITTER_BEARER_TOKEN not set. Exiting.'); process.exit(1); }

let since_id = null;

async function poll(){
  try{
    let url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(KEYWORDS)}&tweet.fields=public_metrics,created_at,author_id&expansions=author_id&user.fields=username,public_metrics&max_results=50`;
    if (since_id) url += `&since_id=${since_id}`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${BEARER}` } });
    if (!resp.ok) { console.error('Twitter API error', await resp.text()); return; }
    const data = await resp.json();
    if (!data || !data.data) return;
    const users = (data.includes && data.includes.users) ? data.includes.users.reduce((acc,u)=>{ acc[u.id]=u; return acc; },{}) : {};
    const posts = data.data.map(t=>({
      id: t.id,
      platform: 'Twitter',
      text: t.text,
      created_at: t.created_at,
      engagement: t.public_metrics ? (t.public_metrics.retweet_count + t.public_metrics.reply_count + t.public_metrics.like_count + t.public_metrics.quote_count) : 0,
      author_followers: users[t.author_id] ? (users[t.author_id].public_metrics ? users[t.author_id].public_metrics.followers_count : 0) : 0,
      url: `https://twitter.com/i/web/status/${t.id}`,
      sentiment: 'Neutral/Informational',
      themes: []
    }));
    if (posts.length){
      await fetch(BACKEND + '/api/posts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(posts) });
      since_id = posts[0].id;
      console.log('Fetched and forwarded', posts.length, 'tweets');
    }
  }catch(e){ console.error('poll error', e); }
}

setInterval(poll, POLL_INTERVAL);
poll();
