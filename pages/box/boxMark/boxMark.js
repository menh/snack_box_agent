// pages/box/boxMark/boxMark.js
const app = getApp()
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    applys: [],
    boxId: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var boxId = options.boxId;
    this.setData({
      boxId: boxId
    })
    wx.setNavigationBarTitle({
      title: boxId + '号盒子备注'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.startPullDownRefresh({});
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
    //盒子信息与本期订单
    this.getApplys(this.data.boxId);
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


  getApplys: function(boxId) {
    console.log(boxId)
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selApplyBoxData.do',
      data: {
        boxId: boxId,
        conditionParam: 'boxId',
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        self.getApplysCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function(res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })

  },

  getApplysCallback: function(self, applys) {
    applys = self.processDate(applys); //对时间进行处理
    self.setData({ //更新box，及其显示模式
      applys: applys.reverse()
    })
    console.log('applys:', applys)
  },

  processDate: function(applys) {
    for (var i = 0; i < applys.length; i++) {
      var apply = applys[i];
      apply.applyTimeDay = util.getDayFromDate(apply.applyTime)
      if (apply.mark == undefined || apply.mark == null) {
        apply.mark = '';
      }
    }
    return applys;
  }
})