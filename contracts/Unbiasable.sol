pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/Math.sol";

contract Unbiasable {

    // consensus variables
    uint256 maxSpeed;
    uint256 minSpeed;

    // The oldest the seed can be, any older data will be subjected to co-ordinated preimage attack.
    // This is just the lower bound recommendation of the protocol, user should choose a much higher value fo r better security against preimage attack.
    uint256 MinT0 = 4; // 2 blocks is 'just' enough to prevent a single sealer pre-image attack.

    // Minimum of verification time (in blocks). Give other verificator enough time to submit conflicted proof to nullify the challege.
    uint256 MinV = 60; // 2 minutes of block

    // Another minimum of verification time over the total T.
    uint256 vDividend = 1;
    uint256 vDivisor = 8;

    // r is the reduction rate of the rewards for each valid hash commited.
    // r = 1/2 is the neutral value where early evaluator re-commit doesn't give them any benefit, but also doesn't lose any rewards. This still allows Early Evaluator Griefing Attacks on later evaluators, smaller r value should be chosen for production.
    // uint256 rDividend = 1;
    // uint256 rDivisor = 2;

    constructor (
        uint256 _maxSpeed, // speed of the fatest evaluator (t/block)
        uint256 _minSpeed // speed of the fatest evaluator (t/block)
    )
        public
    {
        maxSpeed = _maxSpeed;
        minSpeed = _minSpeed;
    }

    struct Challenge {
        address maker;
        bytes32 entropy; // also treated as unique identification for each maker address
        uint256 C; // block number where the challenge is confirmed
        uint256 T; // challenge time
        uint256 Te; // evaluation time
        uint256 t; // iteration of the challenge
        Commit[] commits; // list of submitted proof commits
        bytes32 validProofHash; // the first valid proof hash
    }

    struct Commit {
        address evaluator;
        uint256 number;
        bytes32 proofCommit; // SHA256(evaluator+proof)
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
        bytes32 _entropy,
        uint256 _T
    )
        public
        returns (bytes32 seed)
    {
        require(_entropy != 0x0, "Must provide entropy.");
        seed = calcSeed(msg.sender, _entropy);
        require(challenges[seed].maker == address(0x0), "Duplicated challenge.");
        uint256 Tv = Math.max(_T * vDividend / vDivisor, MinV);
        uint256 Te = _T - Tv;

        // Workaround for challenges[seed] = Challenge({})
        challenges[seed].maker = msg.sender;
        challenges[seed].entropy = _entropy;
        challenges[seed].C = block.number;
        challenges[seed].T = _T;
        challenges[seed].Te = Te;
        challenges[seed].t = Te * minSpeed;

        return seed;
    }

    function calcSeed(
        address maker,
        bytes32 entropy
    )
        public
        pure
        returns (bytes32 seed)
    {
        return sha256(abi.encodePacked(maker, entropy));
    }

    function calcProofHash(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        pure
        returns (bytes32 proofHash)
    {
        return sha256(abi.encodePacked(input));
    }

    function calcProofCommit(
        address evaluator,
        bytes32 proofHash
    )
        public
        pure
        returns (bytes32 proofCommit)
    {
        return sha256(abi.encodePacked(evaluator, proofHash));
    }

    function getIteration(
        bytes32 seed
    )
        public
        view
        returns (uint256)
    {
        return challenges[seed].t;
    }

    function getChallenge(
        bytes32 seed
    )
        public view
        returns (address, bytes32, uint256, uint256, uint256, uint256, uint256, bytes32)
    {
        Challenge storage c = challenges[seed];
        return (c.maker, c.entropy, c.C, c.T, c.Te, c.t, c.commits.length, c.validProofHash);
    }

    function getCommit(
        bytes32 seed,
        uint256 i
    )
        public view
        returns (uint256 number, address evaluator, bytes32 proofCommit)
    {
        Challenge storage c = challenges[seed];
        Commit storage cm = c.commits[i];
        return (cm.number, cm.evaluator, cm.proofCommit);
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
        if (c.validProofHash == 0x0) {
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
        bytes32 proofCommit
    )
        public
    {
        Challenge storage c = challenges[seed];
        require(state(c) == State.EVAL, "Not in evaluation phase.");
        Commit memory cm = Commit({
            evaluator: msg.sender,
            number: block.number,
            proofCommit: proofCommit
        });
        c.commits.push(cm);
    }

    // FOR TEST
    function isValid(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        pure
        returns(bool)
    {
        return (input[2] & bytes32(0xFF00000000000000000000000000000000000000000000000000000000000000)) == bytes32(0x0);
    }

    // FOR TEST
    function testVerify(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        view
    {
        bytes32 seed = input[0];
        Challenge storage c = challenges[seed];
        require(c.t == uint256(input[1]), "No such challenge.");
        // just hash the whole input for simplicity, technically only proof is needed here
        bytes32 proofHash = calcProofHash(input);
        require(c.validProofHash != proofHash, "Proof already verified.");
        bool valid = isValid(input);
        require(valid, "Not a valid proof");
    }

    function verify(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        payable
        returns(bool success)
    {
        bytes32 seed = input[0];
        Challenge storage c = challenges[seed];
        require(c.t == uint256(input[1]), "No such challenge.");
        // just hash the whole input for simplicity, technically only proof is needed here
        bytes32 proofHash = calcProofHash(input);
        require(c.validProofHash != proofHash, "Proof already verified.");
        bool valid = vdfVerify(input);
        require(valid, "Not a valid proof");
        if (c.validProofHash != 0x0) {
            // multiple valid proofs, ABORT!
            c.entropy = 0x0; // clear the entropy to signal an aborted challenge
            return false;
        }
        // record the first valid proof
        c.validProofHash = proofHash;
        return true;
    }

    function vdfVerify(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        returns(bool valid)
    {
        uint256 output;
        assembly {
            // define pointer
            let p := mload(0x20)
            // call vdfVerify precompile
            if iszero(call(not(0), 0xFF, 0, input, 576, p, 0x20)) {
                revert(0, 0)
            }
            // return value
            output := mload(p)
        }
        return output != 0;
    }

    // FOR TEST
    function testVDF(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
    {
        bool valid = vdfVerify(input);
        require(valid, "Not a valid proof");
    }

    function finalize(
        bytes32 seed
    )
        public
    {
        Challenge storage c = challenges[seed];
        require(state(c) == State.SUCCESS, "Challenge not success.");
        // Remove invalid commits
        for (uint i = 0; i<c.commits.length; ++i) {
            Commit storage cm = c.commits[i];
            bytes32 proofCommit = calcProofCommit(cm.evaluator, c.validProofHash);
            if (proofCommit != cm.proofCommit) {
                // invalid commit
                c.commits[i] = c.commits[c.commits.length-1];
                c.commits.length--;
                continue;
            }
        }
    }

    function results(
        bytes32 seed
    )
        public
        view
        returns (
            uint256 Te,
            uint256[] memory numbers,
            address[] memory evaluators
        )
    {
        Challenge storage c = challenges[seed];
        numbers = new uint256[](c.commits.length);
        evaluators = new address[](c.commits.length);
        for (uint256 i = 0; i<c.commits.length; ++i) {
            Commit storage cm = c.commits[i];
            bytes32 proofCommit = calcProofCommit(cm.evaluator, c.validProofHash);
            if (proofCommit != cm.proofCommit) {
                // ignore invalid commit
                continue;
            }
            uint256 n = cm.number - c.C;
            if (n < 0 || n > c.Te) {
                continue;
            }
            numbers[i] = n;
            evaluators[i] = cm.evaluator;
        }
        return (c.Te, numbers, evaluators);
    }
}