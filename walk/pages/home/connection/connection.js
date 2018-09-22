// pages/home/connection/connection.js
var app=getApp()
var url=app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.connectTO1()
  },
  connectTO1: function () {
    var that = this
    if (app.globalData.deviceconnected) {
      wx.notifyBLECharacteristicValueChanged({
        state: false, // 停用notify 功能
        deviceId: app.globalData.connectedDeviceId,
        serviceId: app.globalData.serviceId,
        characteristicId: app.globalData.characteristicId,
        success: function (res) {
          console.log("停用notify 功能")
        }
      })
      wx.closeBLEConnection({
        deviceId: app.globalData.connectedDeviceId,
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
      wx.showLoading({
        title: '连接蓝牙设备中...',
      })
      wx.createBLEConnection({
        deviceId: app.globalData.connectedDeviceId,
        success: function (res) {
          wx.hideLoading()
          app.globalData.deviceconnected = true
          wx.showToast({
            title: '连接成功',
            icon: 'success',
            duration: 1000
          })
          console.log("连接设备成功")
          console.log(res)
          //获取连接的设备的服务特征值
          wx.getBLEDeviceServices({
            deviceId: app.globalData.connectedDeviceId,
            success: function (res1) {
              console.log("获取已连接设备的服务：", res1)
              console.log("已连接设备id:", app.globalData.connectedDeviceId, )
              //获取已连接设备的特征值 返回值是  UUID  properties
              wx.getBLEDeviceCharacteristics({
                deviceId: app.globalData.connectedDeviceId,
                serviceId: res1.services[1].uuid,
                success: function (res) {
                  console.log("characteritics:", res.characteristics)

                  wx.notifyBLECharacteristicValueChanged({
                    state: true, // 启用 notify 功能
                    deviceId: app.globalData.connectedDeviceId,
                    serviceId: app.globalData.serviceId,
                    characteristicId: app.globalData.characteristicId,
                    success: function (res) {
                      console.log("启用notify")

                      wx.request({
                        url: url + '/communicate/openLED',
                        data: {
                          "id": "7"
                        },
                        success: function (res) {
                          console.log("获取电量：", res)
                          that.sendCommon(res.data.string);
                        }
                      })
                      wx.switchTab({
                        url: '../home',
                      })
                    }
                  })
                },
              })
            },
          })
          //连接成功就返回到首页
          

        },
        fail: function (res) {
          wx.hideLoading()
          app.globalData.isbluetoothready = false
          wx.showModal({
            title: '提示',
            content: '连接失败请重试',
            success:function(res){
                if(res.confirm){
                  that.connectTO1()
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
  sendCommon: function (value) {
    //将发送的数据转换为buffer
    console.log("开始发送指令。。。", value)
    let buffer = new ArrayBuffer(value.length)
    let dataView = new DataView(buffer)
    for (var i = 0; i < value.length; i++) {
      dataView.setUint8(i, value.charAt(i).charCodeAt())
    }
    wx.writeBLECharacteristicValue({
      deviceId: app.globalData.connectedDeviceId,
      serviceId: app.globalData.serviceId,
      characteristicId: app.globalData.characteristicId1,
      value: buffer,
      success: function (res) {
        console.log("发送指令成功:", res)
      },
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