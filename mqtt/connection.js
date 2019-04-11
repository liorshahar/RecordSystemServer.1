/* 
  Connect to MQTT broker
*/
const mqtt = require("mqtt");
const mqttrouter = require("mqtt-router");

// Connection deatils
var options = {
  port: 17022,
  host: "mqtt://m24.cloudmqtt.com",
  clientId:
    "mqttjs_" +
    Math.random()
      .toString(16)
      .substr(2, 8),
  username: "oiidqtdo",
  password: "0TDWlrS_abQd",
  keepalive: 60,
  reconnectPeriod: 1000,
  protocolId: "MQIsdp",
  protocolVersion: 3,
  clean: true,
  encoding: "utf8"
};

// Client connection
var client = mqtt.connect("mqtt://m24.cloudmqtt.com", options);
client.on("connect", () => {
  console.log("connected to mqtt://m24.cloudmqtt.com");
});

// Enable the subscription router
var router = mqttrouter.wrap(client);

// Exporting two objects
module.exports = { mqttClient: client, mqttRouter: router };
