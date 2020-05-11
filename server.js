const Twitter = require('twitter-lite')
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, 'build')))

app.use(function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.listen(9000, () => {
  console.log('Listening on http://localhost:9000')
})
