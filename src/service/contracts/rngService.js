import BaseService from '../../model/BaseService'
import web3 from 'web3'
import _ from 'lodash'

export default class extends BaseService {

    async challenge(entropy, duration) {
        const store = this.store.getState()
        let wallet = store.user.wallet
        let methods = store.contracts.unbiasable.methods
        let entropyHex = web3.utils.fromAscii(entropy);
        let seed = await methods.calcSeed(wallet, entropyHex).call();
        console.log('entropy', entropy, 'hex', entropyHex, 'seed', seed)
        // send the transaction
        methods.challenge(entropyHex, duration.toString())
            .send({from: wallet})
            .on('error', (error) => {
                console.error(error)
                const rngRedux = this.store.getRedux('rng')
                this.dispatch(rngRedux.actions.seed_reset())
            })
            .on('transactionHash', (hash) => {
                console.log('tx hash', hash)
                // preemptively update the UI
                let rngRedux = this.store.getRedux('rng')
                this.dispatch(rngRedux.actions.seed_update(seed))
            })
            .on('receipt', (receipt) => {
                console.log('receipt', receipt)
                methods.getIteration(seed)
                    .call()
                    .then((iteration) => {
                        console.log('iteration', iteration)
                        let rngRedux = this.store.getRedux('rng')
                        this.dispatch(rngRedux.actions.seed_update(seed))
                        this.dispatch(rngRedux.actions.iteration_update(iteration))
                    })
            })
    }

    async reload(entropy) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        const methods = store.contracts.unbiasable.methods
        const entropyHex = web3.utils.fromAscii(entropy);
        const seed = await methods.calcSeed(wallet, entropyHex).call();
        console.log('entropy', entropy, 'hex', entropyHex, 'seed', seed)
        methods.getState(seed)
            .call()
            .then((stateHex) => {
                const state = web3.utils.toUtf8(stateHex);
                console.log('state hex', stateHex, 'state', state);
                const rngRedux = this.store.getRedux('rng')
                this.dispatch(rngRedux.actions.state_update(state))
            })
        methods.getChallenge(seed)
            .call()
            .then((results) => {
                let i = 0;
                const maker = results[i++];
                const entropy = results[i++];
                const C = results[i++];
                const T = results[i++];
                const Te = results[i++];
                const iteration = results[i++];
                const commitCount = results[i++];
                const validProofHash = results[i++].substr(2);

                const rngRedux = this.store.getRedux('rng')
                this.dispatch(rngRedux.actions.commitCount_update(commitCount))
                if (validProofHash != "0000000000000000000000000000000000000000000000000000000000000000") {
                    this.dispatch(rngRedux.actions.validProofHash_update(validProofHash))
                }
            })
    }
}
