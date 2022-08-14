const express = require('express')
const app = express()
const port = 3000

const { exec, execSync } = require('child_process');
//const panScript = require('./script00.bat');
app.get('/pannello-start', async (req, res) =>  {
  let { pws } = req.query;
  let pidServer;
  exec("pgrep ping", (exeption, stdout, sterr) => {
    pidServer = stdout;
    console.log("pidServer: ",stdout);
    //console.log("password: ",pws);
    //console.log(pidServer.length);
    if(pidServer.length === 0) {
      console.log("eseguendo");
      exec("sh start.sh");
    }
    else console.log("processo gia esiste!");
  })
  res.send('sup start');
})
app.get('/pannello-stop', (req, res) => {
// 1 verifichiamo se esiste != 0 -> 2. procediamo con lo stop
    let { pws } = req.query;
    let pidPing;
    exec("pgrep ping", (exeption, stdout, sterr) => {
      pidPing = stdout;

      if(pidPing.length === 0) console.log("processo non esiste!");
      else {
        console.log("terminando il processo");
        exec(`sh stop.sh ${pidPing}`);
      }
    })
    res.send('sup stop');
})
app.get('/pannello-restart', (req, res) => {
  res.send('Hello World!')
})
app.get('/pannello-kill', (req, res) => {
  // 1 verifichiamo se esiste != 0 -> 2. procediamo con lo stop
  let { pws } = req.query;
  let pidPing;
  exec("pgrep ping", (exeption, stdout, sterr) => {
    pidPing = stdout;

    if(pidPing.length === 0) console.log("processo non esiste!");
    else {
      console.log("uccidendo il processo");
      exec(`sh kill.sh ${pidPing}`);
    }
  })
  res.send('sup kill');
})
app.get('/pannello-update-log', (req, res) => {  
    res.send('Hello World!')
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})