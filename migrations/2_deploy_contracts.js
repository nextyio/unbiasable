var Unbiasable = artifacts.require('./Unbiasable.sol');

const nullAddress = '0x0000000000000000000000000000000000000000'
const truffleAddress = '0x95e2fcBa1EB33dc4b8c6DCBfCC6352f0a253285d'

module.exports = async function(deployer) {
    // 14541 iteration/2s-block
    const realSpeed = Math.floor(14541/4);
    await deployer.deploy(Unbiasable, realSpeed, Math.floor(realSpeed/2))
        .then(() => console.log(Unbiasable.address));
};