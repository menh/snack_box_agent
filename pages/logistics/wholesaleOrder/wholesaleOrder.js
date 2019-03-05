// pages/region/school/school.js
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wholesale: {
      wholesaleOrder: {}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var wholesaleOrderId = options.wholesaleOrderId;
    // var wholesaleOrderId = 'W00000001a771O5DL';
    this.data.wholesale.wholesaleOrder.wholesaleOrderId = wholesaleOrderId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.startPullDownRefresh({})
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
    this.getWholesale(this.data.wholesale.wholesaleOrder.wholesaleOrderId);
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


  getWholesale: function (wholesaleOrderId) {
    var self = this;

    wx.request({
      url: app.globalData.serverIp + 'selWholesaleOrder.do',
      data: {
        wholesaleOrderId: wholesaleOrderId,
        conditionParam: 'wholesaleOrderId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log('wholesale', res.data[0])
        self.getWholesaleCallback(self, res.data[0]);
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        console.log("faile");
      }
    })
  },
  getWholesaleCallback: function (self, wholesale) {
    wholesale = this.processOrderTime(wholesale);
    self.setData({
      wholesale: wholesale
    })
  },

  processOrderTime: function (wholesale) {
    wholesale.wholesaleOrder.orderTimeTime = util.getTimeFromDate(wholesale.wholesaleOrder.orderTime);
    wholesale.wholesaleOrder.orderTimeDay = util.getDayFromDate(wholesale.wholesaleOrder.orderTime);
    return wholesale;
  },

})