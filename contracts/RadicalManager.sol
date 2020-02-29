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

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public virtual override returns (bytes4) {
        return ERC721_RECEIVED;
    }

    // Probably use Sablier for this
    // payRent(tokenId) payable onlyLeaseHolder
    // collectRent(tokenId) onlyFreeHolder
}
