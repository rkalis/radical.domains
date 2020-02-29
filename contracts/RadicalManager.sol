pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Receiver.sol";
import "./RadicalFreeholdToken";
import "./RadicalLeaseholdToken";

contract RadicalManager is ERC721Receiver {
    RadicalLeaseholdToken leasehold;
    RadicalFreeholdToken freehold;
    bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

    constructor(address _leasehold, address _freehold) {
        leasehold = RadicalLeaseholdToken(_leasehold);
        freehold = RadicalFreeholdToken(_freehold);
    }

    function onERC721Received(address _from, uint256 _tokenId, bytes _data) public returns(bytes4) {
        return ERC721_RECEIVED;
    }

    // Probably use Sablier for this
    // payRent(tokenId) payable onlyLeaseHolder
    // collectRent(tokenId) onlyFreeHolder
}
