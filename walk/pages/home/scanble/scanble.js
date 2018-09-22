var app = getApp();

var url = app.url
var temp = []
var util=require("../../../utils/util.js")
Page({
  data: {
    isbluetoothready: true,
    deviceconnected: false,
    devices: [],
    defaultSize: 'default',
    primarySize: 'default',
    warnSize: 'default',
    disabled: false,
    plain: false,
    loading: false,
    searchingstatus: false,
    receivedata: '',
    onreceiving: false,
    connectedDeviceId: '',
    system:'',
    bind:'',
    connectIndex:null
  },
  onLoad: function () {
    var that = this
    that.setData({
      bind: app.globalData.isBind
    })
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          system:res.system
        })
      },
    })
    wx.onBLECharacteristicValueChange(function (characteristic) {
      console.log('characteristic value comed:', characteristic)
      let buffer = characteristic.value
      let dataView = new DataView(buffer)
      console.log("接收字节长度:" + dataView.byteLength)
      var str = ""
      for (var i = 0; i < dataView.byteLength; i++) {
        str += String.fromCharCode(dataView.getUint8(i))
      }
      console.log(str)
      that.setData({
        receivedata: str
      })
    })
  },
  onShow:function(){
    this.searchbluetooth();
    let that=this

  },
  onReady:function(){
  },
  searchbluetooth: function () {
    var that = this
    temp = []
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
      console.log("搜索到的设备：",e)  
      temp.push(e.devices)
      temp.forEach(function (e) {
        var deviceid = ab2hex(e[0].advertisData).toUpperCase().substring(4, ab2hex(e[0].advertisData).length)
        if(deviceid!=null&&deviceid!=''&&deviceid!=undefined){
          deviceid = deviceid.substring(0, 2) + ":" + deviceid.substring(2, 4) + ":" + deviceid.substring(4, 6) + ":" + deviceid.substring(6, 8) + ":" + deviceid.substring(8, 10) + ":" + deviceid.substring(10, 12);
          e[0].localName = deviceid
         
        } 
      })
      //app.globalData.devices = temp
      // console.log("设备列表：", app.globalData.devices)
      // console.log('发现新蓝牙设备-----')
      // console.log('设备id:' + e.devices[0].deviceId)
      // console.log('设备name:' + e.devices[0].name)
      // console.log("排序前：", temp)
     
      
    var temp1=[]
    temp.forEach(function(e){
     // console.log("EEEEEEEEEE",e)
      wx.request({
        url: url+'/device/selectByMac',
        data:{
          mac: e[0].localName
        },
        success:function(r){
          // console.log("res:",r)
          // console.log("res.data.code:", e[0].localName)
              if(r.data.data[0].petId==undefined||r.data.data[0].petId==""){
                // console.log("r.data.data:",r.data.data,e[0])
                temp1.push(e[0])
                // console.log("添加成功", temp1)
                // console.log("temmp1:", temp1)
                for (var i = temp1.length - 1; i > 0; i--) {//让比较的范围不停的减掉最后一个单元
                  for (var j = 1;  j <= i; j++) {
                    if (temp1[j - 1].RSSI < temp1[j].RSSI) {//让2个数之间大的数排后面
                      var tmp = (temp1[j - 1].RSSI);
                      temp1[j - 1].RSSI = temp1[j].RSSI;
                      (temp1[j].RSSI) = tmp;
                    }

                  }
                }
                that.setData({
                  devices: temp1
                })    
                
              }
        }
      })
    })
    
  })
    
  },
