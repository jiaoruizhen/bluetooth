var app = getApp()
var url = app.url
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/** 
 * 时间戳转化为年 月 日 时 分 秒 
 * number: 传入时间戳 
 * format：返回格式，支持自定义，但参数必须与formateArr里保持一致 
*/
function formatTime(number, format) {

  var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  var returnArr = [];

  var date = new Date(number * 1000);
  returnArr.push(date.getFullYear());
  returnArr.push(formatNumber(date.getMonth() + 1));
  returnArr.push(formatNumber(date.getDate()));

  returnArr.push(formatNumber(date.getHours()));
  returnArr.push(formatNumber(date.getMinutes()));
  returnArr.push(formatNumber(date.getSeconds()));

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}  


var Crypto = require('cryptojs-master/cryptojs.js').Crypto;
var app = getApp();

function RdWXBizDataCrypt(appId, sessionKey) {
  this.appId = appId
  this.sessionKey = sessionKey
}

RdWXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
  // base64 decode ：使用 CryptoJS 中 Crypto.util.base64ToBytes()进行 base64解码
  var encryptedData = Crypto.util.base64ToBytes(encryptedData)
  var key = Crypto.util.base64ToBytes(this.sessionKey);
  var iv = Crypto.util.base64ToBytes(iv);

  // 对称解密使用的算法为 AES-128-CBC，数据采用PKCS#7填充
  var mode = new Crypto.mode.CBC(Crypto.pad.pkcs7);
  var decryptResult=""
  try {
    // 解密
    var bytes = Crypto.AES.decrypt(encryptedData, key, {
      asBpytes: true,
      iv: iv,
      mode: mode
    });

    decryptResult= JSON.parse(bytes);
  
  } catch (err) {
    console.log(err)
  }
  console.log("decryptResult:", decryptResult)
  // if (decryptResult.watermark.appid !== this.appId) {
  //   console.log(err)
  // }

  return decryptResult
}

function searchbluetooth() {
  var temp = []
    wx.startBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("开始搜索附近蓝牙设备")
        console.log(res)
     
  wx.onBluetoothDeviceFound(function (e) {
    console.log("搜索到的设备：", e)
    temp.push(e.devices)
    temp.forEach(function (e) {
      var deviceid = ab2hex(e[0].advertisData).toUpperCase().substring(4, ab2hex(e[0].advertisData).length)
      if (deviceid != null && deviceid != '' && deviceid != undefined) {
        deviceid = deviceid.substring(0, 2) + ":" + deviceid.substring(2, 4) + ":" + deviceid.substring(4, 6) + ":" + deviceid.substring(6, 8) + ":" + deviceid.substring(8, 10) + ":" + deviceid.substring(10, 12);
        e[0].localName = deviceid

      }
    })
    //app.globalData.devices = temp
    console.log("设备列表：", app.globalData.devices)
    console.log('发现新蓝牙设备-----')
    console.log('设备id:' + e.devices[0].deviceId)
    console.log('设备name:' + e.devices[0].name)
    console.log("排序前：", temp)


    var temp1 = []
    temp.forEach(function (e) {
      temp1.push(e[0])
    })
    for (var i = temp1.length - 1; i > 0; i--) {//让比较的范围不停的减掉最后一个单元
      for (var j = 1; j <= i; j++) {
        if (temp1[j - 1].RSSI < temp1[j].RSSI) {//让2个数之间大的数排后面
          var tmp = (temp1[j - 1].RSSI);
          temp1[j - 1].RSSI = temp1[j].RSSI;
          (temp1[j].RSSI) = tmp;
        }

      }
    }
    var mac = []
    temp1.forEach(function (e) {
      mac.push(e.localName)
    })
    app.globalData.devices = mac
    //根据搜索的设备，查询丢失的设备
  })
      }
    })
}

function getDevices() {
  setTimeout(function () {
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log("停止蓝牙搜索")
        console.log(res)
      }
    })
    wx.request({
      url: url + '/lose/selectByLoseDeviceId',
      data: {
        "mac": app.globalData.devices
      },
      success: function (res) {
        console.log("查询悬赏设备：", res)
        if (res.data.code == 200) {//查询成功
          app.globalData.loseInfo = res.data.data
          if (res.data.data.length > 0) {
            wx.navigateTo({
              url: '../findPet/information/information',
            })
          }
        }
      }
    })
  }, 10000)
}
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
module.exports = {
  formatTime: formatTime,
  RdWXBizDataCrypt: RdWXBizDataCrypt,
  getDevices: getDevices,
  searchbluetooth: searchbluetooth,
}