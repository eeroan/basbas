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
const urlForDate = `${baseUrl}/availabilities/t7c5hxB/589/2?locale=fi&date=`
console.time(startMsg)
http.createServer((req, res) => {
  const uri = url.parse(req.url).pathname
  const isGet = req.method === 'GET'
  if (isGet && uri === '/') {
    writePage(res)
  }

  else if (isGet && uri.startsWith('/public'))
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
const writePage = res => {
  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
  res.write('<!DOCTYPE html>')
  res.write(head)
  const dates = [...Array(33).keys()].map(delta => dateUtil.addDay(dateUtil.toMidnight(new Date()), delta)).filter(dateUtil.isOpen)
  combineArray(dates, (dayAvailabilities) => {
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
  })
}

const notFound = res => {
  res.writeHead(404)
  res.end()
}
const dateToUrl = date => {
  return `${urlForDate}${dateUtil.formatReverseIsoDate(date)}`
}
const combineArray = (dates, cb) => {
  const results = []
  dates.forEach((date, index) => getCached(dateToUrl(date), body => {
    results[index] = {
      date,
      body
    }
    if (Object.keys(results).length === dates.length) cb(results)
  }))
}

const responses = {}
const getCached = (url, cb) => {
  if (url in responses) cb(responses[url])
  else get(url, data => {
    responses[url] = data
    cb(data)
  })
}
const get = (uri, cb) => {
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
    res.on('end', () => cb(chunks.join('')))
  }
  if (uri.startsWith('https')) https.get(options, cbFunc)
  else http.get(options, cbFunc)
}

const head = `<html>
<head>
<!-- Server started: ${startedTime}-->
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
