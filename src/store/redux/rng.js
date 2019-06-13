import BaseRedux from '@/model/BaseRedux';

class RNGRedux extends BaseRedux {
    defineTypes () {
        return ['rng'];
    }

    defineDefaultState () {
        return {
            seed: "",
            iteration: 0,
        };
    }
}

export default new RNGRedux()
