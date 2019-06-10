pragma solidity ^0.5.0;

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
        NONE,
        EVAL,
        VERIFY,
        FINISHED,
        FAILED
    }

    // seed(address + entropy) => Challenge
    mapping(bytes32 => Challenge) challenges;

    // TODO: keep a list of challanges

    function challenge(
        bytes32 _entropy,
        uint256 _T
    )
        public
    {
        require(_entropy != 0x0, "Must provide entropy.");
        bytes32 seed = sha256(abi.encodePacked(msg.sender, _entropy));
        require(challenges[seed].maker == address(0x0), "Duplicated challenge.");
        uint256 Tv = Math.max(_T * vDividend / vDivisor, MinV);
        uint256 Te = _T - Tv;

        challenges[seed] = Challenge ({
            maker: msg.sender,
            entropy: _entropy,
            C: block.number,
            T: _T,
            Te: Te,
            t: Te * minSpeed,
            validProofHash: 0x0
        });
        evaluating.push(seed);
    }

    function state(
        Challenge c
    )
        internal
        returns (State)
    {
        if (c.maker == addres(0x0)) {
            return State.NONE;
        }
        if (block.number > c.C + c.T) {
            return State.FINISHED;
        }
        if (c.entropy == bytes32(0x0)) {
            return State.FAILED;
        }
        if (c.validProofHash == bytes(0x0)) {
            return State.EVAL;
        }
        return State.VERIFY;
    }

    function commit(
        bytes32 seed,
        bytes32 proofCommit
    )
        public
    {
        Challenge storage c = challenges[seed];
        require(c.maker != address(0x0), "No such challenge.");
        require(block.number <= c.C + c.Te, "Evaluation time is over.");
        require(c.validProofHash != 0x0, "Proof is already verified.");
        Commit memory commit = Commit({
            evaluator: msg.sender,
            number: block.number,
            proofCommit: proofCommit
        });
        c.commits.push(commit);
    }

    function verify(
        bytes32[18] memory input // seed + t + proof[16]
    )
        public
        payable
        returns(bool valid)
    {
        bytes32 seed = input[0];
        Challenge storage c = challenges[seed];
        require(c.t == uint256(input[1]), "No such challenge.");
        // just hash the whole input for simplicity, technically only proof is needed here
        bytes32 proofHash = sha256(abi.encodePacked(input));
        require(c.validProofHash != proofHash, "Proof already verified.")
        assembly {
            // call vdfVerify precompile
            if iszero(call(not(0), 0xFF, 0, input, 576, valid, 1)) {
                revert(0, 0)
            }
        }
        if (!valid) {
            // not a valid proof
            return false;
        }
        if (c.validProofHash != 0x0) {
            // multiple valid proofs, ABORT!
            c.entropy = 0x0; // clear the entropy to signal an aborted challenge
            return false;
        }
        // record the first valid proof
        c.validProofHash = proofHash;
        return true;
    }

    function finalize(
        bytes32 seed
    )
        public
    {
        Challenge storage c = challenges[seed];
        require(c.maker != address(0x0), "No such challenge.");
        require(block.number > c.C + c.T, "Challenge not finished.");
        // TODO
    }
}