connectTO: function (e) {
  //根据设备id判断是否该设备也被其他人占有
  var that = this
  that.setData({
    connectIndex: e.currentTarget.id
  })
  wx.request({
    url: url + '/device/selectByMac',
    data: {
      "mac": e.currentTarget.dataset.mac
    },
    success: function (res) {
      // console.log("设备判定：", res)
      if (res.data.data != null && res.data.data.petId != null) {//绑定宠物即被占用
        wx.showToast({
          title: '设备被占用',
          icon: 'fail',
          duration: 2000,
        })
      } else {//未被占用

        if (app.globalData.deviceconnected) {

          wx.notifyBLECharacteristicValueChanged({
            state: false, // 停用notify 功能
            deviceId: e.currentTarget.dataset.id,
            serviceId: app.globalData.serviceId,
            characteristicId: app.globalData.characteristicId,
            success: function (res) {
              console.log("停用notify 功能")
            }
          })
          wx.closeBLEConnection({
            deviceId: e.currentTarget.dataset.id,
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
          console.log("e.currentTarget.id:", e.currentTarget.dataset.id, );
          wx.createBLEConnection({
            deviceId: e.currentTarget.dataset.id,
            success: function (res) {
              wx.hideLoading()
             
              console.log(res)
              app.globalData.connectedDeviceId = e.currentTarget.dataset.id
              app.globalData.mac = e.currentTarget.dataset.mac
              that.setData({
                deviceconnected: true,
                connectedDeviceId: e.currentTarget.dataset.id,
              })
              app.globalData.deviceconnected = true
              //连接成功后转回主页
              if (that.data.system.includes("Android")) {//安卓手机只存mac
                wx.request({
                  url: url + '/device/insertDevice',
                  responseType:'text',
                  data: {
                    "code": e.currentTarget.dataset.name,
                    "mac": e.currentTarget.dataset.mac,
                    "status": 0,
                    "type": 2,
                    "isLose": 0
                  },
                  success: function (result) {
                    console.log("添加设备:::" + JSON.stringify(result).substring(358,361))
                    console.log("添加设备:::" + JSON.stringify(result))
                    var deviceId = parseInt(JSON.stringify(result).substring(358, 361))
                    app.globalData.connectedDeviceId = e.currentTarget.dataset.id
                    wx.showToast({
                      title: '连接成功',
                      icon: 'success',
                      duration: 1000
                    })
                    wx.notifyBLECharacteristicValueChanged({
                      state: true, // 启用 notify 功能
                      deviceId: e.currentTarget.dataset.id,
                      serviceId: app.globalData.serviceId,
                      characteristicId: app.globalData.characteristicId,
                      success: function (res) {
                        console.log("启用notify:", res)

                      }
                    })
                    wx.getBLEDeviceServices({
                      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                      deviceId: e.currentTarget.dataset.id,
                      success: function (res) {
                        console.log('device services:', res.services)
                        wx.getBLEDeviceCharacteristics({
                          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                          deviceId: e.currentTarget.dataset.id,
                          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                          serviceId: res.services[1].uuid,
                          success: function (r) {
                            console.log('device getBLEDeviceCharacteristics:', r.characteristics)
                            
                            console.log("deviceId:", e.currentTarget.dataset.id, ",serviceId:", res.services[1].uuid, ",Characteristic:", r.characteristics[1].uuid)
                            wx.readBLECharacteristicValue({
                              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
                              deviceId: e.currentTarget.dataset.id,
                              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                              serviceId: res.services[1].uuid,
                              // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                              characteristicId: r.characteristics[1].uuid,
                              success: function (s) {
                                console.log('readBLECharacteristicValue:', s)
                              },
                              fail: function (s) {
                                console.log("readBLECharacteristicValue:", s)
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

                    console.log("app.globalData.petInfo:",app.globalData.petInfo.length)
                    if(app.globalData.petInfo.length==1){//只有一个宠物，直接绑定
                      wx.request({
                        url: url + '/device/update',
                        data: {
                          "id": deviceId,
                          "petId": app.globalData.petInfo[0].petId
                        },
                        success: function (res) {
                          console.log(res)
                          if (res.data.code == 200) {
                            wx.showToast({
                              title: '绑定成功！',
                            })
                            app.globalData.isBind = true
                            wx.switchTab({
                              url: '../home',
                            })
                          } else {
                            wx.showToast({
                              title: "res.data.msg",
                            })
                            app.globalData.isBind = false
                          }
                        }
                      })
                    }else{
                      // wx.switchTab({
                      //   url: '../../userInfo/userInfo',
                      // })
                    }
                  }
                })
              } else if (that.data.system.includes("iOS")) {//ios都存
                wx.request({
                  url: url + '/device/insertDevice',
                  data: {
                    "uuid": e.currentTarget.dataset.id,
                    "code": e.currentTarget.dataset.name,
                    "mac": e.currentTarget.dataset.mac,
                    "status": 0,
                    "type": 2,
                    "isLose": 0
                  },
                  success: function (res1) {
                    console.log("添加设备" + res1)
                    app.globalData.connectedDeviceId = e.currentTarget.dataset.id
                    wx.showToast({
                      title: '连接成功',
                      icon: 'success',
                      duration: 1000
                    })
                    wx.notifyBLECharacteristicValueChanged({
                      state: true, // 启用 notify 功能
                      deviceId: e.currentTarget.dataset.id,
                      serviceId: app.globalData.serviceId,
                      characteristicId: app.globalData.characteristicId,
                      success: function (res) {
                        console.log("启用notify:", res)

                      }
                    })
                    wx.getBLEDeviceServices({
                      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
                      deviceId: e.currentTarget.dataset.id,
                      success: function (res) {
                        console.log('device services:', res.services)
                        wx.getBLEDeviceCharacteristics({
                          // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
                          deviceId: e.currentTarget.dataset.id,
                          // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                          serviceId: res.services[1].uuid,
                          success: function (r) {
                            console.log('device getBLEDeviceCharacteristics:', r.characteristics)
                            wx.notifyBLECharacteristicValueChanged({
                              state: true, // 启用 notify 功能
                              deviceId: e.currentTarget.dataset.id,
                              serviceId: res.services[1].uuid,
                              characteristicId: r.characteristics[1].uuid,
                              success: function (res) {
                                console.log("启用notify:", res)

                              }
                            })
                            console.log("deviceId:", e.currentTarget.dataset.id, ",serviceId:", res.services[1].uuid, ",Characteristic:", r.characteristics[1].uuid)
                            wx.readBLECharacteristicValue({
                              // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接  [**new**]
                              deviceId: e.currentTarget.dataset.id,
                              // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
                              serviceId: res.services[1].uuid,
                              // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
                              characteristicId: r.characteristics[1].uuid,
                              success: function (s) {
                                console.log('readBLECharacteristicValue:', s)
                              },
                              fail: function (s) {
                                console.log("readBLECharacteristicValue:", s)
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

                    if (app.globalData.petInfo.length == 1) {//只有一个宠物，直接绑定
                      wx.request({
                        url: url + '/device/update',
                        data: {
                          "id": res.data.data,
                          "petId": app.globalData.petInfo[0].petId
                        },
                        success: function (res) {
                          console.log(res)
                          if (res.data.code == 200) {
                            wx.showToast({
                              title: '绑定成功！',
                            })
                            app.globalData.isBind = true
                            wx.switchTab({
                              url: '../home',
                            })
                          } else {
                            wx.showToast({
                              title: "res.data.msg",
                            })
                            app.globalData.isBind = false
                          }
                        }
                      })
                    } else {
                      wx.switchTab({
                        url: '../../userInfo/petOwnerInfo/petOwnerInfo',
                      })
                    }
                  }
                })
              }           
            },
            fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: '连接设备失败',
                icon: 'false',
                duration: 1000
              })
              that.setData({
                connected: false
              })
            }
          })
          wx.notifyBLECharacteristicValueChanged({
            state: true, // 启用 notify 功能
            deviceId: e.currentTarget.dataset.id,
            serviceId: app.globalData.serviceId,
            characteristicId: app.globalData.characteristicId,
            success: function (res) {
              console.log("启用notify:", res)

            }
          })
          wx.stopBluetoothDevicesDiscovery({
            success: function (res) {
              console.log("停止蓝牙搜索")
              console.log(res)
            }
          })
        }
      }
    }
  })
},
formSubmit: function (e) {
  console.log('form发生了submit事件，携带数据为：', e.detail.value.senddata)
  var senddata = e.detail.value.senddata;
  var that = this
  let buffer = new ArrayBuffer(senddata.length)
  let dataView = new DataView(buffer)
  for (var i = 0; i < senddata.length; i++) {
    dataView.setUint8(i, senddata.charAt(i).charCodeAt())
  }
  console.log("buffer:",buffer)
  wx.writeBLECharacteristicValue({
    deviceId: that.data.connectedDeviceId,
    serviceId: app.globalData.serviceId,
    characteristicId: app.globalData.characteristicId1,
    value: buffer,
    success: function (res) {
      console.log(res)
      console.log('writeBLECharacteristicValue success', res.errMsg)
    },
    fail:function(res){
      console.log("write fail:",res)
    },
    complete:function(res){
        console.log("complete:",res)
       
    }
  })
},
formReset: function () {
  console.log('form发生了reset事件')
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