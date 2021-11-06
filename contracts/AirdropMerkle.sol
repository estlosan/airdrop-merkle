// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AirdropMerkle is Ownable { 
    using ECDSA for bytes32;

    bytes32 public merkleRoot;

    IERC20 public tokenContract;

    constructor(bytes32 _merkleRoot, IERC20 _tokenContract) {
        merkleRoot = _merkleRoot;
        tokenContract = _tokenContract;
    }

    function setTokenContract(address _tokenAddress) external onlyOwner {
        tokenContract = IERC20(_tokenAddress);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
    
}