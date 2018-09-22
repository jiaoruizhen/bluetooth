// pages/findPet/myPublish/myPublish.js
var app = getApp();
var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loseInfoView:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getMyPublish()
  },

  getMyPublish:function(){
    let that =this 
    wx.getStorage({
      key: 'userId',
      success: function(res) {
        console.log(res)
        if(res.data!=null){
          wx.request({
            url: url +'/lose/findByUserId',
            data:{
              "userId":res.data
            },
          success:function(e){
            console.log("我的发布：",e)
            if(e.data.code==200){
              if (e.data.data[0] == null || e.data.data[0] == "" || e.data.data[0] == undefined) {
                wx.showModal({
                  title: '提示',
                  content: '您还未发布信息，是否需要去发布？',
                  confirmColor: '#007aff',
                  cancelColor: '#007aff',
                  confirmText: '是',
                  cancelText: '否',
                  success: function (res1) {
                    if (res1.confirm) {
                        wx.redirectTo({
                          url: '../addFind/addFind',
                        })
                    } else if (res1.cancel){
                      wx.switchTab({
                        url:'../findPet/findPet',
                      })
                    }
                  }
                })
              }  else{
                that.setData({
                  loseInfoView: e.data.data
                })
              }
             
            } else if (e.data.code == 606){
              wx.showModal({
                title: '提示',
                content: '您还未发布信息，是否需要去发布？',
                confirmColor: '#007aff',
                cancelColor: '#007aff',
                confirmText: '是',
                cancelText: '否',
                success: function (res1) {
                  if (res1.confirm) {
                    wx.redirectTo({
                      url: '../addFind/addFind',
                    })
                  }
                }
              })
            }else{
              
            } 
          }
          })
        }
        },
        fail:function(res){
            console.log(res)
        }
    })  
  },
  cancel:function(e){
    var that=this
    if (e.currentTarget.dataset.item==0){//取消
      wx.showModal({
        title: '提示',
        content: "请确认是否要取消发布此条信息？",
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            wx.request({
              url: url + '/lose/update',
              data: {
                "id": e.currentTarget.dataset.id,
                "status": "2"
              },
              success: function (res) {
                console.log(res)
                if (res.data.code == 200) {
                  wx.showToast({
                    title: '取消成功！',
                  })
                  that.getMyPublish()
                } else {
                  wx.showToast({
                    title: '取消失败！',
                  })
                }
              }
            })
          }

        }
      })
    } else if (e.currentTarget.dataset.item == 1){
      wx.showModal({
        title: '提示',
        content: "恭喜您已找回您的爱宠，是否要将此条信息更改为已找回？",
        confirmColor: '#007aff',
        cancelColor: '#007aff',
        confirmText: '是',
        cancelText: '否',
        success: function (res1) {
          if (res1.confirm) {
            wx.request({
              url: url + '/lose/update',
              data: {
                "id": e.currentTarget.dataset.id,
                "status": "1"
              },
              success: function (res) {
                console.log(res)
                if (res.data.code == 200) {
                  wx.showToast({
                    title: '修改成功！',
                  })
                  that.getMyPublish()
                } else {
                  wx.showToast({
                    title: '修改失败！',
                  })
                }
              }
            })
          }

        }
      })  
    }
   
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