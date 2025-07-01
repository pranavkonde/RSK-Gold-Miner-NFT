// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GameAssetNFT is ERC721URIStorage, Ownable {
    string private baseTokenURI;
    uint256 private _tokenIdCounter;

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

    function transferContractOwnership(address newOwner) public onlyOwner {
        transferOwnership(newOwner);
    }
} 