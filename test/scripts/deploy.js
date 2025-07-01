const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying GoldToken...");
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy();
  await goldToken.waitForDeployment();
  const goldTokenAddress = await goldToken.getAddress();
  console.log(`GoldToken deployed to: ${goldTokenAddress}`);

  console.log("Deploying GameAssetNFT...");
  const GameAssetNFT = await ethers.getContractFactory("GameAssetNFT");
  const gameAssetNFT = await GameAssetNFT.deploy(
    "Rootstock Artifact",
    "RART",
    "ipfs://QmYg3m9K2p8L7Q1X4J5Z6H3Y2X1V0U9S8A7B6C5D4E3F_BASE_URI/"
  );
  await gameAssetNFT.waitForDeployment();
  const gameAssetNFTAddress = await gameAssetNFT.getAddress();
  console.log(`GameAssetNFT deployed to: ${gameAssetNFTAddress}`);

  console.log("Deploying GameLogic...");
  const GameLogic = await ethers.getContractFactory("GameLogic");
  const gameLogic = await GameLogic.deploy(goldTokenAddress, gameAssetNFTAddress);
  await gameLogic.waitForDeployment();
  const gameLogicAddress = await gameLogic.getAddress();
  console.log(`GameLogic deployed to: ${gameLogicAddress}`);

  console.log("\nDeployment complete. Contract Addresses:");
  console.log(`GoldToken Address:    ${goldTokenAddress}`);
  console.log(`GameAssetNFT Address: ${gameAssetNFTAddress}`);
  console.log(`GameLogic Address:    ${gameLogicAddress}`);

  const [deployer] = await ethers.getSigners();
  console.log(`Initializing energy for deployer: ${deployer.address}`);
  await gameLogic.initializePlayerEnergy(deployer.address);
  console.log("Deployer energy initialized to MAX_ENERGY.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 