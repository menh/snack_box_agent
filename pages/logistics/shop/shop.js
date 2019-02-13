// pages/logistics/shop/shop.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cates: [],
    goodCartFlag: true,
    goodCartData: {
      num: 0,
      price: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getCategory();
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
  getCategory: function() {
    var self = this;

    wx.request({
      url: app.globalData.serverIp + 'selCategoryGood.do',
      data: {
        categoryType: '批发',
        valid: '显示',
        conditionParam: 'valid'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        self.getCategoryCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function(res) {
        console.log("faile");
      }
    })
  },
  getCategoryCallback: function(self, categoryGoods) {
    categoryGoods = self.priceAdjustment(categoryGoods); //价格*100

    // var cates = self.categorysFilter(categoryGoods);//从全部category中提取应该显示的
    // var cates = self.initCommodityNum(cates);//从全部category中提取应该显示的

    var cates = self.initCommodityNum(categoryGoods); //从全部category中提取应该显示的


    self.setData({
      cates: cates
    })
    console.log('cates:',cates)
  },


  priceAdjustment: function(category) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        item[j].price *= 100;
      }
    }
    return tempCategory;
  },

  categorysFilter: function(categoryGoods) {
    var cates = [];
    for (var i = 0; i < categoryGoods.length; i++) {
      var category = categoryGoods[i].category;
      var good = categoryGoods[i].good;
      var cate = {
        category: category,
        good: []
      };
      for (var j = 0; j < good.length; j++) {
        var goodItem = good[j];
        if (goodItem.valid == '显示') {
          cate.good.push(goodItem);
        }
      }
      if (cate.good.length > 0) {
        cates.push(cate);
      }
    }
    return cates;
  },


  chooseCategory: function(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      toCategory: id,
    })
  },

  initCommodityNum: function(cates) {
    for (var i = 0; i < cates.length; i++) {
      var good = cates[i].good;
      for (var j = 0; j < good.length; j++) {
        good[j].commodityNum = 0;
      }
    }
    return cates;
  },


  subtractGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.cates, goodId);
    if (goodItem.commodityNum > 0) {
      goodItem.commodityNum--;
    }
    this.refreshgoodCartData(this, this.data.cates);
    this.setData({
      cates: this.data.cates,
    })
  },

  addGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.cates, goodId);
    goodItem.commodityNum++;
    console.log(goodItem);
    this.refreshgoodCartData(this, this.data.cates);
    this.setData({
      cates: this.data.cates,
    })
  },
  getGoodById: function(category, goodId) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        if (item[j].goodId == goodId) {
          return item[j];
        }
      }
    }
    return '';
  },
  refreshgoodCartData: function(self, cates) {
    var goodCartData = {
      num: 0,
      price: 0
    };

    for (var i = 0; i < cates.length; i++) {
      var good = cates[i].good;
      for (var j = 0; j < good.length; j++) {
        var goodItem = good[j];
        if (goodItem.commodityNum != 0) {
          goodCartData.num += goodItem.commodityNum;
          goodCartData.price += (goodItem.commodityNum * goodItem.price)
        }
      }
    }
    self.setData({
      goodCartData: goodCartData
    })
  },
  showGoodCart: function(e) {
    this.setData({
      goodCartFlag: false
    })
  },
  hideGoodCart: function(e) {
    this.setData({
      goodCartFlag: true
    })
  },
  submit: function(e) {

    var url = '/pages/logistics/orderSure/orderSure?price='+this.data.goodCartData.price;
    app.globalData.orderSureCates = this.data.cates;
    wx.navigateTo({
      url: url
    });
  }
})