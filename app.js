const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 3000;
//fetch API
const fetch = require("node-fetch");
//Eseguire comandi shell
const { exec, execSync } = require('child_process');
const { readFile } = require('fs');

//Connessione persistente con websockets
const io = require("socket.io")(server);
app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});
app.get('/pannello-start',(req, res) => {
  let { pws } = req.query;
  let pidServer;
  let esitoRichiesta;
  const test = exec("pgrep ping", (exeption, stdout, sterr) => {
    pidServer = stdout;
    console.log("pidServer: ", stdout);
    
    if (pidServer.length === 0) {
      console.log("nn esiste, creando Processo");
      exec("sh start.sh");
      esitoRichiesta = true;
    }
    else {
      console.log("processo gia esiste!");
      esitoRichiesta = false;
    }
    res.json({ "esito": esitoRichiesta });
  });
});
app.get('/pannello-stop', (req, res) => {
  // 1 verifichiamo se esiste != 0 -> 2. procediamo con lo stop
  let { pws } = req.query;
  let pidPing;
  //esito da restituire in formato json e.e
  let esitoRichiesta;
  exec("pgrep ping", (exeption, stdout, sterr) => {
    pidPing = stdout;

    if (pidPing.length === 0) {
      console.log("processo non esiste!");
      esitoRichiesta = false;
    }
    else {
      console.log("terminando il processo");
      exec(`sh stop.sh ${pidPing}`);
      esitoRichiesta = true;
    }

    res.json({ "esito": esitoRichiesta });
  });
});
app.get('/pannello-restart', (req, res) => {

  console.log("before stop: ",
    exec("pgrep ping", (exeption, stdout, sterr) => console.log(stdout.pid))
  );
  let primaReq, secondaReq;
  fetch('http://localhost:3000/pannello-stop')
    .then(res => res.json())
    .then(data => { primaReq = data.esito; console.log(data.esito) })
    .then(
      () =>
        //RICHIESTA ANNIDATA
        fetch('http://localhost:3000/pannello-start')
          .then(res => res.json())
          .then(data => { secondaReq = data.esito; console.log("pnSTAR: ", data.esito) })
          .catch(err => console.log(err))
    ).then(function () {
      //stampiamo il ping per vedere se è stato stoppato
      console.log("after 2 call: ", exec("pgrep ping", (exeption, stdout, sterr) => console.log(stdout.pid)));
      res.json({ "esito-stop": primaReq, "esito-start": secondaReq });
    })
    .catch(err => console.log(err))
});
app.get('/pannello-kill', (req, res) => {
  // 1 verifichiamo se esiste != 0 -> 2. procediamo con lo stop
  let { pws } = req.query;
  let pidPing;
  //esito da restituire in formato json e.e
  let esitoRichiesta;
  exec("pgrep ping", (exeption, stdout, sterr) => {
    pidPing = stdout;

    if (pidPing.length === 0) {
      console.log("processo non esiste!");
      esitoRichiesta = "MissionFailed";
    }
    else {
      console.log("uccidendo il processo");
      exec(`sh kill.sh ${pidPing}`);
      esitoRichiesta = "Respect+";
    }
    res.json({ "esito": esitoRichiesta });
  });
});
//GESTIONE SOCKET ---------------------
let count = 0;
io.on("connection", socket => {
  socket.on('chat-msg', (msg) => {
    console.log("from the server - helo");
    io.emit('chat-msg', {"msg":"Respect+"+count++});
  });
  console.log('a user connected:');
  console.log(socket.id);
});

app.get('/pannello-update-log', (req, res) => {
  console.log("inside pannello");
});
server.listen(port, () => {
  console.log(`app listening on port ${port}`)
});