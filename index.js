const MQTT = require("./mqtt/index");
const later = require("later");
later.date.localTime();
const sched = { schedules: [{ h: [15], m: [00] }] };

const {
  TMoteStatus: { handleTMoteStatus, reportStatusCnt },
  TMoteInfo: { handleTmoteInfo, reportRadarCt },
  WorkInfo
} = require("./handler/index");
const mqtt = new MQTT();

mqtt.on("TMoteStatus", data => {
  handleTMoteStatus(data);
});
mqtt.on("TMoteInfo", data => {
  handleTmoteInfo(data);
});
mqtt.on("WorkInfo", data => {});

let alarm = later.setInterval(async () => {
  await reportRadarCt();
  reportStatusCnt();
}, sched);
