import BaseService from '../../model/BaseService'
import _ from 'lodash'
import { empty } from 'glamor';
import { cutString, weiToMNTY, weiToEthS} from './help'
import { DECIMALS } from '@/constant'

// var BigNumber = require('big-number');
var BigNumber = require('bignumber.js');

export default class extends BaseService {

    async challenge(_entropy, _duration) {
        const store = this.store.getState()
        let wallet = store.user.wallet
        let methods = store.contracts.unbiasable.methods
        let entropyHex = web3.fromAscii(_entropy);
        console.log('entropy', _entropy, 'hex', entropyHex)
        // send the transaction
        methods.challenge(entropyHex, _duration.toString())
            .send({from: wallet})
            .on('error', (error) => {
                console.error(error)
                const unbiasableRedux = this.store.getRedux('unbiasable')
                this.dispatch(unbiasableRedux.actions.seed_reset())
            })
            .on('transactionHash', (hash) => {
                console.log('tx hash', hash)
                // preemptively update the UI
                methods.calcSeed(wallet, entropyHex)
                    .call()
                    .then((seed) => {
                        console.log('seed', seed)
                        methods.getIteration(seed)
                            .call()
                            .then((iteration) => {
                                const unbiasableRedux = this.store.getRedux('unbiasable')
                                this.dispatch(unbiasableRedux.actions.seed_update(seed))
                                this.dispatch(unbiasableRedux.actions.iteration_update(iteration))
                            })
                    })
            })
            // .on('receipt', (receipt) => {
            //     console.log(receipt)
            // })
            // .on('confirmation', (number, receipt) => {
            //     // TODO: mark the button confirmed here
            // })
    }

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
        console.log(unbiasableRedux.actions)
        await this.dispatch(unbiasableRedux.actions.seed_reset())
    }
}
