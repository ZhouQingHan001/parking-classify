const Parkingspaces = require("../mongo/Parkingspaces");
const log4js = require("log4js");
const {
  dingding_Info,
  dingding_Accumulate,
  dingding_SpclReboot
} = require("../dingding/robots");
const log4TMoteInfo = log4js.getLogger("log4TMoteInfo");
log4TMoteInfo.level = "debug";

let BufferInfo = [];

const radarCt = (SN, Rcnt) => {
  let result = BufferInfo.find(a => {
    if (a.SN == SN) {
      return a;
    }
  });
  if (result == undefined) {
    BufferInfo.push({
      SN: SN,
      Time: new Date(),
      RcntOneDay: null,
      Rcnt: Rcnt
    });
  } else {
    result.Time = new Date();
    result.RcntOneDay = Rcnt - result.Rcnt;
    result.Rcnt = Rcnt;
  }
};
const findParkinglot = SN => {
  return new Promise((resolve, rejecet) => {
    if (!SN)
      rejecet({
        Error: "SN is illegal"
      });
    Parkingspaces.findOne({
      MoteDeviceId: SN
    }).then(findOne => {
      if (!findOne) {
        resolve(null);
      } else {
        resolve({
          ParkinglotName: findOne.Parkinglot.ParkinglotName,
          ParkinglotId: findOne.Parkinglot.ParkinglotId
        });
      }
    });
  });
};

