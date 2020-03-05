const http = require('http')
const https = require('https')
const url = require('url')
const fs = require('fs')
const path = require('path')
const dateUtil = require('./dateUtil')
const port = process.env.PORT || 5000
const startMsg = '\033[33mServer started in \033[36mhttp://localhost:' + port + ', \033[33mtook \033[39m'
const startedTime = new Date().toString()
const baseUrl = 'https://v2.tableonline.fi/instabook/bookings'
const urlForDate = persons => `${baseUrl}/availabilities/t7c5hxB/589/${persons}?locale=fi&date=`
console.time(startMsg)
http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  const uri = parsedUrl.pathname
  const isGet = req.method === 'GET'
  const persons = parsedUrl.query && parsedUrl.query.persons ? Number(parsedUrl.query.persons) : 2
  if (isGet && uri === '/' && persons >= 1) {
    writePage(res, persons)
  } else if (isGet && uri.startsWith('/public'))
    serveStatic(uri, res)
  else
    notFound(res)
}).listen(port, () => console.timeEnd(startMsg))

const serveStatic = (uri, res) => {
  const fsPath = __dirname + path.normalize(uri)
  res.writeHead(200)
  const fileStream = fs.createReadStream(fsPath)
  fileStream.pipe(res)
  fileStream.on('error', () => {
    res.writeHead(404)
    res.end()
  })
}
const writePage = async (res, persons) => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.write('<!DOCTYPE html>')
  res.write(head)
  const dates = [...Array(33).keys()].map(delta => dateUtil.addDay(dateUtil.toMidnight(new Date()), delta)).filter(dateUtil.isOpen)
  const dayAvailabilities = await combineArray(dates, persons)
  res.end(
    dayAvailabilities.map(({date, body}) => {
      const markup = body.match(/\$\("#availabilities"\)\.html\('([\s\S]*)'\);/)[1]
        .replace(/\\n/g, '')
        .replace(/\\/g, "")
      return `<article>
<h1>${dateUtil.formatDate(date)}</h1>
      ${markup}
      </article>`
    }).join('\n') + `<article><a href="https://github.com/eeroan/basbas" target="_blank">Lähdekoodi</a></article></body></html>`)
}

const notFound = res => {
  res.writeHead(404)
  res.end()
}
const dateToUrl = (date, persons) => {
  return `${urlForDate(persons)}${dateUtil.formatReverseIsoDate(date)}`
}
const combineArray = async (dates, persons) => Promise.all(dates.map(date => dateAndBody(date, persons)))
const dateAndBody = async (date, persons) => {
  const body = await getCached(dateToUrl(date, persons))
  return {date, body}
}
const responses = {}
const getCached = async (url) => {
  if (url in responses)
    return responses[url]
  const data = await get(url)
  responses[url] = data
  return data
}

const get = async (uri) => new Promise(resolve => {
  let parsed = url.parse(uri)
  const options = {
    hostname: parsed.hostname,
    path: parsed.path,
    query: parsed.query,
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36',
      Accept: '*/*'
    }
  }
  const cbFunc = res => {
    const chunks = []
    res.setEncoding('utf8')
    res.on('data', chunk => chunks.push(chunk))
    res.on('end', () => resolve(chunks.join('')))
  }
  if (uri.startsWith('https')) https.get(options, cbFunc)
  else http.get(options, cbFunc)
})

const head = `<html>
<head>
<!-- Server started: ${startedTime}-->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-4154602-10"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'UA-4154602-10');
</script>
<title>Basbas</title>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="apple-touch-icon" href="menu.png"/>
<link id="page_favicon" href="/favicon.ico" rel="icon" type="image/x-icon"/>
<link rel="stylesheet" type="text/css" href="public/styles.css"/>
</head>
<body>
<article>
<header>
<h1>Basbas pöytä&shy;varaukset</h1>
<p class="subtitle"><a href="http://basbas.fi/bistro#reservation" target="_blank">Varaa täältä</a></p>
</header>
</article>`
