pragma solidity ^0.6.3;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract MockRegistry is ERC721 {

    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }
    
    mapping (string => Record) records;

    function register(string memory name, address owner) public {
        records[name].owner = msg.sender;
    }
}
