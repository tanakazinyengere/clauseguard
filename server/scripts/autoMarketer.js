const https = require('https');
const fs = require('fs');

function getReddit(sub) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.reddit.com',
      path: `/r/${sub}/new.json?limit=10`,
      method: 'GET',
      headers: { 'User-Agent': 'ClauseGuardBot/1.1' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

async function findLeads() {
  console.log('🚀 Starting Marketing Blitz...');
  const subreddits = ['freelance', 'smallbusiness', 'legaladvice', 'Agency'];
  let allLeads = [];

  for (const sub of subreddits) {
    console.log(`🔍 Searching r/${sub}...`);
    try {
      const data = await getReddit(sub);
      const posts = data.data.children;
      posts.forEach(post => {
        const title = post.data.title.toLowerCase();
        const text = post.data.selftext.toLowerCase();
        
        if (title.includes('contract') || title.includes('clause') || text.includes('signed') || text.includes('payment')) {
          allLeads.push({
            platform: 'Reddit',
            subreddit: sub,
            title: post.data.title,
            author: post.data.author,
            url: 'https://reddit.com' + post.data.permalink
          });
        }
      });
    } catch (err) {
      console.error(`Failed to search r/${sub}: `, err.message);
    }
  }

  fs.writeFileSync('/home/agent-lead/clauseguard/LEADS.json', JSON.stringify(allLeads, null, 2));
  console.log(`✅ Found ${allLeads.length} hot leads. Saved to LEADS.json`);
}

findLeads();
