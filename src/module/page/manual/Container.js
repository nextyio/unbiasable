import { createContainer } from '@/util'
import Component from './Component'
import ManualService from '@/service/contracts/manualService'

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
    evaluating: state.manual.evaluating,
    proof: state.manual.proof,
  }
}, () => {
  const manualService = new ManualService()

  return {
    async commit(seed, iteration, proof) {
      return await manualService.commit(seed, iteration, proof)
    },
    async verify(seed, iteration, proof) {
      return await manualService.verify(seed, iteration, proof)
    },
  }
})
