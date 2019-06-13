import BaseService from '../../model/BaseService'
import _ from 'lodash'
import { empty } from 'glamor';
import { cutString, weiToCoin, weiToEthS} from './help'
import { DECIMALS } from '@/constant'

// var BigNumber = require('big-number');
var BigNumber = require('bignumber.js');

export default class extends BaseService {

    async challenge(_entropy, _duration) {
        const store = this.store.getState()
        let wallet = store.user.wallet
        let methods = store.contracts.unbiasable.methods
        let entropyHex = web3.fromAscii(_entropy);
        let seed = await methods.calcSeed(wallet, entropyHex).call();
        console.log('entropy', _entropy, 'hex', entropyHex, 'seed', seed)
        // send the transaction
        methods.challenge(entropyHex, _duration.toString())
            .send({from: wallet})
            .on('error', (error) => {
                console.error(error)
                const unbiasableRedux = this.store.getRedux('rng')
                this.dispatch(unbiasableRedux.actions.seed_reset())
            })
            .on('transactionHash', (hash) => {
                console.log('tx hash', hash)
                // preemptively update the UI
                let unbiasableRedux = this.store.getRedux('rng')
                this.dispatch(unbiasableRedux.actions.seed_update(seed))
            })
            .on('receipt', (receipt) => {
                console.log('receipt', receipt)
                methods.getIteration(seed)
                    .call()
                    .then((iteration) => {
                        console.log('iteration', iteration)
                        let unbiasableRedux = this.store.getRedux('rng')
                        this.dispatch(unbiasableRedux.actions.seed_update(seed))
                        this.dispatch(unbiasableRedux.actions.iteration_update(iteration))
                    })
            })
    }

    async reload () {
        const unbiasableRedux = this.store.getRedux('rng')
        console.log(unbiasableRedux.actions)
        await this.dispatch(unbiasableRedux.actions.seed_reset())
    }
}
