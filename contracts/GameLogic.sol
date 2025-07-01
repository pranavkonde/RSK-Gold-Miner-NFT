// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./GoldToken.sol";
import "./GameAssetNFT.sol";

contract GameLogic is Ownable {
    GoldToken public goldToken;
    GameAssetNFT public gameAssetNFT;

    uint256 public miningRewardAmount = 100000000000000000; // 0.1 RGLD (18 decimals)
    uint256 public nftDropProbability = 100; // 1% chance (100 out of 10000)

    mapping(address => uint256) public playerEnergy;
    mapping(address => uint256) public lastEnergyUpdateTime;
    uint256 public constant MAX_ENERGY = 100;
    uint256 public constant ENERGY_PER_MINE = 10;
    uint256 public constant ENERGY_REGEN_RATE_PER_MINUTE = 1;

    string[] private artifactUris = [
        "ipfs://QmYg3m9K2p8L7Q1X4J5Z6H3Y2X1V0U9S8A7B6C5D4E3F_ARTIFACT_1",
        "ipfs://QmbRjK6M2tW8G7X8C5F4Z9H3Y2X1V0U9S8A7B6C5D4E3F_ARTIFACT_2",
        "ipfs://QmEXAMPLE_ARTIFACT_METADATA_URI_3"
    ];

    constructor(address _goldTokenAddress, address _gameAssetNFTAddress) Ownable(msg.sender) {
        goldToken = GoldToken(_goldTokenAddress);
        gameAssetNFT = GameAssetNFT(_gameAssetNFTAddress);

        goldToken.transferOwnership(address(this));
        gameAssetNFT.transferContractOwnership(address(this));
    }

    function _updateEnergy(address player) private {
        uint256 timePassed = block.timestamp - lastEnergyUpdateTime[player];
        if (timePassed > 0) {
            uint256 energyGained = (timePassed / 60) * ENERGY_REGEN_RATE_PER_MINUTE;
            playerEnergy[player] = Math.min(playerEnergy[player] + energyGained, MAX_ENERGY);
            lastEnergyUpdateTime[player] = block.timestamp;
        }
    }

    function getPlayerEnergy(address player) public view returns (uint256) {
        uint256 timePassed = block.timestamp - lastEnergyUpdateTime[player];
        uint256 energyGained = (timePassed / 60) * ENERGY_REGEN_RATE_PER_MINUTE;
        return Math.min(playerEnergy[player] + energyGained, MAX_ENERGY);
    }

    function mine() public {
        _updateEnergy(msg.sender);

        require(playerEnergy[msg.sender] >= ENERGY_PER_MINE, "Not enough energy to mine.");

        playerEnergy[msg.sender] -= ENERGY_PER_MINE;
        lastEnergyUpdateTime[msg.sender] = block.timestamp;

        goldToken.mint(msg.sender, miningRewardAmount);

        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.difficulty))) % 10000;

        if (randomNumber < nftDropProbability) {
            uint256 uriIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.number))) % artifactUris.length;
            gameAssetNFT.mint(msg.sender, artifactUris[uriIndex]);
        }
    }

    function initializePlayerEnergy(address player) public onlyOwner {
        playerEnergy[player] = MAX_ENERGY;
        lastEnergyUpdateTime[player] = block.timestamp;
    }

    function setMiningRewardAmount(uint256 _amount) public onlyOwner {
        miningRewardAmount = _amount;
    }

    function setNftDropProbability(uint256 _probability) public onlyOwner {
        require(_probability <= 10000, "Probability cannot exceed 10000 (100%)");
        nftDropProbability = _probability;
    }

    function setArtifactUris(string[] memory _uris) public onlyOwner {
        artifactUris = _uris;
    }
} 