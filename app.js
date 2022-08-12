const express = require('express')
const app = express()
const port = 3000

const { exec } = require('child_process');
//const panScript = require('./script00.bat');
app.get('/pannello-start', (req, res) => {
  let { pws } = req.query;
  exec(".\\script00.bat > nomeAcaso.txt");
  console.log(pws);
  res.send('Hello World!')
})
app.get('/pannello-stop', (req, res) => {
  res.send('Hello World!')
})
app.get('/pannello-restart', (req, res) => {
  res.send('Hello World!')
})
app.get('/pannello-kill', (req, res) => {
  res.send('Hello World!')
})
app.get('/pannello-update-log', (req, res) => {    
    res.send('Hello World!')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})