pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/Math.sol";

contract Unbiasable {

    // consensus variables
    uint maxSpeed;
    uint minSpeed;

    // The oldest the seed can be, any older data will be subjected to co-ordinated preimage attack.
    // This is just the lower bound recommendation of the protocol, user should choose a much higher value fo r better security against preimage attack.
    uint MinT0 = 4; // 2 blocks is 'just' enough to prevent a single sealer pre-image attack.

    // Minimum of verification time (in blocks). Give other verificator enough time to submit conflicted proof to nullify the challege.
    uint MinV = 60; // 2 minutes of block

    // Another minimum of verification time over the total T.
    uint vDividend = 1;
    uint vDivisor = 8;

    // r is the reduction rate of the rewards for each valid hash commited.
    // r = 1/2 is the neutral value where early evaluator re-commit doesn't give them any benefit, but also doesn't lose any rewards. This still allows Early Evaluator Griefing Attacks on later evaluators, smaller r value should be chosen for production.
    // uint rDividend = 1;
    // uint rDivisor = 2;

    constructor (
        uint _maxSpeed, // speed of the fatest evaluator (t/block)
        uint _minSpeed // speed of the fatest evaluator (t/block)
    )
        public
    {
        maxSpeed = _maxSpeed;
        minSpeed = _minSpeed;
    }

    struct Challenge {
        address maker;
        bytes32 entropy; // also used as unique identification for each maker address
        uint C;          // block number where the challenge started
        uint T;          // challenge time, after C+T, the challenge is failed to be solved
        uint Te;         // evaluation time
        uint bitSize;    // int size in bits (default 2048), (y+proof) size = (bitSize + 16) >> 3
        uint iteration;
        Commit[] commits; // list of submitted proof commits
        bytes32 validOutputHash; // the first valid proof hash
    }

    struct Commit {
        address evaluator;
        uint number;
        bytes32 outputCommit; // SHA256(evaluator+proof)
    }

    enum State {
        NONE,    // not a challenge
        EVAL,    // evaluation time
        VERIFY,  // out of evaluation time (Te)
        SUCCESS, // out of time (T) with one proof verified
        TIMEOUT, // out of time without any proof verified
        FAIL     // more than one valid proofs
    }

    // seed(address + entropy) => Challenge
    mapping(bytes32 => Challenge) challenges;

    // TODO: keep a list of challenges

    function challenge(
        uint bitSize,
        bytes32 entropy,
        uint _T
    )
        public
        returns (bytes32 seed)
    {
        require(entropy != 0x0, "Must provide entropy");
        require(isPowerOfTwo(bitSize), "Only 2^x bit size is support for now");
        seed = _calcSeed(msg.sender, entropy);
        require(challenges[seed].maker == address(0x0), "Duplicated challenge");
        uint Tv = Math.max(_T * vDividend / vDivisor, MinV);
        uint Te = _T - Tv;

        // Workaround for challenges[seed] = Challenge({})
        challenges[seed].maker = msg.sender;
        challenges[seed].entropy = entropy;
        challenges[seed].C = block.number;
        challenges[seed].T = _T;
        challenges[seed].Te = Te;
        challenges[seed].bitSize = bitSize;
        challenges[seed].iteration = Te * minSpeed;
    }

    function calcSeed(address maker, bytes32 entropy) external pure returns (bytes32 seed) {
        return _calcSeed(maker, entropy);
    }

    function _calcSeed(address maker, bytes32 entropy) internal pure returns (bytes32 seed) {
        return sha256(abi.encodePacked(maker, entropy));
    }

    function calcOutputHash(bytes calldata output) external pure returns (bytes32 outputHash) {
        return _calcOutputHash(output);
    }

    function _calcOutputHash(bytes memory output) internal pure returns (bytes32 outputHash) {
        return sha256(abi.encodePacked(output));
    }

    function calcOutputCommit(
        address evaluator,
        bytes32 outputHash
    )
        external
        pure
        returns (bytes32 outputCommit)
    {
        return _calcOutputCommit(evaluator, outputHash);
    }

    function _calcOutputCommit(
        address evaluator,
        bytes32 outputHash
    )
        internal
        pure
        returns (bytes32 outputCommit)
    {
        return sha256(abi.encodePacked(evaluator, outputHash));
    }

    function getIteration(
        bytes32 seed
    )
        public
        view
        returns (uint)
    {
        return challenges[seed].iteration;
    }

    function getChallenge(
        bytes32 seed
    )
        public view
        returns (
            address maker,
            bytes32 entropy,
            uint C,
            uint T,
            uint Te,
            uint bitSize,
            uint iteration,
            uint commitCount,
            bytes32 validOutputHash
        )
    {
        Challenge storage c = challenges[seed];
        return (c.maker, c.entropy, c.C, c.T, c.Te, c.bitSize, c.iteration, c.commits.length, c.validOutputHash);
    }

    function getCommit(
        bytes32 seed,
        uint i
    )
        public view
        returns (
            uint number,
            address evaluator,
            bytes32 outputCommit
        )
    {
        Challenge storage c = challenges[seed];
        Commit storage cm = c.commits[i];
        return (cm.number, cm.evaluator, cm.outputCommit);
    }

    function exists(Challenge storage c)
        internal
        view
        returns (bool)
    {
        return c.maker != address(0x0);
    }

    function state(
        Challenge storage c
    )
        internal
        view
        returns (State)
    {
        if (c.maker == address(0x0)) {
            return State.NONE;
        }
        if (c.entropy == 0x0) {
            return State.FAIL;
        }
        if (block.number < c.C + c.Te) {
            return State.EVAL;
        }
        if (block.number < c.C + c.T) {
            return State.VERIFY;
        }
        if (c.validOutputHash == 0x0) {
            return State.TIMEOUT;
        }
        return State.SUCCESS;
    }

    function getState(
        bytes32 seed
    )
        public
        view
        returns (bytes32)
    {
        Challenge storage c = challenges[seed];
        State s = state(c);
        if (s == State.NONE) return "NONE";
        if (s == State.EVAL) return "EVAL";
        if (s == State.VERIFY) return "VERIFY";
        if (s == State.SUCCESS) return "SUCCESS";
        if (s == State.TIMEOUT) return "TIMEOUT";
        if (s == State.FAIL) return "FAIL";
        return "UNKNOW";
    }

    function commit(
        bytes32 seed,
        bytes32 outputCommit
    )
        public
    {
        Challenge storage c = challenges[seed];
        require(state(c) == State.EVAL, "Not in evaluation phase.");
        Commit memory cm = Commit({
            evaluator: msg.sender,
            number: block.number,
            outputCommit: outputCommit
        });
        c.commits.push(cm);
    }

    // FOR TEST
    // function isValid(
    //     bytes32[18] memory input // seed + t + proof[16]
    // )
    //     public
    //     pure
    //     returns(bool)
    // {
    //     return (input[2] & bytes32(0xFF00000000000000000000000000000000000000000000000000000000000000)) == bytes32(0x0);
    // }

    // FOR TEST
    // function testVerify(
    //     bytes32[18] memory input // seed + t + proof[16]
    // )
    //     public
    //     view
    // {
    //     bytes32 seed = input[0];
    //     Challenge storage c = challenges[seed];
    //     require(c.iteration == uint(input[1]), "No such challenge.");
    //     // just hash the whole input for simplicity, technically only proof is needed here
    //     bytes32 outputHash = calcOutputHash(input);
    //     require(c.validOutputHash != outputHash, "Proof already verified.");
    //     bool valid = isValid(input);
    //     require(valid, "Not a valid proof");
    // }

    function verify(
        bytes32 seed,
        bytes calldata output
    )
        external
        payable
        returns(bool success)
    {
        Challenge storage c = challenges[seed];
        require(exists(c), "No such challenge");
        require(output.length == (c.bitSize + 16) >> 2, "Invalid output size");
        // just hash the whole input for simplicity, technically only proof is needed here
        bytes32 outputHash = _calcOutputHash(output);
        require(c.validOutputHash != outputHash, "Proof already verified");
        bytes memory input = abi.encodePacked(c.bitSize, c.iteration, seed, output);
        bool valid = _verify(input);
        require(valid, "Not a valid proof");
        if (c.validOutputHash != 0x0) {
            // multiple valid proofs, ABORT!
            c.entropy = 0x0; // clear the entropy to signal an aborted challenge
            return false;
        }
        // record the first valid proof
        c.validOutputHash = outputHash;
        return true;
    }

    function _verify(bytes memory input)
        internal
        returns(bool valid)
    {
        uint output;
        uint len = input.length;
        assembly {
            // define pointer
            let p := mload(0x20)
            // call vdfVerify precompile
            if iszero(call(not(0), 0xFF, 0, add(input, 0x20), len, p, 0x20)) {
                revert(0, 0)
            }
            // return value
            output := mload(p)
        }
        return output != 0;
    }

    function isPowerOfTwo(uint x) internal pure returns(bool) {
        return (x != 0) && ((x & (x - 1)) == 0);
    }

    // FOR TEST
    // function testVDF(
    //     bytes32[18] memory input // seed + t + proof[16]
    // )
    //     public
    // {
    //     bool valid = vdfVerify(input);
    //     require(valid, "Not a valid proof");
    // }

    function finalize(bytes32 seed) external {
        Challenge storage c = challenges[seed];
        require(state(c) == State.SUCCESS, "Challenge not success.");
        // Remove invalid commits
        for (uint i = 0; i<c.commits.length; ++i) {
            Commit storage cm = c.commits[i];
            bytes32 outputCommit = _calcOutputCommit(cm.evaluator, c.validOutputHash);
            if (outputCommit != cm.outputCommit) {
                // invalid commit
                c.commits[i] = c.commits[c.commits.length-1];
                c.commits.length--;
                continue;
            }
        }
    }

    function results(bytes32 seed)
        external
        view
        returns (
            uint[] memory numbers,
            address[] memory evaluators
        )
    {
        Challenge storage c = challenges[seed];
        numbers = new uint[](c.commits.length);
        evaluators = new address[](c.commits.length);
        for (uint i = 0; i<c.commits.length; ++i) {
            Commit storage cm = c.commits[i];
            bytes32 outputCommit = _calcOutputCommit(cm.evaluator, c.validOutputHash);
            if (outputCommit != cm.outputCommit) {
                // ignore invalid commit
                continue;
            }
            uint n = cm.number - c.C;
            if (n < 0 || n > c.Te) {
                continue;
            }
            numbers[i] = n;
            evaluators[i] = cm.evaluator;
        }
        return (numbers, evaluators);
    }
}