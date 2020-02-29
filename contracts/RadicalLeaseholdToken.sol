pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RadicalLeaseholdToken is ERC721, Ownable {
    mapping (uint256 => uint256) private _tokenRent;
    mapping (uint256 => uint256) private _tokenPrice;

    event PriceChanged(address indexed owner, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    event Sold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);

    modifier onlyHolder(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "RadicalLeaseholdToken: only token holder can perform this action");
        _;
    }

    modifier notHolder(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "RadicalLeaseholdToken: the token holder cannot perform this action");
        _;
    }

    modifier onlyExistingToken(uint256 tokenId) {
        require(_exists(tokenId), "RadicalLeaseholdToken: attempt to perform action on nonexistent token");
        _;
    }

    function priceOf(uint256 tokenId) public view onlyExistingToken(tokenId) returns (uint256) {
        return _tokenPrice[tokenId];
    }

    function setPriceOf(uint256 tokenId, uint256 newPrice) public onlyHolder(tokenId) onlyExistingToken(tokenId) {
        uint256 oldPrice = _tokenPrice[tokenId];
        _tokenPrice[tokenId] = newPrice;

        // TODO: Refund old prepaid rent
        // TODO: Prepay new rent

        emit PriceChanged(ownerOf(tokenId), tokenId, oldPrice, newPrice);
    }

    function rentOf(uint256 tokenId) public view onlyExistingToken(tokenId) returns (uint256) {
        return _tokenRent[tokenId];
    }

    function mint(address to, uint256 tokenId, uint256 initialPrice, uint256 rent) public onlyOwner {
        _mint(to, tokenId);
        _tokenRent[tokenId] = rent;
        _tokenPrice[tokenId] = initialPrice;
    }

    function buy(uint256 tokenId) public payable notHolder(tokenId) onlyExistingToken(tokenId) {
        uint256 price = priceOf(tokenId);
        require(msg.value == price, "RadicalLeaseholdToken: did not provide right amount of ETH for purchase");
        address from = ownerOf(tokenId);
        _transferFrom(from, msg.sender, tokenId);

        // TODO: Refund prepaid rent to old owner
        // TODO: Prepay new rent from new owner

        emit Sold(from, msg.sender, tokenId, price);
    }
}
