const regionList = require('../../utils/region.js')
const app = getApp()
const url = 'http://invite.m960.cn/tb/'
var chinaIndex
regionList.forEach(function (item, index) {
  item.fullname = '+' + item.id + ' ' + item.cname
  if (item.id == 86) {
    chinaIndex = index
  }
})

Page({
  onShareAppMessage: function (res) {
    console.log(res)
    return {
      title: '注册领取TB币',
      path: '/pages/index/index?code=' + this.data.inviteCode,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  data: {
    step: 0,
    phone: '',
    code: '',
    myInvitor: '',
    focus: false,
    codeDisable: false,
    regionIndex: chinaIndex,
    regionId: 86,
    balance: 0,
    inviteCode: 'xxx',
    regionList: regionList,
    countDown: -1,
    ranking: [],
    invitees: []
  },
  bindRegionChange: function (event) {
    this.setData({
      regionId: this.data.regionList[event.detail.value].id,
      regionIndex: event.detail.value
    })
  },
  onInput: function (event) {
    this.setData({
      phone: event.detail.value
    })
  },
  onCodeInput: function (event) {
    this.setData({
      code: event.detail.value
    })
    if (event.detail.value.length === 4) {
      this.setData({
        focus: false
      })
      this.submit()
    }
  },
  saveQrcode: function () {
    wx.getImageInfo({
      src: '../../assets/wechat-thinkbit.jpg',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.path,
          success: function () {
            wx.showToast({
              icon: 'none',
              duration: 3000,
              title: '官方群二维码已保存至相册'
            })
          },
          fail: function (res) {
            wx.showToast({
              icon: 'none',
              title: JSON.stringify(res)
            })
          }
        })
      }
    })
  },
  shareInviteCode: function () {
    wx.navigateTo({
      url: '../tg/tg'
    })
  },
  copyInviteCode: function () {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({title: '已复制'})
          }
        })
      }
    })
  },
  count: function () {
    var vm = this
    setTimeout(function () {
      vm.setData({
        countDown: vm.data.countDown - 1
      })
      if (vm.countDown > 0) {
        vm.count()
      }
    }, 1000)
  },
  onFocus: function () {
    this.setData({
      focus: true
    })
  },
  getCode: function () {
    if (!this.data.phone) {
      return wx.showToast({
        icon: 'none',
        title: '请输入手机号码'
      })
    }
    wx.showLoading()
    var vm = this
    wx.request({
      url: url + 'sign/code',
      method: 'POST',
      dataType: 'json',
      data: {
        region_id: vm.data.regionId,
        phone: vm.data.phone
      },
      header: {
        sid: vm.getSid('sid'),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (response) {
        var res = response.data
        if (res.code) {
          wx.showToast({
            icon: 'nonen',
            title: res.message
          })
        } else {
          vm.setData({
            step: 2,
            focus: true,
            countDown: 60
          })
          vm.count()
        }
      },
      fail: function () {},
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  submit: function () {
    wx.showLoading()
    var vm = this
    vm.setData({
      codeDisable: true
    })
    var param = {
      phone: vm.data.phone,
      code: vm.data.code,
      invator: vm.data.myInvitor
    }
    wx.request({
      url: url + 'sign/signin',
      method: 'POST',
      dataType: 'json',
      data: param,
      header: {
        sid: vm.getSid(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (response) {
        var res = response.data
        console.log(res)
        if (res.code) {
          wx.showToast({
            icon: 'none',
            title: '验证码错误'
          })
          return vm.setData({
            codeDisable: false
          })
        } else {
          vm.setSid(res.data.sid)
          vm.fetch()
        }
      },
      fail: function (res) {
        wx.showToast({
          icon: 'none',
          title: '注册失败'
        })
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })
  },
  openRule: function () {
    wx.navigateTo({
      url: '../rule/rule'
    })
  },
  fetch: function () {
    var vm = this
    var sid = vm.getSid('sid')
    if (!sid) {
      return vm.setData({
        step: 1
      })
    }
    wx.request({
      url: url + 'profile',
      method: 'POST',
      dataType: 'json',
      header: {
        sid: sid,
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (response) {
        var res = response.data
        console.log(res)
        if (res.code) {
          vm.setData({
            step: 1
          })
        } else {
          vm.setData({
            step: 3,
            inviteCode: res.data.invator,
            balance: res.data.total,
            ranking: res.data.ranking,
            invitees: res.data.invitees
          })
        }
        if (res.data && res.data.sid) {
          vm.setSid(res.data.sid)
        }
      },
      fail: function (res) {
        vm.setData({
          step: 1
        })
      }
    })
  },
  setSid: function (sid) {
    try {
      wx.setStorageSync('sid', sid)
    } catch (e) {
      console.log('set sid error.')
    }
  },
  getSid: function () {
    var sid = ''
    try {
      sid = wx.getStorageSync('sid')
    } catch (e) {
      console.log('get sid error.')
    }
    return sid
  },
  onLoad: function (options) {
    var vm = this
    if (options.code) {
      this.setData({
        myInvitor: options.code
      })
    }
    this.fetch()
  }
})
