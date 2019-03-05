// pages/apply/apply.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    agent: {
      openid: '',
      name: '',
      nickName: '',
      phone: '',
      wechatAvatar: '',
      mark: '',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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

  editInputChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'name') {
      this.data.agent.name = value;
    } else if (name == 'phone') {
      this.data.agent.phone = value;
    } else if (name == 'mark') {
      this.data.agent.mark = value;
    }
  },

  editSubmit: function(e) {
    if (e.detail.userInfo != undefined) {
      console.log(e.detail.userInfo)
      var userInfo = e.detail.userInfo;
      this.data.agent.nickName = userInfo.nickName;
      this.data.agent.wechatAvatar = userInfo.avatarUrl;
      this.data.agent.openid = app.globalData.openid;

      if (this.checkInput(this.data.agent)) {
        var agent = this.data.agent;
        var phoneNumber = '15013149789'
        var param = '' + agent.name + '|' + agent.phone + '|' + agent.nickName + '|' + agent.wechatAvatar + '|' + agent.openid + '|' + (agent.mark.length > 0 ? agent.mark : '无');
        var templateId = '281024'
        this.sendMessage(phoneNumber, param, templateId);
      } else {
        wx.showModal({
          content: '请填写全部目录信息',
          showCancel: false
        })
      }
    }
  },

  checkInput: function(agent) {
    console.log(agent)
    if (agent.name.length < 1) {
      return false;
    } else if (agent.phone.length != 11) {
      return false;
    }
    return true;
  },
  sendMessage: function(phoneNumber, param, templateId) {
    var self = this;
    wx.showLoading({
      title: '正在提交',
    })
    wx.request({
      url: app.globalData.serverIp + 'SendMessage.do',
      data: {
        phoneNumber: phoneNumber,
        param: param,
        templateId: templateId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        wx.hideLoading();
        console.log(res.data);
        wx.showModal({
          title: '申请成功',
          content: '您的申请已发送成功',
          showCancel: false,
          confirmText: '确定',
          success: function(res) {
            wx.reLaunch({
              url: '/pages/hello/hello',
            })
          }
        })
      },
      fail: function(res) {
        console.log(res.data);
        console.log("faile");
      }
    })
  }

})