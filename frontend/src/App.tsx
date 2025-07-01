import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Properly declare window.ethereum for TypeScript
interface EthereumWindow extends Window {
  ethereum?: any;
}

const App: React.FC = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [tokenURI, setTokenURI] = useState('');
  const [playerAddress, setPlayerAddress] = useState('');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const contractAddress = '0xC72181EFF28f9Fe95CbF10Cc415a1Bb0608fc6Bd';
  const contractABI: any[] = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "tokenURI",
          "type": "string"
        }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const connectWallet = async () => {
    const { ethereum } = window as EthereumWindow;
    if (ethereum) {
      try {
        console.log('Requesting account access...');
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Account access granted:', accounts);

        if (!accounts || accounts.length === 0) {
          alert('No accounts found. Please ensure MetaMask is unlocked.');
          return;
        }

        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected wallet address:', address);
        setWalletAddress(address);

        console.log('Initializing contract with address:', contractAddress);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        console.log('Contract initialized:', contract);
        setContract(contract);

      } catch (error: any) {
        console.error('Error connecting wallet:', error.message || error);
        alert('Failed to connect wallet. Please try again.');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const mintToken = async () => {
    if (contract) {
      try {
        console.log('Minting token for address:', playerAddress);
        console.log('Token URI:', tokenURI);

        const tx = await contract.mint(playerAddress, tokenURI);
        console.log('Transaction sent:', tx);

        await tx.wait();
        console.log('Transaction confirmed:', tx);

        alert('Token minted successfully!');
      } catch (error: any) {
        console.error('Error minting token:', error.message || error);
        alert('Failed to mint token. Please check the console for more details.');
      }
    } else {
      alert('Contract is not initialized. Please connect your wallet first.');
    }
  };

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '10px', background: 'linear-gradient(135deg, #f0f8ff, #e6e6fa)' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '8px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', backgroundColor: '#282c34', color: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
          <button onClick={connectWallet} style={{ backgroundColor: '#61dafb', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Connect Wallet</button>
          <button onClick={mintToken} style={{ backgroundColor: '#61dafb', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Mint Token</button>
        </div>
        <h1 style={{ margin: '12px 0', fontSize: '18px', color: '#282c34' }}>Game Asset NFT</h1>
        {walletAddress && <p style={{ color: '#333', marginTop: '4px', fontSize: '12px' }}>Connected Wallet Address: {walletAddress}</p>}
        <input
          type="text"
          placeholder="Player Address"
          value={playerAddress}
          onChange={(e) => setPlayerAddress(e.target.value)}
          style={{ padding: '4px', marginBottom: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Token URI"
          value={tokenURI}
          onChange={(e) => setTokenURI(e.target.value)}
          style={{ padding: '4px', marginBottom: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
        />
      </div>
    </div>
  );
};

export default App;
