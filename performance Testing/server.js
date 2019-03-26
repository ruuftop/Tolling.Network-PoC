const http = require('http');
const os = require('os');
const express = require("express");
const app = express();
const fs = require('fs');
const shell = require('shelljs');

const port = process.env.PORT || 8080;

process.on('SIGINT', function() {
  console.log('shutting down...');
  process.exit(1);
});

function runScripts(req, res){
    shell.exec('./iteratecsv.sh',{shell: './bin/bash'});

    console.log("success");

    res.json({
         message: "completed!"
    });

    return;
}

function welcome(req, res){
  res.json({
       message: "Welcome to tolling.network"
  });
  return;
}

app.get("/", function(req, res){
    console.log("New Connection requested for Peer1 Org1!");
    welcome(req, res);
});


app.get("/runScripts", function(req, res){
    //res.writeHead(200);
    console.log("Request for Total Accounts");
    runScripts(req, res);
});

/* start server */
app.listen(port, () => {
    console.log(`Server started at port: ${port}`);
});
