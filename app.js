const express = require("express");
const app = express();
const serv = require("http").Server(app);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + `/client`));

serv.listen(2000);
