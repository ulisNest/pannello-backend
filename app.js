require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = 3000;
//fetch API & body parser API
const fetch = require("node-fetch");
//Eseguire comandi shell
const { exec, spawn } = require('child_process');
//Connessione persistente con websockets
const io = require("socket.io")(server);

app.use(express.static(`${__dirname}/client/dist/assets`));
app.use((express.urlencoded({})));
app.use(express.json());
//TODO 
  //se stringa vuota restituisci pagbase
  // se stringa piena controlla pws
  // se giusta res-> pannello, res-> errorePass altrimenti

app.post('/', (req, res) => {

  let {pws} = req.body;
  console.log("richiesta - psw: ", pws );
  console.log(process.env.PASSWORD);
  if (pws === "") res.sendFile(`${__dirname}/serverPublic/auth.html`);
  if (pws === process.env.PASSWORD){
   res.sendFile(`${__dirname}/client/dist/index.html`);
  }
  if (pws != process.env.PASSWORD) res.sendFile(`${__dirname}/serverPublic/errorePass.html`);
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/serverPublic/auth.html`);
});


app.get('/pannello-start', (req, res) => {
  let { pws } = req.query;
  if(pws != process.env.PASSWORD) res.sendFile(`${__dirname}/serverPublic/errorePass.html`);
  
  let pidServer;
  let esitoRichiesta;
  //Controls whether the process already exists
  exec("pgrep ping", (exeption, stdout, sterr) => {
    pidServer = stdout;
    console.log("pidServer: ", stdout);
    if (pidServer.length === 0) {
      console.log("non esiste, creando Processo");

      let child = spawn("sh",['start.sh']);
      child.stdout.setEncoding('utf-8');
      child.stdout.on('data', (chunk) => {
       // console.log(chunk);
        io.emit('logMsg', {"msg":chunk});
      });
      
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
  let { pws } = req.query;
  if(pws != process.env.PASSWORD) res.sendFile(`${__dirname}/serverPublic/errorePass.html`);
  
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
  let { pws } = req.query;
  if(pws != process.env.PASSWORD) res.sendFile(`${__dirname}/serverPublic/errorePass.html`);

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
  if(pws != process.env.PASSWORD) res.sendFile(`${__dirname}/serverPublic/errorePass.html`);

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
      console.log("uccidendo il processo");
      exec(`sh kill.sh ${pidPing}`);
      esitoRichiesta = true;
    }
    res.json({ "esito": esitoRichiesta });
  });
});
//GESTIONE SOCKET ------------ GESTION SERVER

io.on("connection", socket => {
  console.log('a user connected:');
  console.log(socket.id);
});

server.listen(port, () => {
  console.log(`app listening on port ${port}`)
});