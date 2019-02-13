//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    const self = this;
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  globalData: {
    userInfo: null,
    //serverIp: 'http://localhost:8080/bubee/',
    //serverIp: 'http://203.195.196.254/snack_box_http/',
    // serverIp: 'https://www.gzfjcyd.com/snack_box_http/',
    serverIp: 'https://www.gzfjcyd.com/snack_box_backstage/',
    openid: '',
    containerId:'',
    appid: 'wx0b3f5ce875196cd9',
    secret: "29fa6ecc4a869114f49d422b3a33fcde",
    mchId: "1505544541",
    orderSureCates:[],
  }
})