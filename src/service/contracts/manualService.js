import BaseService from '../../model/BaseService'
import web3 from 'web3'
import _ from 'lodash'

export default class extends BaseService {

    async commit(seed, output) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        seed = '0x' + seed;
        output = '0x' + output;

        const methods = store.contracts.unbiasable.methods
        const outputHash = await methods.calcOutputHash(output).call({from :wallet});
        console.log('outputHash', outputHash);
        const outputCommit = await methods.calcOutputCommit(wallet, outputHash).call({from: wallet});
        console.log('outputCommit', outputCommit);
        methods.commit(seed, outputCommit)
            .send({from: wallet})
            .on('error', (error) => {
                console.error(error)
                methods.getState(seed)
                    .call()
                    .then((state) => {
                        console.log('state', web3.utils.toUtf8(state));
                    })
                const unbiasableRedux = this.store.getRedux('rng')
                this.dispatch(unbiasableRedux.actions.seed_reset())
            })
            .on('receipt', (receipt) => {
                console.log('receipt', receipt)
                methods.getState(seed)
                    .call()
                    .then((state) => {
                        console.log('state', web3.utils.toUtf8(state));
                    })
            });
    }

    async verify(seed, output) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        seed = '0x' + seed;
        output = '0x' + output;

        // const input = assembleInput(seed, iteration, proof);
        // console.log(input);

        const methods = store.contracts.unbiasable.methods
        // methods.isValid(input)
        //     .call()
        //     .then((isValid) => {
        //         console.log('isValid', isValid);
        //     })
        methods.getState(seed)
            .call()
            .then((state) => {
                console.log('state', web3.utils.toUtf8(state));
            })
        methods.getChallenge(seed)
            .call()
            .then((results) => {
                let i = 0;
                console.log('maker', results.maker);
                console.log('entropy', results.entropy);
                console.log('C', results.C);
                console.log('T', results.T);
                console.log('Te', results.Te);
                console.log('bitSize', results.bitSize);
                console.log('iteration', results.iteration);
                console.log('commitCount', results.commitCount);
                console.log('validOutputHash', results.validOutputHash);
            })
        console.log('seed', seed);
        console.log('proof', output);
        methods.verify(seed, output)
            .send({from: wallet, gasLimit: 222000})
            .on('error', (error) => {
                console.error(error)
            })
            .on('receipt', (receipt) => {
                console.log('receipt', receipt)
                methods.getState(seed)
                    .call()
                    .then((state) => {
                        console.log('state', web3.utils.toUtf8(state));
                    })
                });
    }
}
