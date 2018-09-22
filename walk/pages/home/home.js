
var rate = 0;
var canvasWidth = 0;
var canvasHeight = 0;
var app = getApp();

var url = app.url
var temp = []
var util = require("../../utils/util.js")
var pageData = {}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    columnCanvasData: {
      canvasId: 'columnCanvas',
    },
    petInfo: [],
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    searchingstatus: false,
    receivedata: '',
    onreceiving: false,
    date: '',
    connected: false,
    runData: '',
    revision: '',
    totalData: '',
    green: "white",
    red: "white",
    bind: "white",
    white: "green",
    cgreen: "#333",
    cred: "#333",
    cbind: "#333",
    cwhite: "#fff",
    sense: '',
    data: '',
    battery: '',
    device: '',
    opera: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log("=========", app.systemInfo)
    util.searchbluetooth()
    that.connectTO()
    console.log("app.globalData.petInfo:", app.globalData.petInfo)
    var temp = []
    var temp1 = []
    app.globalData.petInfo.forEach(function (e) {
      if (e.mac != undefined) {//mac地址存在
        e = { "name": e.petName, "mac": e.mac, "uuid": e.uuid, "url": e.petPortrait }
        temp.push(e)
      } 
      if (e.uuid != undefined) {//mac地址不存在  uuid存在
        e = { "name": e.petName, "mac": e.mac, "uuid":e.uuid,"e.url": e.petPortrait }
        temp1.push(e)
      }
    })
   
      that.setData({
        petInfo: temp
      })
    that.setData({
      device: app.globalData.connectedDeviceId,
      mac: app.globalData.mac
    })
  },
  selectMac:function(e){
    let that = this
    console.log("==============e============", e)
    app.globalData.mac = e.currentTarget.dataset.mac
    that.setData({
      mac: e.currentTarget.dataset.mac
    })
    
  },
  selectDevice: function (e) {//切换连接
    console.log("切换：", e)
    let that = this
    console.log("app.globalData.connectedDeviceId:", app.globalData.connectedDeviceId)
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
      success:function(res){
        console.log("关闭连接成功：", res)
      }
    })
    that.setData({
      runData: '',
      revision: '',
      totalData: '',
      sense: '',
      data: '',
      battery: ''
    })
    app.globalData.deviceconnected = false
    app.globalData.connectedDeviceId = e.detail.value//转换连接
    that.connectTO1(e.detail.value)
  },

  connectTO: function () {
    var that = this
    if (app.globalData.deviceconnected) {
      that.getServices(app.globalData.connectedDeviceId)
     
      setInterval(function (
      ) {
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
      }, 100000)
      wx.onBLEConnectionStateChange(function (res) {
        // 该方法回调中可以用于处理连接意外断开等异常情况
        console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
        if (!res.connected) {
          //未连接
          wx.vibrateLong()
          wx.showToast({
            title: '已断开连接',
          })
          that.setData({
            runData: '',
            revision: '',
            totalData: '',
            sense: '',
            data: '',
            connected: false,
          })
          app.globalData.isbluetoothready = false
          app.globalData.deviceconnected = false
          that.connectTO1(res.deviceId)
        }

      })

    } else {
      that.setData({

        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      }

      )
    }
  },
  //打开蓝牙适配器，并进行连接
  connectBLE: function () {

    var that = this
    if (app.globalData.deviceconnected) {
      wx.showToast({
        title: '设备已连接',
      })
    } else {
      app.globalData.isbluetoothready = !app.globalData.isbluetoothready
      if (app.globalData.isbluetoothready) {
        wx.openBluetoothAdapter({
          success: function (res) {
            console.log("初始化蓝牙适配器成功")
            
            wx.onBluetoothAdapterStateChange(function (res) {
              console.log("蓝牙适配器状态变化", res)
              app.globalData.isbluetoothready = res.available
            })
            if (app.globalData.connectedDeviceId == null || app.globalData.connectedDeviceId == "" || app.globalData.connectedDeviceId == undefined) {//用户没有设备
              wx.navigateTo({
                url: '../home/scanble/scanble',
              })
            } else {//用户有设备   
              that.connectTO1(app.globalData.connectedDeviceId);
            }
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
      } else {
        //先关闭设备连接
        wx.closeBLEConnection({
          deviceId: app.globalData.connectedDeviceId,
          complete: function (res) {
            console.log(res)
            app.globalData.deviceconnected = false
          }
        })
        wx.closeBluetoothAdapter({
          success: function (res) {
            console.log(res)
            app.globalData.isbluetoothready = false
            app.globalData.deviceconnected = false
            app.globalData.devices = [];
            that.setData({
              searchingstatus: false,
              receivedata: ''
            })
          },
          fail: function (res) {
            wx.showModal({
              title: '提示',
              content: '请检查手机蓝牙是否打开',
              success: function (res) {
                app.globalData.isbluetoothready = false
              }
            })
          }
        })
      }

    }
  },
  connectTO1: function (deviceid) {
    let that = this
    wx.showLoading({
      title: '连接蓝牙设备中...',
    })
    wx.createBLEConnection({
      deviceId: deviceid,
      success: function (res) {
        wx.hideLoading()
        app.globalData.deviceconnected = true
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
       that.getServices(deviceid)
        console.log("连接设备成功")
        console.log(res)
        wx.request({
          url: url + '/communicate/openLED',
          data: {
            "id": "7"
          },
          success: function (res) {
            console.log("获取电量：", res)
            // util.searchbluetooth()
            that.sendCommon(res.data.string);
          }
        })
        that.getResultData(app.globalData.mac);
        that.getPetInfo(app.globalData.connectedDeviceId);
        that.getRunData(app.globalData.mac);
        util.searchbluetooth()
        setTimeout(function () {
          wx.startPullDownRefresh()
          that.showData()
          wx.stopPullDownRefresh()
        }, 3000)
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '连接失败，请重试',
          confirmColor: '#007aff',
          cancelColor: '#007aff',
          confirmText: '是',
          cancelText: '否',
          success: function (res1) {
            if (res1.confirm) {
              app.globalData.deviceconnected = false
              that.connectTO1(deviceid);
            }
          }
        })
      }
    })
  },
  getPetInfo: function (deviceId) {
    let that = this
    if (app.systemInfo.system.includes("Android")) {//selectByDeviceMac
      wx.request({
        url: url + '/pet/selectByDeviceMac',
        data: {
          "mac": deviceId
        },
        success: function (res) {//如果绑定信息，就给数据，没有绑定就没得
          //返回宠物和设备信息
          console.log(deviceId)
          console.log("返回宠物和设备信息", res)
          if (res.data.code == 200) {//已绑定
            app.globalData.isBind = true
            wx.request({
              url: url + '/communicate/getOneWeekRunData',
              success: function (res) {
                console.log("获取近7天的运动数据：", res)
                for (var i in res.data.data) {
                  console.log("res.data.data[i]:", res.data.data[i])
                  that.sendCommon(res.data.data[i]);
                }
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

                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "6",
                    data: getNowFormatDate1()
                  },
                  success: function (res) {
                    console.log("同步时间：", res)
                    that.sendCommon(res.data.string);
                  }
                })
                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "5"
                  },
                  success: function (res) {
                    console.log("获取版本号：", res)
                    that.sendCommon(res.data.string);
                  }
                })
                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "10"
                  },
                  success: function (res) {
                    console.log("读取灵敏值", res)
                    that.sendCommon(res.data.string);
                  }
                })
              }
            })
          } else {//未绑定
            app.globalData.isBind = false
            that.setData({
              petInfo: null,
              runData: '',
              revision: '',
              totalData: '',
              sense: '',
              data: '',
              battery: '',
            })
            wx.showModal({
              title: '提示',
              content: '设备未与宠物绑定,是否去绑定',
              confirmColor: '#007aff',
              cancelColor: '#007aff',
              confirmText: '是',
              cancelText: '否',
              success: function (res1) {
                if (res1.confirm) {
                  wx.navigateTo({
                    url: '../userInfo/petOwnerInfo/petOwnerInfo',
                  })
                }
              }
            })
          }
        }
      })
    } else if (app.systemInfo.system.includes("iOS")) {
      wx.request({
        url: url + '/pet/selectByDeviceId',
        data: {
          "deviceId": deviceId
        },
        success: function (res) {//如果绑定信息，就给数据，没有绑定就没得
          //返回宠物和设备信息
          console.log("返回宠物和设备信息", res)
          if (res.data.code == 200) {//已绑定
            app.globalData.isBind = true
            wx.request({
              url: url + '/communicate/getOneWeekRunData',
              success: function (res) {
                console.log("获取近7天的运动数据：", res)
                for (var i in res.data.data) {
                  console.log("res.data.data[i]:", res.data.data[i])
                  that.sendCommon(res.data.data[i]);
                }
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


                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "5"
                  },
                  success: function (res) {
                    console.log("获取版本号：", res)
                    that.sendCommon(res.data.string);
                  }
                })
                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "6",
                    data: getNowFormatDate1()
                  },
                  success: function (res) {
                    console.log("同步时间：", res)
                    that.sendCommon(res.data.string);
                  }
                })
                wx.request({
                  url: url + '/communicate/openLED',
                  data: {
                    "id": "10"
                  },
                  success: function (res) {
                    console.log("读取灵敏值", res)
                    that.sendCommon(res.data.string);
                  }
                })
              }
            })
          } else {//未绑定
            app.globalData.isBind = false
            that.setData({
              petInfo: null,
              runData: '',
              revision: '',
              totalData: '',
              sense: '',
              data: '',
              battery: '',
            })
            wx.showModal({
              title: '提示',
              content: '设备未与宠物绑定,是否去绑定',
              confirmColor: '#007aff',
              cancelColor: '#007aff',
              confirmText: '是',
              cancelText: '否',
              success: function (res1) {
                if (res1.confirm) {
                  wx.navigateTo({
                    url: '../userInfo/petOwnerInfo/petOwnerInfo',
                  })
                }
              }
            })
          }
          console.log("petInfo:", res);
        }
      })
    }

  },
  getResultData: function (data) {
    let that = this
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log('characteristic value comed:', characteristic)
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
          if (res.data.string != undefined) {

            if (res.data.string == "ok" || (res.data.string).indexOf('revision') >= 0 || (res.data.string).indexOf('senr') >= 0 || (res.data.string).indexOf('battery') >= 0) {

            } else {
              wx.showToast({
                title: res.data.string,
              })
            }
            if ((res.data.string).indexOf('revision') >= 0) {
              that.setData({
                revision: res.data.string.substring(8, 12)
              })

            }
            if ((res.data.string).indexOf('senr') >= 0) {
              that.setData({
                sense: res.data.string.substring(5, 7)
              })
            }
            if ((res.data.string).indexOf('battery') >= 0) {
              that.setData({
                battery: res.data.string.substring(8, 10)
              })
              if (parseInt(res.data.string.substring(8, 10)) < 20) {
                wx.showModal({
                  title: '提示',
                  content: '电量低，请充电！',
                  success: function (res) {
                    //关闭灯带
                    wx.request({
                      url: url + '/communicate/openLED',
                      data: {
                        "id": "0"
                      },
                      success: function (res1) {
                        that.setData({
                          green: "white",
                          red: "white",
                          bind: "white",
                          white: "gray",
                        })
                        that.sendCommon(res1.data.string);
                      }
                    })
                  }
                })
              }
            }
          }
        }
      })
    })
  },
  setConvasData: function () {
    let that = this
    var systemInfo = app.systemInfo;
    rate = systemInfo.screenWidth / 750;
    var updateData = {};
    canvasWidth = systemInfo.screenWidth - rate * 64;
    canvasHeight = rate * 306 + rate * 44 + rate * 34 + rate * 22;

    var culumnYMax = that.data.data + 100;
    var culumnYMin = 0;
    updateData['columnCanvasData.canvasWidth'] = canvasWidth;
    updateData['columnCanvasData.axisPadd'] = { left: rate * 5, top: rate * 13, right: rate * 5 };
    updateData['columnCanvasData.axisMargin'] = { bottom: rate * 34, left: rate * 26 };
    updateData['columnCanvasData.yAxis.fontSize'] = rate * 22;
    updateData['columnCanvasData.yAxis.fontColor'] = '#637280';
    updateData['columnCanvasData.yAxis.lineColor'] = '#DCE0E6';
    updateData['columnCanvasData.yAxis.lineWidth'] = rate * 2;
    updateData['columnCanvasData.yAxis.dataWidth'] = rate * 62;
    updateData['columnCanvasData.yAxis.isShow'] = true;
    updateData['columnCanvasData.yAxis.isDash'] = true;
    updateData['columnCanvasData.yAxis.minData'] = culumnYMin;
    updateData['columnCanvasData.yAxis.maxData'] = culumnYMax;
    updateData['columnCanvasData.yAxis.padd'] = rate * 306 / (culumnYMax - culumnYMin);

    updateData['columnCanvasData.xAxis.dataHeight'] = rate * 26;
    updateData['columnCanvasData.xAxis.fontSize'] = rate * 22;
    updateData['columnCanvasData.xAxis.fontColor'] = '#637280';
    updateData['columnCanvasData.xAxis.lineColor'] = '#DCE0E6';
    updateData['columnCanvasData.xAxis.lineWidth'] = rate * 2;
    updateData['columnCanvasData.xAxis.padd'] = rate * 40;
    updateData['columnCanvasData.xAxis.dataWidth'] = rate * 40;
    updateData['columnCanvasData.xAxis.leftOffset'] = rate * 40;


    updateData['columnCanvasData.canvasHeight'] = canvasHeight;
    updateData['columnCanvasData.enableScroll'] = true;

    that.setData(updateData);
  },


  //发送数据指令

  sendCommon: function (value) {
    //将发送的数据转换为buffer
    // console.log("开始发送指令。。。", value, app.globalData.connectedDeviceId)
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
        // console.log("发送指令成功:", res)
      },
      fail:function(res){
        console.log("发送指令失败:",res)
      }
    })
  },

  openLed: function (e) {
    let that = this
    if (app.globalData.isBind == true & app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      let that = this
      console.log("Led：", e.currentTarget.dataset.id)
      wx.request({
        url: url + '/communicate/openLED',
        data: {
          "id": e.currentTarget.dataset.id
        },
        success: function (res) {
          if (e.currentTarget.dataset.id == 0) {//点击关，将关设置为灰色，其余的白色
            that.setData({
              green: "white",
              red: "white",
              bind: "white",
              white: "green",
              cgreen: "#333",
              cred: "#333",
              cbind: "#333",
              cwhite: "#fff",
            })
          } else if (e.currentTarget.dataset.id == 1) {
            that.setData({
              green: "white",
              red: "green",
              bind: "white",
              white: "white",
              cgreen: "#333",
              cred: "#fff",
              cbind: "#333",
              cwhite: "#333",
            })
          } else if (e.currentTarget.dataset.id == 2) {
            that.setData({
              green: "green",
              red: "white",
              bind: "white",
              white: "white",
              cgreen: "#fff",
              cred: "#333",
              cbind: "#333",
              cwhite: "#333",
            })
          } else if (e.currentTarget.dataset.id == 3) {
            that.setData({
              green: "white",
              red: "white",
              bind: "green",
              white: "white",
              cgreen: "#333",
              cred: "#333",
              cbind: "#fff",
              cwhite: "#333",
            })
          }
          console.log("操作LED:", res.data.string)
          that.sendCommon(res.data.string);

        }
      })
    } else if (app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      that.setData({
        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showModal({
        title: '提示',
        content: '设备绑定后才能执行此操作,是否需要绑定',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            wx.navigateTo({
              url: '../userInfo/petOwnerInfo/petOwnerInfo',
            })
          }
        }
      })
    } else if (app.globalData.isBind == true && parseInt(that.data.battery) > 20) {
      that.setData({

        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.vibrateLong()
      wx.showModal({
        title: '提示',
        content: '设备已断开连接，连接设备后才能执行此操作',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            that.connectTO1(res.deviceId);
          }
        }
      })
    } else if (app.globalData.isBind == true || app.globalData.deviceconnected == true) {
      wx.showToast({
        title: '电量低，关闭灯带',
      })
      wx.request({
        url: url + '/communicate/openLED',
        data: {
          "id": "0"
        },
        success: function (res1) {
          that.setData({
            green: "white",
            red: "white",
            bind: "white",
            white: "gray",
          })
          that.sendCommon(res1.data.string);
        }
      })
    }

  },
  getServices: function (deviceId){
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: deviceId,
      success: function (res) {
        console.log('device services:', res.services)
        wx.getBLEDeviceCharacteristics({
          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
          deviceId: deviceId,
          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
          serviceId: res.services[1].uuid,
          success: function (r) {
            console.log('device getBLEDeviceCharacteristics:', r.characteristics)
            wx.notifyBLECharacteristicValueChanged({
              state: true, // 启用 notify 功能
              deviceId: deviceId,
              serviceId: res.services[1].uuid,
              characteristicId: r.characteristics[1].uuid,
              success: function (res) {
                console.log("启用notify:", res)

              }
            })
          },
          fail: function (r) {
            console.log("device getBLEDeviceCharacteristics fail:", r)
          }
        })
      },
      fail: function (res) {
        console.log("device services fail:", res)
      }
    })

  },
  slider3change: function (e) {
    /***成功后回调 */
    let that = this
    if (app.globalData.isBind == true & app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      wx.request({
        url: url + '/communicate/openLED',
        data: {
          "id": "8",
          "data": e.detail.value
        },
        success: function (res) {
          console.log(res)
          that.sendCommon(res.data.string);
        }
      })
    } else if (app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      that.setData({

        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showModal({
        title: '提示',
        content: '设备绑定后才能执行此操作,是否需要绑定',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            wx.navigateTo({
              url: '../userInfo/petOwnerInfo/petOwnerInfo',
            })
          }
        }
      })
    } else if (app.globalData.isBind == true && parseInt(that.data.battery) > 20) {
      that.setData({

        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showModal({
        title: '提示',
        content: '设备已断开连接，连接设备后才能执行此操作',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            that.connectTO1(res.deviceId);
          }
        }
      })
    } else if (app.globalData.isBind == true || app.globalData.deviceconnected == true) {
      that.setData({


        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showToast({
        title: '电量低',
      })
    }

  },
  slider3change: function (e) {
    /***成功后回调 */
    let that = this
    if (app.globalData.isBind == true & app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      wx.request({
        url: url + '/communicate/openLED',
        data: {
          "id": "8",
          "data": e.detail.value
        },
        success: function (res) {
          console.log(res)
          that.sendCommon(res.data.string);
        }
      })
    } else if (app.globalData.deviceconnected == true && parseInt(that.data.battery) > 20) {
      that.setData({
        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showModal({
        title: '提示',
        content: '设备绑定后才能执行此操作,是否需要绑定',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            wx.navigateTo({
              url: '../userInfo/petOwnerInfo/petOwnerInfo',
            })
          }
        }
      })
    } else if (app.globalData.isBind == true && parseInt(that.data.battery) > 20) {
      that.setData({

        runData: '',
        revision: '',
        totalData: '',
        sense: '',
        data: '',
        battery: ''
      })
      wx.showModal({
        title: '提示',
        content: '设备已断开连接，连接设备后才能执行此操作',
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            that.connectTO1(res.deviceId);
          }
        }
      })
    } else if (app.globalData.isBind == true || app.globalData.deviceconnected == true) {
      wx.showToast({
        title: '电量低，关闭灯带',
      })
      wx.request({
        url: url + '/communicate/openLED',
        data: {
          "id": "0"
        },
        success: function (res1) {
          that.setData({
            green: "white",
            red: "white",
            bind: "white",
            white: "gray",
          })
          that.sendCommon(res1.data.string);
        }
      })
    }
  },
  getRunData: function (data) {
    var that = this
    wx.request({
      url: url + '/step/getStepCountOneWeek',
      data: {
        "deviceId": data
      },
      success: function (res) {
        console.log("宠物一周运动的步数：", res.data.data)
        if (res.data.data == null || res.data.data == undefined || res.data.data == "") {
        }
        res.data.data.total.mileages = res.data.data.total.mileages.toFixed(2)
        res.data.data.total.calories = res.data.data.total.calories.toFixed(2)
        res.data.data.total.mileage = res.data.data.total.mileage.toFixed(2)
        res.data.data.total.calorie = res.data.data.total.calorie.toFixed(2)
        that.setData({
          runData: res.data.data.list,
          totalData: res.data.data.total
        })
        console.log("list:", that.data.runData)
        console.log("total:", that.data.totalData)

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    util.getDevices()

  },

  /**
   * 生命周期函数--监听页面显示
   * 显示数据，动态加载页面
   */
  showData: function () {
    let that = this
    var runCount = that.data.runData;
    // var runCount = [100, 101, 25, 12, 56, 76]
    if (runCount == undefined || runCount[0].sDate == undefined) {
      that.setData({
        connected: app.globalData.deviceconnected,
        date: util.formatTime(Date.parse(new Date()) / 1000, 'Y-M-D') + " " + getNowFormatDate(),
      })
      wx.stopPullDownRefresh()
    } else if (runCount != undefined && runCount[0].sDate != undefined) {
      that.setData({
        connected: app.globalData.deviceconnected,
        date: util.formatTime(runCount[0].sDate / 1000, 'Y-M-D') + " " + getNowFormatDate(),
      })

      var max = runCount[0].sCount;                         //获取数组的第一个值   
      for (var i in runCount) {
        max = max > runCount[i].sCount ? max : runCount[i].sCount;
      }
      console.log("最大值", max)
      that.setData({
        data: max + 100
      })
      that.setConvasData()
      var updateData = {};
      var columnYMax = (max + 100);
      var columnYMin = 0;

      var tep = []
      var temp = []
      var tep1 = []
      var temp1 = []
      var test = {}
      runCount.forEach(function (e) {
        if (e.sCount != undefined) {
          tep.push(e.sCount)
        }
        if (e.sDate != undefined) {
          temp.push(util.formatTime(e.sDate / 1000, 'M.D'))

        } else {
          temp.push(util.formatTime(Date.parse(new Date()) - 144 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) - 120 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) - 96 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) - 72 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) - 48 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) - 24 * 60 * 60 / 1000, 'M.D'), util.formatTime(Date.parse(new Date()) / 1000, 'M.D'))
        }
      })
      for (var i in temp) {
        temp1.push(temp[temp.length - 1 - i])
        i++
      }
      for (var i in tep) {
        tep1.push(tep[tep.length - 1 - i])
        i++
      }
      console.log(tep, "============", tep1)
      updateData['columnCanvasData.yAxis.minData'] = columnYMin;
      updateData['columnCanvasData.yAxis.maxData'] = columnYMax;
      updateData['columnCanvasData.series'] = [{

        data: tep1
      }];

      updateData['columnCanvasData.xAxis.data'] = temp1
      updateData['columnCanvasData.yAxis.data'] = [
        { x: 0, y: 0, title: '0' },
        { x: 0, y: parseInt((max + 100) / 4), title: parseInt((max + 100) / 4).toString() },
        { x: 0, y: parseInt((max + 100) / 2), title: parseInt((max + 100) / 2).toString() },
        { x: 0, y: parseInt((max + 100) / 4 * 3), title: parseInt((max + 100) / 4 * 3).toString() },
        { x: 0, y: parseInt((max + 100)), title: parseInt((max + 100)).toString() },
      ];

      console.log("柱状图数据：", parseInt((max + 100) / 2), parseInt((max + 100) / 2).toString(), parseInt((max + 100) / 4).toString(), parseInt((max + 100) / 4 * 3).toString())

      that.setData(updateData);
      if (that.data.runData[0].sCount == null || that.data.runData[0].sCount == "" || that.data.runData[0].sCount == undefined || that.data.runData[0].sCount == 0) {
        var cxt_arc = wx.createCanvasContext('canvasArc');
        cxt_arc.setLineWidth(6);
        cxt_arc.setStrokeStyle('#d2d2d2');
        cxt_arc.setLineCap('round')
        cxt_arc.beginPath();//开始一个新的路径    
        cxt_arc.arc(106, 106, 100, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径    
        cxt_arc.stroke();//对当前路径进行描边  

        cxt_arc.setLineWidth(6);
        cxt_arc.setStrokeStyle('#3ea6ff');
        cxt_arc.setLineCap('round')
        cxt_arc.beginPath();//开始一个新的路径    
        cxt_arc.arc(106, 106, 100, - Math.PI * (0) / (max + 100), 0, false);
        cxt_arc.stroke();//对当前路径进行描边
        cxt_arc.draw();
      } else {
        var cxt_arc = wx.createCanvasContext('canvasArc');
        cxt_arc.setLineWidth(6);
        cxt_arc.setStrokeStyle('#d2d2d2');
        cxt_arc.setLineCap('round')
        cxt_arc.beginPath();//开始一个新的路径    
        cxt_arc.arc(106, 106, 100, 0, 2 * Math.PI, false);//设置一个原点(106,106)，半径为100的圆的路径到当前路径    
        cxt_arc.stroke();//对当前路径进行描边  

        cxt_arc.setLineWidth(6);
        cxt_arc.setStrokeStyle('#3ea6ff');
        cxt_arc.setLineCap('round')
        cxt_arc.beginPath();//开始一个新的路径    
        cxt_arc.arc(106, 106, 100, -Math.PI * (that.data.runData[0].sCount) / (max + 100), 0, false);
        cxt_arc.stroke();//对当前路径进行描边       
        cxt_arc.draw();
      }

    }
  },
  onShow: function () {
    let that = this
    that.getResultData(app.globalData.mac)
    that.getPetInfo(app.globalData.connectedDeviceId);
    that.getRunData(app.globalData.mac);

    setTimeout(function () {
      wx.startPullDownRefresh()
      
      that.showData()
      wx.stopPullDownRefresh()
    }, 1000)
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
    console.log("22222");
    let that = this
    wx.notifyBLECharacteristicValueChanged({
      state: false, // 停用notify 功能
      deviceId: "CA:5B:07:08:7F:6F",
      serviceId: app.globalData.serviceId,
      characteristicId: app.globalData.characteristicId,
      success: function (res) {
        console.log("停用notify 功能")
      }
    })
    wx.closeBLEConnection({
      deviceId: "CA:5B:07:08:7F:6F",
      complete: function (res) {
        console.log("断开设备")
        console.log(res)
        app.globalData.deviceconnected = false
        app.globalData.connectedDeviceId = ''
        that.setData({
          receivedata: ""
        })
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this
    that.getResultData(app.globalData.mac)
    that.getPetInfo(app.globalData.connectedDeviceId);
    that.getRunData(app.globalData.mac);

    setTimeout(function () {

      that.showData()
    }, 1000)
    wx.stopPullDownRefresh()
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

  },
  /*灵敏度设置*/




})
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var hours = date.getHours();
  var min = date.getMinutes();
  var secend = date.getSeconds();
  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (min >= 0 && min <= 9) {
    min = "0" + min;
  }
  if (secend >= 0 && secend <= 9) {
    secend = "0" + secend;
  }

  if (month >= 0 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = hours + seperator2 + min + seperator2 + secend;
  return currentdate;
}
function getNowFormatDate1() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  var hours = date.getHours();
  var min = date.getMinutes();
  var secend = date.getSeconds();
  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (min >= 0 && min <= 9) {
    min = "0" + min;
  }
  if (secend >= 0 && secend <= 9) {
    secend = "0" + secend;
  }

  if (month >= 0 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + "" + month + "" + strDate + "" + hours + "" + min + "" + secend;
  return currentdate;
}