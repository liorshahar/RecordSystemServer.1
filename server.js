const port = 3000;
const http = require("http").createServer();
const io = require("socket.io")(http);
const mqttRouter = require("./mqtt/connection").mqttRouter;
const mqttClient = require("./mqtt/connection").mqttClient;
const Record = require("./utils/recordObject");

let isStart = false;
let record;
//let globalStartTime = 0;

/* TODO */
/*
 * List of connected devices and routes
   Check if jump time < start Time
 */

//==========================MQTT==============================================================

// subscribe to startTime topic => get start message when the race start
mqttRouter.subscribe("swimTouch/startTime", function(topic, message) {
  if (isStart && message.toString() === "start") {
    console.log(
      "event from mqtt broker: swimTouch/startTime: " + message.toString()
    );
    //record.setStartTime(parseFloat(globalStartTime / 1000));
  }
});

// subscribe to jumpTime topic => receive a of jumping time from all jumpers
// message format => "route <number>"
mqttRouter.subscribe("swimTouch/jumpTime", function(topic, message) {
  let jump_time;
  if (isStart && record) {
    console.log(
      "event from mqtt broker: swimTouch/jumpTime: " + message.toString()
    );
    let splitMessage = message.toString().split(" ");
    let route = splitMessage[1];
    jump_time = parseFloat(splitMessage[3] / 1000);
    io.sockets.emit("jumpTime", { route: route, jumpTime: jump_time });
    console.log("jump time: route " + route + ": " + jump_time);
    record.setJumpTime(route, jump_time);
  }
});

// subscribe to WallSensor topic => receive a message for each touch on the wall
// message format => "route <number>"
mqttRouter.subscribe("swimTouch/WallSensor", function(topic, message) {
  let touch_time;
  if (isStart && record) {
    console.log(
      "event from mqtt broker: swimTouch/WallSensor: " + message.toString()
    );
    let splitMessage = message.toString().split(" ");
    let route = splitMessage[1];
    touch_time = parseFloat(splitMessage[3] / 1000);
    io.sockets.emit("WallSensor", { route: route, touchTime: touch_time });
    console.log("touch time: route  " + route + ": " + touch_time);
    record.setResults(route, touch_time);
  }
});

// subscribe to connected new device
mqttRouter.subscribe("swimTouch/nodeMCUConnected", function(topic, message) {
  console.log(
    "event from mqtt broker: swimTouch/nodeMCUConnected: " + message.toString()
  );
  let splitMessage = message.toString().split(" ");
  let sensor = splitMessage[1];
  io.sockets.emit("nodeMCUConnected", { sensor: sensor, status: "OK" });
});

//======================Socket.IO=========================================================

// Io scoket for incoming data from coach html page
io.on("connection", socket => {
  // Event name  //data
  console.log("coach connected to server");
  socket.emit("welcome", "Hello coach and Welcome to Socket.io Server");
  // When coach press start on html page
  socket.on("action", model => {
    console.log("event from socket.io: coach press -> " + model.action);
    if (model.action === "start" && !isStart) {
      isStart = true;
      record = new Record(model.exercise_id);
      mqttClient.publish("swimTouch/start", "start");
    } else if (model.action === "stop") {
      isStart = false;
      if (record) {
        io.sockets.emit("stop-swim", record);
        record = null;
      }
      globalStartTime = 0;
    } else {
      console.log("event from socket.io: already start");
    }
  });
  socket.on("system_status", model => {
    if (model.action === "testing sensors connection") {
      console.log("event from socket.io: testing sensors connection");
      mqttClient.publish(
        "swimTouch/connectedDevicesLog",
        "testing sensors",
        err => {
          if (err) {
            console.log("return value of mqtt test connection: " + err);
          }
        }
      );
    }
  });
  // When coach disconnected
  socket.on("disconnect", () => {
    console.log("event from socket.io: coach disconnect");
  });
});

http.listen(process.env.PORT || port, () => {
  console.log("Server is listenin on local host prot: " + port);
});

http.on("error", err => console.log(err));
