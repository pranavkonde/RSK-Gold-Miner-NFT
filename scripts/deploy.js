const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const name = "GoldMinerNFT";
  const symbol = "GMNFT";
  const baseURI = "https://example.com/metadata/";

  const GameAssetNFT = await hre.ethers.getContractFactory("GameAssetNFT");
  const gameAssetNFT = await GameAssetNFT.deploy(name, symbol, baseURI);

  await gameAssetNFT.waitForDeployment();

  const address = await gameAssetNFT.getAddress();
  console.log("GameAssetNFT deployed to:", address);

  // Save network configuration
  const networkId = hre.network.config.chainId;
  const filePath = path.join(__dirname, '../frontend/src/contracts/GameAssetNFT.json');
  const contractData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  contractData.networks = contractData.networks || {};
  contractData.networks[networkId] = { address };
  fs.writeFileSync(filePath, JSON.stringify(contractData, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 