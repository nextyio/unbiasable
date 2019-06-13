import BaseService from '../../model/BaseService'
import web3 from 'web3'
import _ from 'lodash'

export default class extends BaseService {

    async commit(seed, iteration, proof) {
        const store = this.store.getState()
        const wallet = store.user.wallet
        seed = '0x' + seed;

        // assemble the seed + iterator + proof input
        let input = [];
        input.push(seed);
        input.push(web3.utils.toHex(iteration));
        for (let i = 0; i < 16; ++i) {
            let str = proof.substr(64*i, 64);
            input.push('0x' + str);
        }

        const methods = store.contracts.unbiasable.methods
        const proofHash = await methods.calcProofHash(input).call({from :wallet});
        console.log('proofHash', proofHash);
        const proofCommit = await methods.calcProofCommit(wallet, proofHash).call({from: wallet});
        console.log('proofCommit', proofCommit);
        methods.commit(seed, proofCommit)
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
                const unbiasableRedux = this.store.getRedux('unbiasable')
                this.dispatch(unbiasableRedux.actions.seed_reset())
            });
    }
}
