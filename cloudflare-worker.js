// route: https://boisesidemen.com/playlist/tunes.csv

const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vThlre8GwnVTDD1LMt2yfpqDFSnOMaLtYZT-oGc33sy9hpVs5QhA413wTnKXoYQ-JbwAg7Af2Z8rH_6/pub?gid=5&single=true&output=csv';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

let cached = '';
let lastFetchTime = null;

async function handleRequest(request) {
  if (cached && new Date() - lastFetchTime < 15*60*1000) {
    return new Response(cached);
  } else {
    const result = await fetch(dataUrl);
    if (result.ok) {
      cached = await result.text();
      lastFetchTime = new Date();
      return new Response(cached);
    } else {
      return new Promise(result);
    }
  }
}

