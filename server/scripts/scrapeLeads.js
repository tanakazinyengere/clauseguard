const axios = require('axios');

async function scrapeReddit() {
  try {
    const response = await axios.get('https://www.reddit.com/r/freelance/search.json?q=contract+help&sort=new&restrict_sr=on&limit=5');
    const leads = response.data.data.children.map(child => ({
      title: child.data.title,
      url: 'https://reddit.com' + child.data.permalink,
      author: child.data.author
    }));
    
    console.log('--- POTENTIAL LEADS FOUND ---');
    leads.forEach(lead => {
      console.log(`TITLE: ${lead.title}`);
      console.log(`URL: ${lead.url}`);
      console.log(`AUTHOR: ${lead.author}`);
      console.log('---------------------------');
    });
  } catch (error) {
    console.error('Scrape failed:', error.message);
  }
}

scrapeReddit();
