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
    seed: state.rng.seed,
    iteration: state.rng.iteration,
    state: state.rng.state,
    commitCount: state.rng.commitCount,
    validProofHash: state.rng.validProofHash,
  }
}, () => {
  const rngService = new RNGService()

  return {
    async reload(entropy) {
      return await rngService.reload(entropy)
    },
    async challenge(entropy, duration) {
      return await rngService.challenge(entropy, duration)
    },
  }
})
