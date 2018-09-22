// pages/index/index.js
//用来加载登陆和设备连接的缓冲页面
var app = getApp();
var util = require("../../utils/util.js")
var WXBizDataCrypt = require('../../utils/util.js').RdWXBizDataCrypt;
var url = app.url

Page({

  /**
   * 页面的初始数据
   */
  data: {
    encryptedData:'',
    iv:'',
    code:'',
    system:'',
    searchingstatus: false,
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
        that.setData({
          system: app.systemInfo.system
        })
        console.log("system:",that.data.system)
     wx.getUserInfo({
       success:function(res){
         that.login(res.encryptedData, res.iv)
       }
     })
    

  },
  getUserInfo: function (res) {
    let that =this
    console.log("用户信息", res)
     app.globalData.userInfo = res.detail.userInfo
     console.log("全局", app.globalData.userInfo);
    wx.showLoading({
      title: '正在登录...',
    })
    that.setData({
      encryptedData: res.detail.encryptedData,
      iv: res.detail.iv
    })
    this.login(res.detail.encryptedData,res.detail.iv)
    console.log("encryptedData:", res.detail.encryptedData)
  },
  login: function (encryptedData, iv) {
    let that = this
    wx.login({
      success: function (res) {
        console.log("登录成功：", res)
        that.setData({
          code: res.code
        })
        that.getOpenId(res.code, encryptedData, iv)
      }
    })
  },

  getOpenId: function (code, encryptedData, iv) {
    let that = this
    //根据授权登陆的code获取openid
    wx.request({
      url: url + '/users/getOpenId',
      data: {
        "code": code,
      },
      success: function (res) {
        if (res.data.code == 200) {
          console.log('获取openid：', res)
         var pc = new WXBizDataCrypt("wxa94a836ed284dc65", res.data.data.session_key)
         
          var data = pc.decryptData(encryptedData, iv)
              console.log('解密后 data: ', data)

          wx.setStorage({
            key: 'unionId',
            data: data.unionId,

          })
          if (data.unionId == null || data.unionId == "" || data.unionId == undefined) {
           
          } else {
            that.getUserByOpenId(data.unionId)
          }

        } else {
          wx.showToast({
            title: '服务器忙',
          })
        }

      },
      fail: function (res) {
        console.log("连接端口失败：", res);
      }

    })
  },

  getUserByOpenId: function (unionId) {
    let that = this
    console.log("unionId:",unionId)
    wx.request({
      url: url + '/users/findUserAndPets',
      data: {
        "unionId": unionId
      },
      success: function (res) {
        console.log('获取用户信息：', res)

        //查询成功,执行其他加载操作
        if (res.data.code == 200) {
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1000
          })
          app.globalData.userInfo = res.data.data.users
          app.globalData.petInfo = res.data.data.pets
          //app.globalData.connectedDeviceId = res.data.data.pets[0].uuid
          wx.setStorage({
            key: 'userId',
            data: res.data.data.users.id,
          })
            that.switchBlueTooth(res.data.data.pets);        
        } else if (res.data.code == 118) {
          //用户不存在，添加用户信息并分配默认宠物信息
          that.addUserInfo(unionId);
        } else {
          //openid为空，弹框出来提示服务器错误，请重试
          wx.showToast({
            title: '500，error',
            icon: 'fail',
            duration: 1000
          })
        }
      }
    })
  },
  addUserInfo: function (unionId) {
    let that = this
    //如果返回未找到，添加openid
    app.getLocationInfo(function (locationInfo) {
      console.log('map', locationInfo);


      wx.request({
        url: url + '/users/addUserInfo',
        data: {
          'dtype': "PetUser",
          'unionId': unionId,
          'nickname': app.globalData.userInfo.nickName,
          "name": app.globalData.userInfo.nickName,
          'portrait': app.globalData.userInfo.avatarUrl,
          "city": app.globalData.userInfo.city,
          "province": app.globalData.userInfo.province,
          "lat": locationInfo.latitude,
          "lng": locationInfo.longitude,
          "email": "wexin@qq.com",
          "password": "123456"
        },
        success: function (res) {
          wx.hideLoading()
          //添加成功
          wx.showToast({
            title: '登陆成功',
            icon: 'success',
            duration: 1000
          })

          wx.showLoading({
            title: '开始加载数据...',
          })
          that.switchBlueTooth(res.data.data);
        }
      })
    })
  },
  getResultData: function (data) {
    let that = this
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log('characteristic value comed:')
      let buffer = characteristic.value
      let dataView = new DataView(buffer)
      console.log("接收字节长度:" + dataView.byteLength)
      var str = ""
      for (var i = 0; i < dataView.byteLength; i++) {
        str += String.fromCharCode(dataView.getUint8(i))
      }
      //  将接收到的数据解析并 存储在数据库
      wx.request({
        url: url + '/communicate/getResultData',
        data: {
          "result": str,
          "deviceId": data
        },
        success: function (res) {
          console.log("获取到的指令解析结果:", res)
          if ("ok" != res.data.string) {
            wx.showToast({
              title: res.data.string,
            })
          }

        }
      })
    })
  },

  //打开蓝牙适配器，并进行连接
  switchBlueTooth: function (petInfo) {
    var that = this
    var deviceId = ""
    var devices = []
      wx.openBluetoothAdapter({
        success: function (res) {
          console.log("初始化蓝牙适配器成功")
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log("蓝牙适配器状态变化", res)
            app.globalData.isbluetoothready = res.available

          })
          that.searchbluetooth(petInfo)

        },
        fail: function (res) {
          console.log("初始化蓝牙适配器失败")
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
            success: function (res) {
              app.globalData.isbluetoothready = false,
                that.setData({
                  searchingstatus: false
                })
            }
          })
        }
      })
  },
  searchbluetooth: function (petInfo) {
    var that = this
    var temp = []
    wx.showLoading({
      title: '搜索设备中……',
    })
    if (!that.data.searchingstatus) {
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("开始搜索附近蓝牙设备")
          console.log(res)
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
    wx.onBluetoothDeviceFound(function (e) {
      console.log("搜索到的设备：", e)
      temp.push(e.devices)
      console.log("temp:", temp)
      temp.forEach(function (e) {
        var deviceid = ab2hex(e[0].advertisData).toUpperCase().substring(4, ab2hex(e[0].advertisData).length)
        if (deviceid != null && deviceid != '' && deviceid != undefined) {
          deviceid = deviceid.substring(0, 2) + ":" + deviceid.substring(2, 4) + ":" + deviceid.substring(4, 6) + ":" + deviceid.substring(6, 8) + ":" + deviceid.substring(8, 10) + ":" + deviceid.substring(10, 12);
          e[0].localName = deviceid
          
         
          petInfo.forEach(function(a){
            console.log("deviceid:", deviceid)
            console.log("a.mac:", a.mac)
            if (a.mac.trim()==deviceid.trim()) {//如果搜索到用户绑定的设备，就直接更新uuid
              wx.request({
                url: url + '/device/update',
                data: {
                  mac: e[0].localName,
                  uuid: e[0].deviceId
                },
                success: function (r) {
                  if (r.data.code == 200) {
                    a.uuid=e[0].deviceId
                    console.log("更新成功！")
                  } else {
                    wx.showToast({
                      title: '设备更新失败！',
                    })
                  }
                }
              })
            }
          })
        }
      })
    })
    setTimeout(function(){
      var devices = []
      that.setData({
        searchingstatus: !that.data.searchingstatus
      })
      petInfo.forEach(function (a) {
      devices.push(a)
      })
      var deviceId=''
      console.log("petInfo:", petInfo)
      console.log("devices", devices)
      if (devices.length > 0) {
        if (that.data.system.includes("Android")) {//安卓手机
          deviceId = devices[0].mac
          if (deviceId == null || deviceId == "" || deviceId == undefined) {//用户没有设备

          } else {//用户有设备  
            app.globalData.isBind = true
            app.globalData.mac = deviceId
            that.getResultData(deviceId)
            that.connectTO(deviceId);
          }
        } else if (that.data.system.includes("iOS")) {
          //找出uuid有效的宠物
          var temp = []
          devices.forEach(function (e) {
            if (e.uuid != undefined) {
              temp.push(e)
            }
          })
          console.log("temp=======", temp)
          if (temp.length > 0) {
            deviceId = temp[0].uuid
            if (deviceId == null || deviceId == "" || deviceId == undefined) {//用户没有设备

            } else {//用户有设备   

              app.globalData.isBind = true

              app.globalData.mac = temp[0].mac

              that.getResultData(deviceId)

              that.connectTO(deviceId);
            }
          } else {

          }
        }

      } else {//没有绑定设备的宠物

        wx.showModal({
          title: '提示',
          content: '您还没有绑定蓝牙设备，请进入宠联网公众号绑定设备后，再来使用！',
        })
      }
    },5000)
  },
  connectTO: function (deviceid) {
    var that = this
    if (app.globalData.deviceconnected) {
      wx.notifyBLECharacteristicValueChanged({
        state: false, // 停用notify 功能
        deviceId: deviceid,
        serviceId: app.globalData.serviceId,
        characteristicId: app.globalData.characteristicId,
        success: function (res) {
          console.log("停用notify 功能")
        }
      })
      wx.closeBLEConnection({
        deviceId: deviceid,
        complete: function (res) {
          console.log("断开设备")
          console.log(res)
          app.globalData.deviceconnected = false
          that.setData({
            receivedata: ""
          })
        }
      })
    } else {
      wx.hideLoading()
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      wx.createBLEConnection({
        deviceId: deviceid,
        success: function (res) {
          wx.hideLoading()
          app.globalData.deviceconnected = true
                    wx.notifyBLECharacteristicValueChanged({
                      state: true, // 启用 notify 功能
                      deviceId: deviceid,
                      serviceId: app.globalData.serviceId,
                      characteristicId: app.globalData.characteristicId,
                      success: function (res) {
                        console.log("启用notify")
                      }
                    })
                    wx.showToast({
                      title: '连接成功',
                      icon: 'success',
                      duration: 1000
                    })
                    app.globalData.isBind = true 
                    app.globalData.connectedDeviceId=deviceid
                    wx.switchTab({
                      url: '../home/home',
                    })
        },
        fail: function (res) {
          wx.hideLoading()
          app.globalData.isbluetoothready = false
          wx.showModal({
            title: '提示',
            content: '连接失败，请重试',
            confirmColor: '#007aff',
            cancelColor: '#007aff',
            confirmText: '是',
            cancelText: '否',
            success: function (res1) {
              if (res1.confirm) {
                that.switchBlueTooth(app.globalData.petInfo);
              }
            }
          })

        }
      })
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log("停止蓝牙搜索")
          console.log(res)
        }
      })
    }
  },
  //发送数据给蓝牙设备
  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e)
    var senddata = e;
    var that = this
    let buffer = new ArrayBuffer(senddata.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < senddata.length; i++) {
      dataView.setUint8(i, senddata.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: that.data.petInfo.uuid,
      serviceId: app.globalData.serviceId,
      characteristicId: app.globalData.characteristicId1,
      value: buffer,
      success: function (res) {
        console.log(res)
        console.log('writeBLECharacteristicValue success', res.errMsg)
      }
    })
  },
  question:function(){
      wx.navigateTo({
        url: '../userInfo/question/question',
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
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