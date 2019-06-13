import BaseService from '../../model/BaseService'
import web3 from 'web3'
import _ from 'lodash'

// assemble the seed + iterator + proof input
function assembleInput(seed, iteration, proof) {
    let input = [];
    input.push(seed);
    const iterationStr = '0x' + web3.utils.toHex(iteration).substr(2).padStart(64, '0');
    input.push(iterationStr);
    for (let i = 0; i < 16; ++i) {
        let str = proof.substr(64*i, 64);
        input.push('0x' + str);
    }
    return input;
}

export default class extends BaseService {

    async commit(seed, iteration, proof) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        seed = '0x' + seed;

        const input = assembleInput(seed, iteration, proof);

        const methods = store.contracts.unbiasable.methods
        const proofHash = await methods.calcProofHash(input).call({from :wallet});
        console.log('proofHash', proofHash);
        const proofCommit = await methods.calcProofCommit(wallet, proofHash).call({from: wallet});
        console.log('proofCommit', proofCommit);
        methods.commit(seed, proofCommit)
            .send({from: wallet})
            .on('error', (error) => {
                console.error(error)
                methods.getState(seed)
                    .call()
                    .then((state) => {
                        console.log('state', web3.utils.toUtf8(state));
                    })
                const unbiasableRedux = this.store.getRedux('unbiasable')
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

    async verify(seed, iteration, proof) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        seed = '0x' + seed;

        const input = assembleInput(seed, iteration, proof);
        console.log(input);

        const methods = store.contracts.unbiasable.methods
        methods.isValid(input)
            .call()
            .then((isValid) => {
                console.log('isValid', isValid);
            })
        methods.testInputItertion(input)
            .call()
            .then((iteration) => {
                console.log('iteration', iteration);
            })
        methods.getState(seed)
            .call()
            .then((state) => {
                console.log('state', web3.utils.toUtf8(state));
            })
        methods.getChallengeData(seed)
            .call()
            .then((results) => {
                let i = 0;
                console.log('maker', results[i++]);
                console.log('entropy', results[i++]);
                console.log('C', results[i++]);
                console.log('T', results[i++]);
                console.log('Te', results[i++]);
                console.log('iteration', results[i++]);
                console.log('commitCount', results[i++]);
                console.log('validProofHash', results[i++]);
            })
        methods.verify(input)
            .send({from: wallet})
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
