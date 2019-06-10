import { createContainer } from '@/util'
import Component from './Component'
import UserService from '@/service/UserService'
import UnbiasableService from '@/service/contracts/unbiasable'
var curWallet = null
export default createContainer(Component, (state) => {
  const userService = new UserService()
  const unbiasableService = new UnbiasableService()

  async function loadOnInit () {
    load()
    // unbiasableService.loadOrders(true)
    // unbiasableService.loadOrders(false)
  }

  async function load () {
    userService.loadBlockNumber()
    userService.getBalance()
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
  }
}, () => {
  const userService = new UserService()
  const unbiasableService = new UnbiasableService()

  return {
    // TEST
    async reload() {
      return await unbiasableService.reload()
    }
  }
})
