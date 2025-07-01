# Building a Gold Miner NFT Game on Rootstock: A Complete Guide

## Introduction

In this comprehensive guide, we'll build a complete NFT game on the Rootstock (RSK) blockchain. We'll create a Gold Miner game where players can mint NFTs representing miners, each with unique attributes and abilities. This project combines smart contract development with a modern React frontend, demonstrating how to build a full-stack decentralized application.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setting Up the Development Environment](#setting-up-the-development-environment)
3. [Smart Contract Development](#smart-contract-development)
4. [Testing Smart Contracts](#testing-smart-contracts)
5. [Deploying to Rootstock Testnet](#deploying-to-rootstock-testnet)
6. [Building the Frontend](#building-the-frontend)
7. [Connecting Frontend to Smart Contracts](#connecting-frontend-to-smart-contracts)
8. [Adding NFT Metadata](#adding-nft-metadata)
9. [Testing the Complete Application](#testing-the-complete-application)
10. [Conclusion](#conclusion)

## Project Overview

Our Gold Miner NFT game will have the following components:
- ERC721 NFT contract for miner assets
- ERC20 token for in-game currency
- Game logic contract for mining mechanics
- React frontend for user interaction
- IPFS integration for NFT metadata

## Setting Up the Development Environment

### 1. Prerequisites
First, ensure you have the following installed:
- Node.js (v14 or higher)
- MetaMask wallet
- Git

### 2. Project Initialization
```bash
# Create project directory
mkdir rootstock-gold-miner
cd rootstock-gold-miner

# Initialize npm project
npm init -y

# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
```

### 3. Configure Hardhat
Create a `hardhat.config.js` file:
```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    rsktestnet: {
      url: "https://public-node.testnet.rsk.co/",
      chainId: 31,
      accounts: [process.env.PRIVATE_KEY],
      gasPrice: 60000000,
      gas: 6000000,
    },
  },
  etherscan: {
    apiKey: {
      rsktestnet: "YOUR_RSK_EXPLORER_API_KEY",
    },
    customChains: [
      {
        network: "rsktestnet",
        chainId: 31,
        urls: {
          api: "https://explorer.testnet.rsk.io/api",
          browser: "https://explorer.testnet.rsk.io/"
        }
      }
    ]
  }
};
```

### 4. Environment Setup
Create a `.env` file:
```
PRIVATE_KEY=your_private_key_here
```

## Smart Contract Development

### 1. GameAssetNFT Contract
Create `contracts/GameAssetNFT.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameAssetNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    string private baseTokenURI;

    constructor(string memory name, string memory symbol, string memory baseURI_)
        ERC721(name, symbol)
        Ownable(msg.sender)
    {
        baseTokenURI = baseURI_;
    }

    function mint(address player, string memory tokenURI) public onlyOwner {
        uint256 newItemId = _tokenIdCounter;
        _tokenIdCounter++;
        _safeMint(player, newItemId);
        _setTokenURI(newItemId, tokenURI);
    }

    function setBaseURI(string memory baseURI_) public onlyOwner {
        baseTokenURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
}
```

### 2. GoldToken Contract
Create `contracts/GoldToken.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoldToken is ERC20, Ownable {
    constructor() ERC20("Gold Token", "GOLD") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### 3. GameLogic Contract
Create `contracts/GameLogic.sol`:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GameAssetNFT.sol";
import "./GoldToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameLogic is Ownable {
    GameAssetNFT public nftContract;
    GoldToken public goldToken;
    
    mapping(uint256 => uint256) public minerPower;
    mapping(uint256 => uint256) public lastMiningTime;
    
    uint256 public constant MINING_COOLDOWN = 1 hours;
    uint256 public constant BASE_REWARD = 100;
    
    constructor(address _nftContract, address _goldToken) Ownable(msg.sender) {
        nftContract = GameAssetNFT(_nftContract);
        goldToken = GoldToken(_goldToken);
    }
    
    function mine(uint256 tokenId) public {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(block.timestamp >= lastMiningTime[tokenId] + MINING_COOLDOWN, "Still in cooldown");
        
        uint256 reward = calculateReward(tokenId);
        goldToken.mint(msg.sender, reward);
        lastMiningTime[tokenId] = block.timestamp;
    }
    
    function calculateReward(uint256 tokenId) public view returns (uint256) {
        return BASE_REWARD * (100 + minerPower[tokenId]) / 100;
    }
    
    function setMinerPower(uint256 tokenId, uint256 power) public onlyOwner {
        minerPower[tokenId] = power;
    }
}
```

## Testing Smart Contracts

Create test files in the `test` directory:

```javascript
// test/GameAssetNFT.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GameAssetNFT", function () {
  let GameAssetNFT;
  let gameAssetNFT;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    GameAssetNFT = await ethers.getContractFactory("GameAssetNFT");
    gameAssetNFT = await GameAssetNFT.deploy("Gold Miner", "GM", "https://example.com/");
  });

  it("Should mint a new NFT", async function () {
    await gameAssetNFT.mint(addr1.address, "tokenURI");
    expect(await gameAssetNFT.ownerOf(0)).to.equal(addr1.address);
  });
});
```

## Deploying to Rootstock Testnet

Create a deployment script in `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Deploy GoldToken
  const GoldToken = await hre.ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy();
  await goldToken.waitForDeployment();
  console.log("GoldToken deployed to:", await goldToken.getAddress());

  // Deploy GameAssetNFT
  const GameAssetNFT = await hre.ethers.getContractFactory("GameAssetNFT");
  const gameAssetNFT = await GameAssetNFT.deploy(
    "Gold Miner NFT",
    "GMNFT",
    "https://example.com/metadata/"
  );
  await gameAssetNFT.waitForDeployment();
  console.log("GameAssetNFT deployed to:", await gameAssetNFT.getAddress());

  // Deploy GameLogic
  const GameLogic = await hre.ethers.getContractFactory("GameLogic");
  const gameLogic = await GameLogic.deploy(
    await gameAssetNFT.getAddress(),
    await goldToken.getAddress()
  );
  await gameLogic.waitForDeployment();
  console.log("GameLogic deployed to:", await gameLogic.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

Deploy using:
```bash
npx hardhat run scripts/deploy.js --network rsktestnet
```

## Building the Frontend

### 1. Create React App
```bash
npx create-react-app frontend
cd frontend
npm install ethers@5.7.2 @web3-react/core @web3-react/injected-connector web3modal
```

### 2. Create Web3 Context
Create `frontend/src/context/Web3Context.js`:
```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import GameAssetNFT from '../contracts/GameAssetNFT.json';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS";

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          setAccount(accounts[0]);

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          const contractInstance = new ethers.Contract(
            contractAddress,
            GameAssetNFT.abi,
            signer
          );
          setContract(contractInstance);
        } catch (error) {
          console.error("Error initializing Web3:", error);
        }
      }
      setLoading(false);
    };

    init();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const mintNFT = async (tokenURI) => {
    if (!contract || !account) return;
    try {
      const tx = await contract.mint(account, tokenURI);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error minting NFT:", error);
      return false;
    }
  };

  return (
    <Web3Context.Provider value={{
      account,
      contract,
      loading,
      connectWallet,
      mintNFT
    }}>
      {children}
    </Web3Context.Provider>
  );
};
```

### 3. Create Main App Component
Update `frontend/src/App.js`:
```javascript
import React, { useState } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import './App.css';

function AppContent() {
  const { account, loading, connectWallet, mintNFT } = useWeb3();
  const [tokenURI, setTokenURI] = useState('');
  const [minting, setMinting] = useState(false);

  const handleMint = async () => {
    if (!tokenURI) {
      alert('Please enter a token URI');
      return;
    }
    setMinting(true);
    try {
      const success = await mintNFT(tokenURI);
      if (success) {
        alert('NFT minted successfully!');
        setTokenURI('');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Error minting NFT');
    }
    setMinting(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Gold Miner NFT</h1>
        {!account ? (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        ) : (
          <div className="wallet-info">
            <p>Connected: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <div className="mint-section">
              <input
                type="text"
                value={tokenURI}
                onChange={(e) => setTokenURI(e.target.value)}
                placeholder="Enter token URI"
                className="token-uri-input"
              />
              <button
                onClick={handleMint}
                disabled={minting}
                className="mint-button"
              >
                {minting ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}

export default App;
```

## Adding NFT Metadata

Create a sample metadata JSON file:
```json
{
  "name": "Gold Miner NFT",
  "description": "A unique NFT representing a gold miner in the Rootstock ecosystem",
  "image": "https://ipfs.io/ipfs/YOUR_IMAGE_HASH/gold-miner.png",
  "attributes": [
    {
      "trait_type": "Mining Power",
      "value": "100"
    },
    {
      "trait_type": "Rarity",
      "value": "Rare"
    },
    {
      "trait_type": "Level",
      "value": "1"
    }
  ]
}
```

Upload this metadata to IPFS or any decentralized storage service.

## Testing the Complete Application

1. Start the frontend:
```bash
cd frontend
npm start
```

2. Configure MetaMask:
   - Add Rootstock testnet network
   - Import your test account
   - Get testnet RBTC from the faucet

3. Test the application:
   - Connect wallet
   - Mint an NFT using the metadata URI
   - Verify the NFT in your wallet
   - Check the contract on the Rootstock explorer

## Conclusion

In this guide, we've built a complete NFT game on Rootstock, including:
- Smart contracts for NFTs and game logic
- React frontend with Web3 integration
- NFT metadata handling
- Testing and deployment

The project demonstrates how to:
- Develop and deploy smart contracts
- Create a Web3-enabled frontend
- Handle NFT metadata
- Integrate with Rootstock blockchain

## Next Steps

1. Add more game mechanics
2. Implement a marketplace
3. Add more NFT attributes
4. Enhance the frontend UI
5. Add multiplayer features

## Resources

- [Rootstock Documentation](https://developers.rsk.co/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Ethers.js Documentation](https://docs.ethers.org/) 