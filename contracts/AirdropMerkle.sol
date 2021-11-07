// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract AirdropMerkle is Ownable { 
    using ECDSA for bytes32;

    bytes32 public merkleRoot;

    mapping(address => bool) public isClaimed;

    IERC20 public tokenContract;

    event MerkleClaimed(address indexed user, uint256 amount);

    constructor(bytes32 _merkleRoot, IERC20 _tokenContract) {
        merkleRoot = _merkleRoot;
        tokenContract = _tokenContract;
    }

    function claimTokensByMerkleProof(bytes32[] calldata _proof, uint256 _amount) external {
        address sender = msg.sender;
        require(!isClaimed[sender], "AirdropMerkle: User has already claimed its tokens");
        require(_amount > 0, "AirdropMerkle: Amount should be greater than 0");

        bytes32 computedHash = keccak256(abi.encodePacked(sender, _amount));

        for (uint i = 0; i < _proof.length; i++) {
            bytes32 proofElement = _proof[i];

            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }

        //Verify proof
        require(computedHash == merkleRoot, "AirdropMerkle: Bad proof given");

        isClaimed[sender] = true;
        (bool success, ) = address(tokenContract).call(abi.encodeWithSignature("transfer(address,uint256)", sender, _amount));
        require(success, "AirdropMerkle: Token transfer failed");
        
        emit MerkleClaimed(msg.sender, _amount);
    }

    function setTokenContract(address _tokenAddress) external onlyOwner {
        tokenContract = IERC20(_tokenAddress);
    }

    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner {
        merkleRoot = _merkleRoot;
    }
    
}