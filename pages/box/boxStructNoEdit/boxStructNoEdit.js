// pages/box/boxStruct/boxStruct.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    containerId: '',
    category: [],
    toCategory: 'category_0',
    getInterfaceName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var getInterfaceName = options.getInterfaceName;
    // var getInterfaceName = 'selContainerGoodStructCount.do';
    var containerId = options.containerId;
    console.log('containerId:',containerId)
    // var containerId = 'C00000011';
    this.setData({
      getInterfaceName: getInterfaceName
    })
    if(containerId != undefined && containerId != null && containerId != ''){

      this.setData({
        containerId: containerId
      })
    }
    wx.setNavigationBarTitle({
      title: '' + options.title,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.startPullDownRefresh({});
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
    this.getGoodList();

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

  getGoodList: function () {
    const self = this;
    wx.request({
      url: app.globalData.serverIp + 'selCategoryGood.do',
      data: {
        categoryType: '零售',
        valid: '显示',
        conditionParam: 'categoryType|valid'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data)
        self.getGoodListCallback(self, res.data);
        // wx.stopPullDownRefresh();
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },

  getGoodListCallback: function (self, category) {
    category = self.priceAdjustment(category); //价格*100
    self.getStructure(self, category, self.data.containerId, self.data.getInterfaceName);
  },

  priceAdjustment: function (category) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        item[j].price *= 100;
      }
    }
    return tempCategory;
  },


  getStructure: function (self, category, containerId, interfaceName) {
    console.log('containerId:',containerId)
    console.log('interfaceName:',interfaceName)
    wx.request({
      url: app.globalData.serverIp + interfaceName,
      data: {
        containerId: containerId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.getStructureCallback(self, category, res.data); //处理商品结构数量
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },


  getStructureCallback: function (self, category, structs) {
    console.log('structs:', structs)
    //将structs存在map中
    var structsMap = new Map();
    var goodNum = 0;

    for (var i = 0; i < structs.length; i++) {
      structsMap.set(structs[i].goodId, structs[i]);
      goodNum += parseInt(structs[i].goodNum)
    }
    console.log('goodNum:', goodNum)

    //根据map来设置category
    for (var i = 0; i < category.length; i++) {
      var item = category[i].good;
      for (var j = 0; j < item.length; j++) {
        if (structsMap.has(item[j].goodId)) {
          item[j].commodityNum = parseInt(structsMap.get(item[j].goodId).goodNum);
        }
      }
    }
    self.setShowByCategory(category)
    console.log('category1:', category)
    self.setData({
      category: category
    })
    wx.stopPullDownRefresh();
  },

  setShowByCategory: function (category) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var isShow = false;
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        if (item[j].commodityNum > 0) {
          item[j].isShow = true;
          isShow = true;
        } else {
          item[j].isShow = false;
        }
      }
      tempCategory[i].isShow = isShow;
    }
  },

  getStructsByCategory: function (category) {
    var detail = '';
    for (var i = 0; i < category.length; i++) {
      var item = category[i].good;
      for (var j = 0; j < item.length; j++) {
        var good = item[j];
        if (good.commodityNum > 0) {
          detail += 'goodId:' + good.goodId + '&num:' + good.commodityNum + '|'
        }
      }
    }
    detail = detail.substr(0, detail.length - 1);
    console.log(detail);
    return detail;
  },

  chooseCategory: function (e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      toCategory: id,
    })
  },

  subtractGood: function (e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.category, goodId);
    if (goodItem.commodityNum > 0) {
      goodItem.commodityNum--;
    }
    this.setShowByCategory(this.data.category);
    this.setData({
      category: this.data.category,
    })
  },

  addGood: function (e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.category, goodId);
    goodItem.commodityNum = goodItem.commodityNum ? goodItem.commodityNum + 1 : 1;
    console.log(goodItem)
    this.setShowByCategory(this.data.category);
    this.setData({
      category: this.data.category,
    })
  },

  getGoodById: function (category, goodId) {
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


  changeToEdit: function (e) {
    this.setData({
      isEdit: true
    })
    wx.setNavigationBarTitle({
      title: this.data.boxId
    })
  },

  saveCommodityStructure: function (e) {
    var self = this;
    wx.showModal({
      title: '商品结构',
      content: '是否保存',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          self.setStructure(self, self.data.boxId, self.data.category, self.data.setInterfaceName);
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  setStructure: function (self, boxId, category, interfaceName) {
    var goodStructDetail = self.getStructsByCategory(category);
    console.log("goodStructDetail:", goodStructDetail)
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.serverIp + interfaceName,
      data: {
        boxId: boxId,
        goodStructDetail: goodStructDetail
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      success: function (res) {
        wx.hideLoading();
        console.log(res.data);
        self.setData({
          isEdit: false,
          category: []
        });
        wx.startPullDownRefresh({})
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },


})