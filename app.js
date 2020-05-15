const mongoose = require("mongoose");
const db =
  "mongodb+srv://storyofdavidadmin:2J5R4syhsooL9rwe@cluster0-ach4e.mongodb.net/test?retryWrites=true&w=majority";
const bodyParser = require("body-parser");
const axios = require("axios");

var express = require("express");
var app = express();
var serv = require("http").Server(app);
const accounts = require("./routes/accounts");
const Account = require("./models/account");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/client/index.html");
});
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => console.log(err));

app.use("/client", express.static(__dirname + "/client"));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 100000,
  })
);

app.use("/api/accounts", accounts);

// Parse application/json.
app.use(
  bodyParser.json({ limit: "50mb", extended: false, parameterLimit: 100000 })
);

serv.listen(2000);
console.log("Server started.");

var SOCKET_LIST = {};

var Entity = function () {
  var self = {
    x: 250,
    y: 250,
    spdX: 0,
    spdY: 0,
    id: "",
  };
  self.update = function () {
    self.updatePosition();
  };
  self.updatePosition = function () {
    self.x += self.spdX;
    self.y += self.spdY;
  };

  self.getDistance = function (pt) {
    return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
  };
  return self;
};

var Player = function (id) {
  var self = Entity();
  self.id = id;
  self.number = "" + Math.floor(10 * Math.random());
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.pressingAttack = false;
  self.attackMultiple = false;
  self.mouseAngle = 0;
  self.maxSpd = 10;

  var super_update = self.update;
  self.update = function () {
    self.updateSpd();
    super_update();

    if (self.pressingAttack) {
      if (self.attackMultiple) {
        for (var i = -3; i < 3; i++) self.shootBullet(self.mouseAngle);
      } else {
        self.shootBullet(self.mouseAngle);
      }
    }
  };

  self.shootBullet = function (angle) {
    var b = Bullet(self.id, angle);
    b.x = self.x;
    b.y = self.y;
  };

  self.updateSpd = function () {
    if (self.pressingRight) self.spdX = self.maxSpd;
    else if (self.pressingLeft) self.spdX = -self.maxSpd;
    else self.spdX = 0;

    if (self.pressingUp) self.spdY = -self.maxSpd;
    else if (self.pressingDown) self.spdY = self.maxSpd;
    else self.spdY = 0;
  };
  Player.list[id] = self;
  return self;
};
Player.list = {};
Player.onConnect = function (socket) {
  var player = Player(socket.id);
  socket.on("keyPress", function (data) {
    if (data.inputId === "left") player.pressingLeft = data.state;
    else if (data.inputId === "right") player.pressingRight = data.state;
    else if (data.inputId === "up") player.pressingUp = data.state;
    else if (data.inputId === "down") player.pressingDown = data.state;
    else if (data.inputId === "attack") player.pressingAttack = data.state;
    else if (data.inputId === "mouseAngle") player.mouseAngle = data.state;
    else if (data.inputId === "attackMultiple") {
      player.attackMultiple = data.state;
      player.pressingAttack = data.state;
    }
  });
};
Player.onDisconnect = function (socket) {
  delete Player.list[socket.id];
};
Player.update = function () {
  var pack = [];
  for (var i in Player.list) {
    var player = Player.list[i];
    player.update();
    pack.push({
      x: player.x,
      y: player.y,
      number: player.number,
    });
  }
  return pack;
};

var Bullet = function (parent, angle) {
  var self = Entity();
  self.id = Math.random();
  self.spdX = Math.cos((angle / 180) * Math.PI) * 10;
  self.spdY = Math.sin((angle / 180) * Math.PI) * 10;
  self.parent = parent;
  self.timer = 0;
  self.toRemove = false;
  var super_update = self.update;
  self.update = function () {
    if (self.timer++ > 100) self.toRemove = true;
    super_update();

    for (var i in Player.list) {
      var p = Player.list[i];
      if (self.getDistance(p) < 32 && self.parent !== p.id) {
        // handle collsion. ex: hp --
        self.toRemove = true;
      }
    }
  };
  Bullet.list[self.id] = self;
  return self;
};
Bullet.list = {};

Bullet.update = function () {
  // if (Math.random() < 0.1) {
  //   Bullet(Math.random() * 360);
  // }

  var pack = [];
  for (var i in Bullet.list) {
    var bullet = Bullet.list[i];
    bullet.update();
    if (bullet.toRemove) delete Bullet.list[i];
    pack.push({
      x: bullet.x,
      y: bullet.y,
    });
  }
  return pack;
};

var DEBUG = true;
var USERS = {
  //username:password
  bob: "asd",
  bob2: "bob",
  bob3: "ttt",
};

// var isValidPassword = function (data, cb) {
//   db.account.find(
//     { username: data.username, password: data.password },
//     function (err, res) {
//       if (res.length > 0) cb(true);
//       else cb(false);
//     }
//   );
// };
// var isUsernameTaken = function (data, cb) {
//   db.account.find({ username: data.username }, function (err, res) {
//     if (res.length > 0) cb(true);
//     else cb(false);
//   });
// };
// var addUser = function (data, cb) {
//   db.account.insert(
//     { username: data.username, password: data.password },
//     function (err) {
//       cb();
//     }
//   );
// };
// modifeid
var isValidPassword = function (data, cb) {
  // db.account.find(
  //   { username: data.username, password: data.password },
  //   function (err, res) {
  //     if (res.length > 0) cb(true);
  //     else cb(false);
  //   }
  // );
};
var isUsernameTaken =  async function (data, cb) {
  let foundaccount = await Account.findOne({ username: data.username }
    // , function (err, res) {
    // if (res.length > 0) cb(true);
    // else cb(false);
    // }
  );
  if (foundaccount) {
    cb(true)
  } else {
    cb(false)
  }
};
var addUser = function (data, cb) {
 const newUser = new Account({
   username: data.username,
   password: data.password,
 });
 newUser
   .save()
  //  .then((res) => {
  //    return "success";
  //  })
   .then(function (err) {
     cb();
   });
};

var io = require("socket.io")(serv, {});
io.sockets.on("connection", function (socket) {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  socket.on("signIn", function (data) {
    isValidPassword(data, function (res) {
      if (res) {
        Player.onConnect(socket);
        socket.emit("signInResponse", { success: true });
      } else {
        socket.emit("signInResponse", { success: false });
      }
    });
  });

  socket.on("signUp", function (data) {
    isUsernameTaken(data, function (res) {
      if (res) {
        socket.emit("signUpResponse", { success: false });
      } else {
        addUser(data, function () {
          socket.emit("signUpResponse", { success: true });
        });
      }
    });
  });

  socket.on("disconnect", function () {
    delete SOCKET_LIST[socket.id];
    Player.onDisconnect(socket);
  });
  socket.on("sendMsgToServer", function (data) {
    var playerName = ("" + socket.id).slice(2, 7);
    for (var i in SOCKET_LIST) {
      SOCKET_LIST[i].emit("addToChat", playerName + ": " + data);
    }
  });
  //remove under code before deloying
  socket.on("evalServer", function (data) {
    if (!DEBUG) return;
    var res = eval(data);
    socket.emit("evalAnswer", res);
  });
});

setInterval(function () {
  var pack = {
    player: Player.update(),
    bullet: Bullet.update(),
  };

  for (var i in SOCKET_LIST) {
    var socket = SOCKET_LIST[i];
    socket.emit("newPositions", pack);
  }
}, 1000 / 25);
