// pages/hello/hello.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var clipboardData
    wx.getClipboardData({
      complete(res) {
        clipboardData = res.data;
        var openidModel = 'ocR1W4_-WJJH-SMFgpdDKTmngvew';
        var openid = '';
        var containerId = '';
        if (clipboardData != undefined && clipboardData != null && clipboardData != '') {
          openid = clipboardData.substr(0, openidModel.length)
        }
        if (openid == openidModel) {
          containerId = clipboardData.substr(openidModel.length)
        }
        if (containerId.length == 9) {
          app.globalData.containerId = containerId;
          console.log('containerId:', containerId)
          wx.switchTab({
            url: '/pages/bill/home/home',
            // url: '/pages/logistics/home/home',
          })
        } else {
          wx.startPullDownRefresh({});
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var self = this;
    wx.login({
      success: res => {
        self.getOpenid(self, res.code, app.globalData.appid, app.globalData.secret);
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getOpenid: function(self, code, appid, secret) {
    wx.showLoading({
      title: '正在登录',
    })
    wx.request({
      url: app.globalData.serverIp + 'getWxOpenId.do',
      method: 'POST',
      data: {
        code: code,
        appid: appid,
        secret: secret
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log("openid: " + res.data);
        app.globalData.openid = res.data
        self.getAgent(self, res.data);
      },
      fail: function(res) {
        wx.stopPullDownRefresh();
      }
    })
  },
  getAgent: function(self, openId) {
    wx.request({
      url: app.globalData.serverIp + 'selAgent.do',
      method: 'POST',
      data: {
        openId: openId,
        conditionParam: 'openId'
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res.data);
        wx.stopPullDownRefresh();
        var containerId = null;
        if (res.data.length > 0) {
          containerId = res.data[0].containerId;
        }
        // console.log('containerId:', containerId);
        if (containerId != null && containerId != undefined && containerId.length == 9) {
          wx.hideLoading();
          app.globalData.containerId = containerId;
          console.log('containerId:', containerId)
          wx.switchTab({
            url: '/pages/bill/home/home',
            // url: '/pages/logistics/home/home',
          })
        } else {
          wx.hideLoading();
          app.globalData.containerId = '';
          wx.navigateTo({
            url: '/pages/apply/apply',
          })
        }
      },
      fail: function(res) {
        wx.stopPullDownRefresh();
      }
    })
  },

})