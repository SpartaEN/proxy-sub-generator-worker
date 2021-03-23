addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Use URL class to parse user brieflly
 * @param {Request} request
 */
function parseRequest(request) {
  const parsedURL = new URL(request.url);
  const parsedQS = parsedURL.searchParams;
  return {
    method: request.method,
    path: parsedURL.pathname,
    qs: {
      sub: parsedQS.get('sub')
    },
  }
}

/**
 * Normalize base64
 * @param {String} str 
 */
function normalizeBase64(str) {
  str = str.replaceAll('-', '+').replaceAll('_', '/');
  if (str.length % 2 == 0) {
    return str;
  }
  return str + '=';
}

/**
 * Process subscriptions
 * @param {Object} entries 
 * @param {Object} settings 
 * @param {Function} parser 
 */
function processEntries(entries, settings, parser) {
  const newEntry = [];
  for (const entry of entries) {
    let bl = false;
    let wl = false;
    const parsed = parser(entry);
    if (parsed == false)
      continue;
    if (settings.BL == '1') {
      for (const kw of settings.BLKW)
        if (parsed.includes(kw))
          bl = true;
    }
    if (settings.WL == '1') {
      for (const kw of settings.WLKW)
        if (parsed.includes(kw))
          wl = true;
    } else {
      wl = true;
    }
    if (bl == false && wl == true)
      newEntry.push(entry);
  }
  newEntry.push("");
  return newEntry;
}

/**
 * A parser that parses SSR URL
 * @param {String} entry 
 * @returns 
 */
function SSRParser(entry) {
  if (entry == "")
    return false;
  let base64Str = entry.slice(6);
  const parsed = atob(normalizeBase64(base64Str));
  const remark = parsed.match(/&remarks=([A-Za-z0-9\-\_\=]+)/)[1];
  if (remark == undefined)
    return false;
  return atob(normalizeBase64(remark));
}

/**
 * Respond with filtered subscription info
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    const BLKW = JSON.parse(await SSSUBS.get('BLKW', 'text')).map(x => atob(x));
    const WLKW = JSON.parse(await SSSUBS.get('WLKW', 'text')).map(x => atob(x));
    const BL = await SSSUBS.get('BL', 'text');
    const WL = await SSSUBS.get('WL', 'text');
    const KEY = await SSSUBS.get('KEY', 'text');
    const DST_URL = await SSSUBS.get('URL', 'text');
    let req = parseRequest(request);
    if (req.method != 'GET' || req.path != `/${KEY}`)
      return new Response('Unauthorized!', {
        status: 401,
        headers: {
          'content-type': 'text/plain'
        },
      });
    const data = await fetch(`${DST_URL}?sub=${req.qs.sub}`);
    if (data.status != 200)
      return new Response('Upstream failure', {
        status: 500,
        headers: {
          'content-type': 'text/plain'
        }
      });
    const body = await data.text();
    switch (req.qs.sub) {
      case '1':
        return new Response(btoa(processEntries(atob(body).split('\n'), {
          BL,
          WL,
          BLKW,
          WLKW
        }, SSRParser).join('\n')), {
          status: 200,
          headers: {
            'content-type': 'text/plain'
          }
        })
      default:
        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'text/plain'
          }
        })
    }
  } catch (e) {
    console.log(e);
    return new Response('Server failure', {
      status: 500,
      headers: {
        'content-type': 'text/plain'
      }
    });
  }
}