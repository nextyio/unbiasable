import BaseRedux from '@/model/BaseRedux';

class UnbiasableRedux extends BaseRedux {
    defineTypes () {
        return ['unbiasable'];
    }

    defineDefaultState () {
        return {
            seed: ""
        };
    }
}

export default new UnbiasableRedux()
