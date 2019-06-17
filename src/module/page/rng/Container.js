import { BrowserSolc } from '@/util'
import { createContainer } from '@/util'
import Component from './Component'
import RNGService from '@/service/contracts/rngService'
var curWallet = null
export default createContainer(Component, (state) => {
  async function loadOnInit () {
    load()
  }

  async function load () {
  }

  if (state.user.wallet !== curWallet && !curWallet) {
    curWallet = state.user.wallet
    loadOnInit()
    setInterval(() => {
      load()

    }, 5000)
  }

  return {
    wallet: state.user.wallet,
    balance: state.user.balance,
    code: state.rng.code,
  }
}, () => {
  //const rngService = new RNGService()

  return {
    async send(code) {
      let source = 'contract demo {string public name = "Petros"; function changeName(string _newName){name = _newName; } }'; 
      console.log(BrowserSolc);
      //return await rngService.challenge(entropy, duration)
    },
  }
})
