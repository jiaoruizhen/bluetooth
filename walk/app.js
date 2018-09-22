//app.js


App({
  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    var _that = this;
    wx: wx.getSystemInfo({
      success: function (res) {
        _that.systemInfo = res;
      }
    });
    this.getConnectedDeviceId();
},
getConnectedDeviceId:function(){
  let that=this
  wx.getStorage({
    key: 'connectedDeviceId',
    success: function (res) {
      console.log("app.connectedDeviceId:", res.data)
      that.globalData.connectedDeviceId = res.data
    },
  })
},
  getLocationInfo: function (cb) {
    var that = this;
    if (this.globalData.locationInfo) {
      cb(this.globalData.locationInfo)
    } else {
      wx.getLocation({
        type: 'gcj02', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
        success: function (res) {
          that.globalData.locationInfo = res;
          cb(that.globalData.locationInfo)
        },
        fail: function () {
          // fail
        },
        complete: function () {
          // complete
        }
      })
    }
  },
  globalData: {
    //用户信息
    isBind:false,
    revision:'',
    canIUse:false,
    hasUserInfo:false,
    userInfo: null,
    //数据库中用户信息
    usersInfo:null,
    locationInfo:null,
    isbluetoothready: false,
    deviceconnected: false,
    connectedDeviceId: "",
    mac:'',
    devices: [],
    petInfo:null,
    loseInfo:'',
    serviceId: "0000FFCC-0000-1000-8000-00805F9B34FB",
    //write功能
    characteristicId1: "0000FFC1-0000-1000-8000-00805F9B34FB",
    //notify功能
    characteristicId: "0000FFC2-0000-1000-8000-00805F9B34FB",
  },
  
  //系统信息
  systemInfo: null,
  // url: 'https://www.dognessnetwork.com/walk-1.5.2.RELEASE',
  url:'https://www.dognessnetwork.com/walk-1.0.0-SNAPSHOT',
  //  url:'https://localhost:80'
  // url: 'https://tmltea.mynatapp.cc/blue/bind'  mac  unionId   unbind
  //   /lostDeviceList/  macList
})