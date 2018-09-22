// pages/petOwnerInfo/petOwnerInfo.js
var app = getApp();

var url = app.url
var util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: {},
    pets: {},
    picture: '',
    logo: '',
    text: '点击上传',
    id: '',
    bindText: '',
    bindIndex:null,
    bind:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.isBind){
      this.setData({
        bindText: '解绑',
        bind:true
      })
    }else{
      this.setData({
        bindText: '绑定',
        bind: false
      })
    }
  },
  chooseImageTap: function (e) {
    let _this = this;
    _this.setData({
      picture: '',
      id: ''
    })
    console.log("头像id：", e)
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album', e.currentTarget.dataset.id, e.currentTarget.dataset.petid)
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera', e.currentTarget.dataset.id, e.currentTarget.dataset.petid)
          }
        }
      }
    })

  },
  chooseWxImage: function (type, id, petId) {
    let _this = this;
    var pics = []
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        console.log(res);
        //然后上传图片
        var imgsrc = res.tempFilePaths;
        pics = pics.concat(imgsrc);
        _this.setData({
          logo: pics
        })
        _this.uoloadImg(id, petId)
      }
    })
  },
  uoloadImg: function (id, petId) {
    let that = this
    var pics = this.data.logo;
    that.uploadimg({
      url: url + '/users/uploadAndReadPicture',//这里是你图片上传的接口
      path: pics,  //这里是选取的图片的地址数组,
      id: id,
      petId: petId,
    });
  },
  addPet: function () {
    var that = this
    var id = that.data.users.id
    wx.navigateTo({
      url: 'addPet/addPet?id=' + that.data.users.id,
    })
  },
  uploadimg: function (data) {
    var that = this,
      i = data.i ? data.i : 0,//当前上传的哪张图片
      success = data.success ? data.success : 0,//上传成功的个数
      fail = data.fail ? data.fail : 0;//上传失败的个数
    console.log("data.path[i]", data.path[i])
    console.log(data.url)
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'file',//这里根据自己的实际情况改
      formData: null,//这里是上传图片时一起上传的数据
      header: { "Content-Type": "multipart/form-data" },
      success: (resp) => {
        var data1 = JSON.stringify(resp.data);
        //   data = data.replace(/\n\t/g, "\\n\\t").replace(/\n/g,"\\n");//重点
        // console.log('data', data)
        var result = JSON.parse(data1);
        result = JSON.parse(result)
        console.log("图片：", resp, result.string)
        console.log("resp", resp)
        var temp = []
        if (result.code == 200) {
          success++;//图片上传成功，图片上传成功的变量+1 
          temp = temp.concat(result.string)
          that.setData({
            picture: temp
          })
          console.log("111:", that.data.picture);
          //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
          console.log("data.id", data.id)
          console.log("that.users.id:", that.data.users.id)
          if (data.id == 0) {//用户头像
            wx.request({
              url: url + '/users/updateUserInfo',
              data: {
                'id': that.data.users.id,
                'portrait': that.data.picture[0]
              },
              success: function (res) {
                console.log("修改信息：", res)
                wx.redirectTo({
                  url: '../petOwnerInfo/petOwnerInfo',
                })
              }
            })
          } else if (data.id == 1) {//宠物头像
            console.log("data.petId:", data.petId)
            wx.request({
              url: url + '/pet/updatePet',
              data: {
                'id': data.petId,
                'portrait': that.data.picture[0]
              },
              success: function (res) {
                console.log("修改信息：", res)
                wx.redirectTo({
                  url: '../petOwnerInfo/petOwnerInfo',
                })
              }
            })
          }
        }
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        console.log(i);
        i++;//这个图片执行完上传后，开始上传下一张
        if (i == data.path.length) {   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
        } else {//若图片还没有传完，则继续调用函数
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }

      }
    });
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

  bindPet: function (e) {
    console.log(e)
    var that = this
    console.log("app.globalData.connectedDeviceId:::",app.globalData.connectedDeviceId)
    that.setData({
      bindIndex: e.currentTarget.id
    })
    if (app.systemInfo.system.includes("Android")){
      wx.request({
        url: url + '/device/selectByMac',
        data: {
          "mac": app.globalData.connectedDeviceId
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 200) {
            if (res.data.data[0].petId == null) {//未绑定的情况下
              wx.showModal({
                title: '提示',
                content: '请确认是否要将该宠物绑定至您的蓝牙计步器？',
                confirmColor: '#007aff',
                cancelColor: '#007aff',
                confirmText: '是',
                cancelText: '否',
                success: function (res1) {
                  if (res1.confirm) {
                    console.log('用户点击了确认')
                    console.log("deviceId", app.globalData.connectedDeviceId)
                    wx.request({
                      url: url + '/device/update',
                      data: {
                        "id": res.data.data[0].id,
                        "petId": e.currentTarget.dataset.id
                      },
                      success: function (r) {
                        console.log(r)
                        if (r.data.code == 200) {

                          wx.showToast({
                            title: '绑定成功！',
                          })
                          that.setData({
                            bindText: '解绑'
                          })
                          that.getUserInfo()
                          app.globalData.isBind = true
                          app.globalData.connectedDeviceId = res.data.data[0].mac
                          that.setData({
                            bind:true
                          })
                        } else {
                          wx.showToast({
                            title: res.data.msg,
                          })
                          app.globalData.isBind = false
                          that.setData({
                            bind: false
                          })
                        }
                      }
                    })
                  }
                }
              })

            } else {//已绑定就解除绑定
              //先关闭设备连接
              wx.showModal({
                title: '提示',
                content: '请确认是否要解除绑定,解绑后需要重新登录才能连接其他设备？',
                confirmColor: '#007aff',
                cancelColor: '#007aff',
                confirmText: '是',
                cancelText: '否',
                success: function (res1) {
                  if (res1.confirm) {
                    wx.request({
                      url: url + '/device/deleteByMac',
                      data: {
                        "mac": app.globalData.connectedDeviceId
                      },
                      success: function (res) {
                        console.log(res)

                        if (res.data.code == 200) {
                          that.setData({
                            bindText: '绑定'
                          })
                          app.globalData.isBind = false
                          that.setData({
                            bind: false
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
                          wx.showToast({
                            title: '解绑成功',
                            icon: 'success',
                            duration: 1000
                          })
                        } else {
                          wx.showToast({
                            title: '解绑失败',
                            icon: 'fail',
                            duration: 1000
                          })
                          that.setData({
                            bind: true
                          })
                          app.globalData.isBind = true
                        }
                      }
                    })
                  }

                }
              })

            }

          } else {
            wx.showToast({
              title: '设备不存在',
            })
          }
        }
      })

    } else if (app.systemInfo.system.includes("iOS")){
      wx.request({
        url: url + '/device/selectBySnumber',
        data: {
          "sNumber": app.globalData.connectedDeviceId
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 200) {

            if (res.data.data.petId == null) {//未绑定的情况下
              wx.showModal({
                title: '提示',
                content: '请确认是否要将该宠物绑定至您的蓝牙计步器？',
                confirmColor: '#007aff',
                cancelColor: '#007aff',
                confirmText: '是',
                cancelText: '否',
                success: function (res1) {
                  if (res1.confirm) {
                    console.log('用户点击了确认')
                    console.log("deviceId", app.globalData.connectedDeviceId)
                    wx.request({
                      url: url + '/device/update',
                      data: {
                        "id": res.data.data.id,
                        "petId": e.currentTarget.dataset.id
                      },
                      success: function (res) {
                        console.log(res)
                        if (res.data.code == 200) {

                          wx.showToast({
                            title: '绑定成功！',
                          })
                          that.getUserInfo()
                          that.setData({
                            bindText: '解绑'
                          })
                          app.globalData.isBind = true
                        } else {
                          wx.showToast({
                            title: res.data.msg,
                          })
                          app.globalData.isBind = false
                        }
                      }
                    })
                  }
                }
              })

            } else {//已绑定就解除绑定
              //先关闭设备连接
              wx.showModal({
                title: '提示',
                content: '请确认是否要解除绑定,解绑后需要重新登录才能连接其他设备？',
                confirmColor: '#007aff',
                cancelColor: '#007aff',
                confirmText: '是',
                cancelText: '否',
                success: function (res1) {
                  if (res1.confirm) {
                    wx.request({
                      url: url + '/device/deleteBySnumber',
                      data: {
                        "sNumber": app.globalData.connectedDeviceId
                      },
                      success: function (res) {
                        console.log(res)

                        if (res.data.code == 200) {
                          that.setData({
                            bindText: '绑定'
                          })
                          app.globalData.isBind = false

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
                          wx.showToast({
                            title: '解绑成功',
                            icon: 'success',
                            duration: 1000
                          })
                        } else {
                          wx.showToast({
                            title: '解绑失败',
                            icon: 'fail',
                            duration: 1000
                          })
                        }
                      }
                    })
                  }

                }
              })

            }

          } else {
            wx.showToast({
              title: '设备不存在',
            })
          }
        }
      })

    }
   

  },
  edit: function (e) {
    let that = this
    console.log("修改用户信息：", e)
    wx.navigateTo({
      url: 'editUserInfo/edit?id=' + e.currentTarget.dataset.id + '&users=' + that.data.users.id + "&petId=" + e.currentTarget.dataset.petid + "&value=" + e.currentTarget.dataset.value 
    })
  },

  formSubmit: function (e) {
    console.log(e.detail.target.dataset.id)
    console.log("提交事件：", e.detail.value)
    wx.request({
      url: url + '/users/updateUserInfo',
      data: {
        'id': e.detail.target.dataset.id,
        'name': e.detail.value.name,
        'nickname': e.detail.value.nickname,
        'province': e.detail.value.province,
        'city': e.detail.value.city,
      },
      success: function (res) {
        console.log("修改信息：", res)
      }
    })
  },
  getUserInfo:function(){
    let that = this
    wx.getStorage({
      key: 'unionId',
      success: function (res) {
        console.log("unionId:", res.data)
        wx.request({
          url: url + '/users/findUserAndPets',
          data: {
            "unionId": res.data
          },
          success: function (res) {
            console.log("selectUserInfo:", res)
            var tep = []

            if (res.data.data.pets[0] != null && res.data.data.pets[0].petName != null) {//宠物存在
              app.globalData.petInfo = res.data.data.pets
              res.data.data.pets.forEach(function (e) {

                if (e.birthday != null) {
                  e.birthday = e.birthday.substring(0, 10)
                  // console.log("转换后日期：", e.birthday)
                }
                var temp = { "id": e.petId, "birthday": e.birthday, "name": e.petName, "portrait": e.petPortrait, "sex": e.sex, "type": e.type, "typeName": e.typeName, }
                tep.push(temp)
              })
              that.setData(
                {
                  users: res.data.data.users,
                  pets: tep,
                  picture: res.data.data.users.portrait,
                }
              )
            } else {//没有已绑定宠物，查出用户所有的宠物
              wx.getStorage({
                key: 'userId',
                success: function (res) {
                  wx.request({
                    url: url + '/pet/selectByUserId',
                    data: {
                      "userId": res.data
                    },
                    success: function (e) {
                      console.log("未绑定宠物：", e)
                      console.log(app.globalData.userInfo)
                      console.log()
                      e.data.data.pets.forEach(function (e) {
                        console.log(e.birthday)
                        var timestamp = Date.parse(e.birthday);
                        if (e.birthday != null) {
                          e.birthday = util.formatTime(timestamp / 1000, "Y-M-D")
                          console.log(e.birthday)
                        }

                      })
                      app.globalData.petInfo = res.data.data.pets
                      that.setData(
                        {
                          users: app.globalData.userInfo,
                          pets: res.data.data.pets,
                          picture: app.globalData.userInfo.portrait,
                        }
                      )
                    }
                  })
                },
                fail: function (res) {
                  console.log()
                  // wx.showToast({
                  //   title: res.,
                  // })
                }
              })

            }
            console.log("宠物：", res.data.data.pets)
          }
        })
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
    this.getUserInfo();
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