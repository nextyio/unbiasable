import BaseRedux from '@/model/BaseRedux'

class UserRedux extends BaseRedux {
  defineTypes () {
    return ['user']
  }

  defineDefaultState () {
    return {
      is_login: false,
      is_admin: false,

      login_form: {
        privatekey: '',
        loading: false
      },

      web3: null,
      blockNumber: 0,
      wallet: null,
      balance: 0,
      loginMetamask: true,
      profile: null,
    }
  }
}

export default new UserRedux()
