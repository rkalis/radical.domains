pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./RadicalManager.sol";

contract RadicalLeaseholdToken is ERC721, Ownable {
    using SafeMath for uint256;

    mapping (uint256 => uint256) private _tokenRate;
    mapping (uint256 => uint256) private _tokenPrice;

    event PriceChanged(address indexed owner, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
    event Sold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 price);
    event Repossessed(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyHolder(uint256 tokenId) {
        require(msg.sender == ownerOf(tokenId), "RadicalLeaseholdToken: only token holder can perform this action");
        _;
    }

    modifier notHolder(uint256 tokenId) {
        require(msg.sender != ownerOf(tokenId), "RadicalLeaseholdToken: the token holder cannot perform this action");
        _;
    }

    modifier onlyExistingToken(uint256 tokenId) {
        require(_exists(tokenId), "RadicalLeaseholdToken: attempt to perform action on nonexistent token");
        _;
    }

    function priceOf(uint256 tokenId) public view onlyExistingToken(tokenId) returns (uint256) {
        return _tokenPrice[tokenId];
    }

    function rateOf(uint256 tokenId) public view onlyExistingToken(tokenId) returns (uint256) {
        return _tokenRate[tokenId];
    }

    // Calculate rent per year with the rate and price
    function rentOf(uint256 tokenId) public view onlyExistingToken(tokenId) returns (uint256) {
        return priceOf(tokenId).div(1000).mul(rateOf(tokenId));
    }

    // Mint new token with initial price and rate
    function mint(address to, uint256 tokenId, uint256 initialPrice, uint256 rate) public onlyOwner {
        _mint(to, tokenId);
        _tokenPrice[tokenId] = initialPrice;
        _tokenRate[tokenId] = rate;
    }

    function burn(address to, uint256 tokenId) public onlyOwner {
        _burn(to, tokenId);
        delete _tokenPrice[tokenId];
        delete _tokenRate[tokenId];
    }

    // Set a new price for the token
    // Causes existing deposited rents to be collected by the freeholder based on the old price
    // CAUTION: If the rent balance is too low this will cause repossession
    function setPriceOf(uint256 tokenId, uint256 newPrice) public onlyHolder(tokenId) onlyExistingToken(tokenId) {
        // Settle using old price first
        RadicalManager(owner()).collectRent(tokenId);

        // Set new price
        uint256 oldPrice = _tokenPrice[tokenId];
        _tokenPrice[tokenId] = newPrice;
        emit PriceChanged(ownerOf(tokenId), tokenId, oldPrice, newPrice);
    }

    // Buys the token from the current owner at the set price
    // Causes deposited rents to be collected by the freeholder
    // (and leftover be sent to the old owner)based on the old price
    // Extra ether sent to this function is used as rent deposit
    // CAUTION: If the rent balance is too low this will cause repossession
    // CAUTION: Some additional ETH needs to be sent to this function as rent,
    // if this is not done, the token is at risk of repossession.
    function buy(uint256 tokenId) public payable notHolder(tokenId) onlyExistingToken(tokenId) {
        uint256 price = priceOf(tokenId);
        require(msg.value >= price, "RadicalLeaseholdToken: did not provide right amount of ETH for purchase");

        // First send the money to the previous holder (as the token might get repossessed)
        address from = ownerOf(tokenId);
        address(uint160(from)).transfer(price);

        // Settle existing rent payments (might cause temporary repossession)
        RadicalManager(owner()).collectRent(tokenId);
        RadicalManager(owner()).withdrawRent(tokenId, 2 ** 256 - 1);

        // Transfer token (might have been repossessed)
        _transferFrom(ownerOf(tokenId), msg.sender, tokenId);

        // Prepay rent
        uint256 leftover = msg.value - price;
        RadicalManager(owner()).depositRent.value(leftover)(tokenId);

        emit Sold(from, msg.sender, tokenId, price);
    }

    // Repossess the token to a new owner. Can only be called by the manager.
    function repossess(address to, uint256 tokenId) public payable onlyOwner {
        address from = ownerOf(tokenId);
        _transferFrom(from, to, tokenId);
        emit Repossessed(from, to, tokenId);
    }

    // On every transfer (in any way) the domain's controller is set to the new leaseholder
    function _transferFrom(address from, address to, uint256 tokenId) internal {
        RadicalManager(owner()).changeDomainController(tokenId, to);
        super._transferFrom(from, to, tokenId);
    }
}
