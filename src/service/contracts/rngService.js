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
        methods.challenge(2048, entropyHex, duration.toString())
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
                console.log(results);
                const Te = results.Te;
                const commitCount = results.commitCount;
                const validOutputHash = results.validOutputHash.substr(2);

                const rngRedux = this.store.getRedux('rng')
                this.dispatch(rngRedux.actions.commitCount_update(commitCount))
                if (validOutputHash != "0000000000000000000000000000000000000000000000000000000000000000") {
                    this.dispatch(rngRedux.actions.validProofHash_update(validOutputHash))
                    methods.results(seed)
                        .call()
                        .then((results) => {
                            console.log(Te);
                            console.log(results);
                            const numbers = results.numbers;
                            const evaluators = results.evaluators;
                            // TODO: make sure evaluators is sorted by number if it isn't
                            let winners = [];
                            const r = 1/2;
                            let rr = 1;
                            for (let i = 0; i < numbers.length; ++i) {
                                if (evaluators[i] !== '0x0000000000000000000000000000000000000000') {
                                    if (winners.length > 0) {
                                        let j = winners.length - 1;
                                        let delta = numbers[i] - winners[j].number;
                                        winners[j].delta = delta;
                                        winners[j].reward += delta * rr;
                                        rr *= r;
                                    }
                                    winners.push({
                                        evaluator: evaluators[i],
                                        number: numbers[i],
                                        reward: 0.0,
                                    });
                                }
                            }
                            // set delta(LastWinners)
                            let j = winners.length - 1;
                            let delta = Te - winners[j].number;
                            winners[j].delta = delta;
                            winners[j].reward += delta * rr;

                            console.log(winners);

                            for (let i = 0; i < winners.length; ++i) {
                                winners[i].reward = (100 * winners[i].reward / Te) + '%';
                            }

                            console.log('winners =', winners);
                        })
                }
            })
    }
}
