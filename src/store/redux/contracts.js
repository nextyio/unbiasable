import BaseRedux from '@/model/BaseRedux'

class ContractRedux extends BaseRedux {
  defineTypes () {
    return ['contracts']
  }

  defineDefaultState () {
    return {
      web3: null,
      unbiasable: null,
      manual: null,
    }
  }
}

export default new ContractRedux()