const reBoot = async (SN, TOPIC, TMoteInfo) => {
  const { Hard, Boot } = TMoteInfo;
  let rfFlag = Hard.indexOf("RF") > 0 || Hard.indexOf("rf") > 0;
  let BootFlag = Boot.substr(0, 1);
  let softRebootflag = Boot.match(/[.]/g).length; //如果有两个.说明要对软件重启分类
  let parkinglot = await findParkinglot(SN);
  let content = "设备重启";
  if (TOPIC === "/standard/tayk/bhsh/") {
    log4TMoteInfo.info("天奥银科的设备重启了");
    switch (BootFlag) {
      case "1":
        content = `独立看门狗重启`;
        break;
      case "2":
        if (softRebootflag === 2) {
          switch (Boot.substr(-1, 1)) {
            case "1":
              content = `系统超时重启`;
              break;
            case "2":
              content = `小无线命令重启`;
              break;
            case "3":
              content = `COAP命令重启`;
              break;
            case "4":
              content = `MQTT命令重启`;
              break;
            case "5":
              content = `小无线升级重启`;
              break;
            case "6":
              content = `COAP升级重启`;
              break;
            case "7":
              content = `MQTT升级重启`;
              break;
            case "8":
              content = `NB超时重启`;
              break;
            default:
              content = `软件重启`;
              break;
          }
        } else {
          content = `软件重启`;
        }
        break;
      case "3":
        content = `电压不足重启`;
        break;
      case "4":
        content = `断电重启`;
        break;
      case "5":
        content = `选项位控制重启`;
        break;
      case "7":
        content = `窗口看门狗重启`;
        break;
      case "8":
        content = `引脚控制重启`;
        break;
      default:
        content = "莫名其妙就重启了";
    }
    dingding_SpclReboot(`天奥银科的设备[${SN}]${content}, Boot:${Boot}`);
    return;
  }
  if (TOPIC === "/standard/bell/bell_test/") {
    switch (BootFlag) {
      case "1":
        content = `独立看门狗重启`;
        break;
      case "2":
        if (softRebootflag === 2) {
          switch (Boot.substr(-1, 1)) {
            case "1":
              content = `系统超时重启`;
              break;
            case "2":
              content = `小无线命令重启`;
              break;
            case "3":
              content = `COAP命令重启`;
              break;
            case "4":
              content = `MQTT命令重启`;
              break;
            case "5":
              content = `小无线升级重启`;
              break;
            case "6":
              content = `COAP升级重启`;
              break;
            case "7":
              content = `MQTT升级重启`;
              break;
            case "8":
              content = `NB超时重启`;
              break;
            default:
              content = `软件重启`;
              break;
          }
        } else {
          content = `软件重启`;
        }
        break;
      case "3":
        content = `电压不足重启`;
        break;
      case "4":
        content = `断电重启`;
        break;
      case "5":
        content = `选项位控制重启`;
        break;
      case "7":
        content = `窗口看门狗重启`;
        break;
      case "8":
        content = `引脚控制重启`;
        break;
      default:
        content = "莫名其妙就重启了";
    }
    dingding_SpclReboot(
      `用户[bell_test]下的设备[${SN}]${content}, Boot:${Boot}`
    );
    return;
  }
  switch (BootFlag) {
    case "1":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]独立看门狗重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]独立看门狗重启，Boot:${Boot}, 检测到小无线异常,请及时查看确认。`;
      break;
    case "2":
      if (softRebootflag === 2) {
        switch (Boot.substr(-1, 1)) {
          case "1":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]系统超时重启，Boot:${Boot}`;
            break;
          case "2":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]小无线命令重启，Boot:${Boot}`;
            break;
          case "3":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]COAP命令重启，Boot:${Boot}`;
            break;
          case "4":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]MQTT命令重启，Boot:${Boot}`;
            break;
          case "5":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]小无线升级重启，Boot:${Boot}`;
            break;
          case "6":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]COAP升级重启，Boot:${Boot}`;
            break;
          case "7":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]MQTT升级重启，Boot:${Boot}`;
            break;
          case "8":
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]NB超时重启，Boot:${Boot}`;
            break;
          default:
            content = `[${TOPIC}]车场[${
              parkinglot.ParkinglotName
            }]下的设备[${SN}]软件重启，Boot:${Boot}`;
            break;
        }
      } else {
        content = `[${TOPIC}]车场[${
          parkinglot.ParkinglotName
        }]下的设备[${SN}]软件重启，Boot:${Boot}`;
      }

      break;
    case "3":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]电压不足重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]电压不足重启，Boot:${Boot}未检测到小无线,请及时查看确认`;
      break;
    case "4":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]断电重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]断电重启，Boot:${Boot},未检测到小无线,请及时查看确认`;
      break;
    case "5":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]选项位控制重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]选项位控制重启，Boot:${Boot},未检测到小无线,请及时查看确认`;
      break;
    case "7":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]窗口看门狗重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]窗口看门狗重启，Boot:${Boot},未检测到小无线,请及时查看确认`;
      break;
    case "8":
      content = rfFlag
        ? `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]引脚控制重启，Boot:${Boot}`
        : `[${TOPIC}]车场[${
            parkinglot.ParkinglotName
          }]下的设备[${SN}]引脚控制重启，Boot:${Boot},未检测到小无线,请及时查看确认`;
      break;
    default:
      content = `[${TOPIC}]车场[${
        parkinglot.ParkinglotName
      }]下的设备[${SN}]重启了(Boot:${TMoteInfo.Boot}), 请及时查看确认。`;
      break;
  }
  log4TMoteInfo.error(content);
  dingding_Info(content);
};

const reportRadarCt = () => {
  let ltFiveHundred = 0;
  let FiveHundred = 0;
  let OneThousand = 0;
  let OneThousandFiveHundred = 0;
  let glTwoThousand = 0;
  const actions = [];
  BufferInfo.map(item => {
    let action = () => {
      return new Promise(resolve => {
        if (item.RcntOneDay > 0 && item.RcntOneDay <= 500) {
          ltFiveHundred = ltFiveHundred + 1;
        } else if (item.RcntOneDay > 500 && item.RcntOneDay <= 1000) {
          FiveHundred = FiveHundred + 1;
        } else if (item.RcntOneDay > 1000 && item.RcntOneDay <= 1500) {
          OneThousand = OneThousand + 1;
        } else if (item.RcntOneDay > 1500 && item.RcntOneDay <= 2000) {
          OneThousandFiveHundred = OneThousandFiveHundred + 1;
        } else if (item.RcntOneDay > 2000) {
          glTwoThousand = glTwoThousand + 1;
        }
        resolve();
      });
    };
    actions.push(action());
  });
  Promise.all(actions).then(() => {
    let content = `今日Rcnt统计如下 \r\n 0 < Rcnt < 500 === ${ltFiveHundred}\r\n500 < Rcnt < 1000 === ${FiveHundred}\r\n1000 < Rcnt < 1500 === ${OneThousand}\r\n1500 < Rcnt < 2000 === ${OneThousandFiveHundred}\r\nRcnt > 2000 === ${glTwoThousand}`;
    dingding_Accumulate(content);
  });
};
const handleTmoteInfo = data => {
  const { SN, TOPIC, TMoteInfo } = data;
  const { Boot, Batt, Rcnt, rcnt } = TMoteInfo;
  let radarCnt = Rcnt || rcnt;
  if (Batt < 300) {
    let content = `${TOPIC}---[${SN}]电池电压低于3V(Batt:${Batt}), 请及时查看确认。`;
    log4TMoteInfo.error(content);
    dingding_Info(content);
  }
  if (radarCnt) radarCt(SN, radarCnt);
  if (Boot) reBoot(SN, TOPIC, TMoteInfo);
};

module.exports = {
  handleTmoteInfo,
  reportRadarCt
};
