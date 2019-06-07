pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/Math.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Unbiasable {

    constructor (
        uint256 _maxSpeed, // initial value
        uint256 _minSpeed  // initial value
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
        uint256 t; // iteration of the challenge
        bytes32 validProofHash; // the first valid proof hash
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
    bytes32[] evaluating;
    bytes32[] validating;
    bytes32[] finished;

    // global variables
    uint256 maxSpeed;
    uint256 minSpeed;
    uint256 MinV = 60; // 2 minutes of block

    function challenge(
        bytes32 _entropy,
        uint256 _T
    )
        public
    {
        require(_entropy != 0x0, "Must provide entropy.");
        bytes32 seed = sha256(abi.encodePacked(msg.sender, _entropy));
        require(challenges[seed].maker == address(0x0), "Duplicated challenge.");
        uint256 Tv = Math.max(_T / 8, MinV);
        uint256 Te = _T - Tv;

        challenges[seed] = Challenge ({
            maker: msg.sender,
            entropy: _entropy,
            T: _T,
            C: block.number,
            t: Te * minSpeed,
            validProofHash: 0x0
        });
        evaluating.push(seed);
        //Challenge storage challenge = challenges[seed];
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
        // just hash the whole input for simplicity, although the seed and t are not needed here
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
}