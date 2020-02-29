pragma solidity ^0.6.3;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract MockRegistry is ERC721 {

    mapping (uint => string) public hashToName;

    event NewRegistration(address registrant, string name);

    function register(string memory name) public {
        uint nameHash = uint(keccak256("hello"));
        hashToName[nameHash] = name;
        _safeMint(msg.sender, nameHash);
    }


}
