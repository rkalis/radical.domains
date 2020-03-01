pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract RadicalFreeholdToken is ERC721, Ownable {
    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }

    function burn(address to, uint256 tokenId) public onlyOwner {
        _burn(to, tokenId);
    }
}
