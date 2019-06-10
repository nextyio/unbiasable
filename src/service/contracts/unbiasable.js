import BaseService from '../../model/BaseService'
import _ from 'lodash'
import { empty } from 'glamor';
import { cutString, weiToMNTY, weiToEthS} from './help'
import { DECIMALS } from '@/constant'

// var BigNumber = require('big-number');
var BigNumber = require('bignumber.js');

export default class extends BaseService {

    async getOrder(_orderType, _id) {
        const store = this.store.getState()
        let methods = store.contracts.unbiasable.methods
        let res = await methods.getOrder(_orderType, _id).call()
        let weiMNTY = _orderType ? BigNumber(await res[2]) : BigNumber(await res[1])
        weiMNTY = weiMNTY.toFixed(0)
        // console.log('weiMNTY', weiMNTY)
        let weiNUSD = _orderType ? BigNumber(await res[1]) : BigNumber(await res[2])
        weiNUSD = weiNUSD.toFixed(0)
        let amount = weiToMNTY(await weiMNTY)
        // let price = NUSDs / 1 MNTY = (weiNUSD / 1e18) / (weiMNTY / 1e24) = 1e6 * weiNUSD / weiMNTY
        let wPrice = BigNumber(await weiNUSD).multipliedBy(BigNumber(10).pow(DECIMALS.mnty)).div(await weiMNTY).div(BigNumber(10).pow(DECIMALS.nusd)) // weiNUSD / 1 MNTY
        // let expo = BigNumber(10).pow(DECIMALS.nusd)
        // let _before = BigNumber(wPrice).div(expo)
        // let _after = BigNumber(wPrice).mod(expo)
        // let price = _before.toString() + '.' + _after.toString()
        let price = wPrice.toFixed(10)
        let order = await {
            'id': _id,
            'maker': cutString(res[0]),
            'amount': amount,
            'price' : price,
            'haveAmount': res[1],
            'wantAmount': res[2],
            'prev': res[3],
            'next': res[4]}
        return await order
    }

    async reload () {
        const unbiasableRedux = this.store.getRedux('unbiasable')
        await this.dispatch(unbiasableRedux.actions.orders_reset())
    }
}
