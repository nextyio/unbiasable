import BaseRedux from '@/model/BaseRedux';

class ManualRedux extends BaseRedux {
    defineTypes () {
        return ['manual'];
    }

    defineDefaultState () {
        return {
            evaluating: false,
            proof: "",
        };
    }
}

export default new ManualRedux()
