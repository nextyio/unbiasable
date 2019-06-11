import BaseRedux from '@/model/BaseRedux';

class UnbiasableRedux extends BaseRedux {
    defineTypes () {
        return ['unbiasable'];
    }

    defineDefaultState () {
        return {
            orders: {
                /* true: [{
                    id: '0xxxxxxcba1eb33dc4b8c6dcbfcc6352f0a253285d',
                    address: '0x95e2fcba1eb33dc4b8c6dcbfcc6352f0a253285d',
                    amount: 10,
                    price: 20
                }], */
                true: [],
                false: []
            }
        };
    }
}

export default new UnbiasableRedux()
