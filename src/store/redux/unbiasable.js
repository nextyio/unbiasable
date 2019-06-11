import BaseRedux from '@/model/BaseRedux';

class UnbiasableRedux extends BaseRedux {
    defineTypes () {
        return ['unbiasable'];
    }

    defineDefaultState () {
        return {
            seed: "",
            iteration: 0,
        };
    }
}

export default new UnbiasableRedux()
