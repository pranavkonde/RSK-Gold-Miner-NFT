# Gold Miner NFT Project

A decentralized NFT game built on Rootstock (RSK) testnet that allows users to mint and own unique Gold Miner NFTs.

## Features

- Smart Contract: ERC721 NFT contract for Gold Miner assets
- Frontend: React-based web interface for interacting with the contract
- Wallet Integration: MetaMask support for Rootstock testnet
- NFT Minting: Create new Gold Miner NFTs with custom metadata

## Prerequisites

- Node.js (v14 or higher)
- MetaMask wallet
- Rootstock testnet RBTC (for gas fees)

## Smart Contract

The project includes three main smart contracts:
- `GameAssetNFT.sol`: ERC721 contract for NFT assets
- `GameLogic.sol`: Game mechanics and logic
- `GoldToken.sol`: ERC20 token for in-game currency

## Installation

1. Clone the repository:

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
PRIVATE_KEY=your_private_key_here
RSK_TESTNET_RPC_URL=https://public-node.testnet.rsk.co
```

## Deployment

1. Compile the contracts:
```bash
npx hardhat compile
```

2. Deploy to Rootstock testnet:
```bash
npx hardhat run scripts/deploy.js --network rsktestnet
```

## Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Using the Application

1. Connect your MetaMask wallet:
   - Make sure MetaMask is configured for Rootstock testnet
   - Click "Connect Wallet" in the application
   - Approve the connection request

2. Mint an NFT:
   - Enter a token URI (metadata URL)
   - Click "Mint NFT"
   - Approve the transaction in MetaMask

## Token URI Format

The token URI should point to a JSON file with the following structure:
```json
{
  "name": "Gold Miner NFT",
  "description": "A unique NFT representing a gold miner",
  "image": "https://your-image-url.com/image.png",
  "attributes": [
    {
      "trait_type": "Mining Power",
      "value": "100"
    }
  ]
}
```

## Contract Addresses

- GameAssetNFT: `0xC72181EFF28f9Fe95CbF10Cc415a1Bb0608fc6Bd` (Rootstock testnet)

## Development

### Project Structure
```
rootstock-gold-miner/
├── contracts/           # Smart contracts
├── frontend/           # React frontend
├── scripts/            # Deployment scripts
├── test/              # Test files
└── hardhat.config.js  # Hardhat configuration
```

### Testing
```bash
npx hardhat test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Rootstock (RSK) team for the testnet infrastructure
- OpenZeppelin for the smart contract libraries
- React team for the frontend framework
