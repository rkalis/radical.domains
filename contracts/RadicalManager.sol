pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "./RadicalFreeholdToken.sol";
import "./RadicalLeaseholdToken.sol";

contract RadicalManager is IERC721Receiver {
    RadicalLeaseholdToken leasehold;
    RadicalFreeholdToken freehold;
    bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

    constructor() public {
        leasehold = new RadicalLeaseholdToken();
        freehold = new RadicalFreeholdToken();
    }

    function _parseBytes(bytes memory b) private returns (uint256, uint256) {
        uint256 price;
        uint256 rent;
        for(uint i=0;i<64;i++){
            if(i < 32){
                price = price + uint8(b[i])*(2**(8*(32-(i+1)))); // 1, 2, 3
            }
            else{
                rent = rent + uint8(b[i])*(2**(8*(32-(i-31)))); // 33, 34
            }
        }
        return (price, rent);
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public virtual override returns (bytes4) {
        (uint256 price, uint256 rent) = _parseBytes(data);
        leasehold.mint(from, tokenId, price, rent);
        freehold.mint(from, tokenId);
        return ERC721_RECEIVED;
    }

    // Probably use Sablier for this
    // payRent(tokenId) payable onlyLeaseHolder
    // collectRent(tokenId) onlyFreeHolder
}
