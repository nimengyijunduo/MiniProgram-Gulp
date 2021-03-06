import regeneratorRuntime from '../vendor/runtime.js';
import request from '../service/http/request.js';
import message from './message.js';
const apiRequest = request.getInstance();
const _message = message.getInstance();

export default class login {
  /**
   * [instance  当前实例]
   * @type {this}
   */
  static instance;

  /**
   * [getInstance 获取单例]
   * @method getInstance
   * @return
   */
  static getInstance() {
    if (false === this.instance instanceof this) {
      this.instance = new this();
    }
    return this.instance;
  }

  constructor() {
    this.tmpLoginCb = '';
    // 用户信息
    this.userInfo = {};
  }

  /**
   * 是否登录
   * @return Boolean
   */
  hasToken() {
    if (wx.getStorageSync('token')) return true;
    return false;
  }

  /**
   * 是否登录（弹窗）
   * @return Boolean
   */
  checkToken() {
    if (wx.getStorageSync('token')) return true;
    _message.loginTips();
    return false;
  }

  // 调用loginIfNeed时设置的临时回调函数
  addTmpLoginCb(fn) {
    this.tmpLoginCb = fn;
  }

  removeTmpLoginCb() {
    this.tmpLoginCb = '';
  }

  // 微信快捷登录
  async wxLogin() {
    try {
      return await wx.login();
    } catch (error) {
      this.showToast(error);
    }
  }

  // 微信获取用户信息
  wxUserProfile() {
    return new Promise((resolve, reject) => {
      wx.getUserProfile({
        desc: '获取用户信息',
        success: res => resolve(res),
        faile: err => reject(err)
      });
    });
  }

  /**
   * 检查wx-code是否过期
   * @reuturn Boolean
   */
  async checkCode() {
    try {
      const { errMsg } = await wx.checkSession();
      return Object.is(errMsg, 'checkSession:ok');
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户token
   * @param {Object} params 
   * @return Boolean
   */
  async getToken(params) {
    try {
      const { code: wxCode } = await this.wxLogin();
      const { detail: { encryptedData, iv } } = params;
      wx.showLoading({ title: "登录中" });
      const loginParams = Object.assign({}, { code: wxCode }, { encryptedData, iv });
      const { code, message, data } = await apiRequest.login(loginParams);
      if (Object.is(code, 200)) {
        this.userInfo = data;
        this.saveTokenInfo();
        wx.hideLoading();
        return true;
      } else {
        this.showToast(message);
        wx.hideLoading();
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户信息
   * @return Boolean
   */
  async getUserInfo() {
    try {
      const { code, message, data } = await apiRequest.getUserInfo();
      if (Object.is(code, 200)) {
        this.userInfo = Object.assign(this.userInfo, data);
        return true;
      }
      this.showToast(message);
    } catch (error) {
      return false;
    }
  }

  /**
   * 更新用户信息
   * @param {function} cb
   */
  async updateUserInfo(cb) {
    try {
      const { errMsg, userInfo } = await this.wxUserProfile();
      if (Object.is(errMsg, "getUserProfile:ok")) {
        const { code, message } = await apiRequest.updateUserInfo({
          nick_name: userInfo.nickName,
          avatar_url: userInfo.avatarUrl
        });
        if (Object.is(code, 200)) await this.getUserInfo();
        this.showToast(message);
        cb && cb();
      }
    } catch (error) {
      this.showToast(message);
    }
  }

  saveTokenInfo() {
    wx.setStorage({
      key: 'token',
      data: this.userInfo.token
    });
  }

  showToast(title) {
    wx.showToast({
      title,
      icon: "none",
      duration: 2000
    });
  }
}