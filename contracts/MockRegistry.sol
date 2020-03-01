pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

contract MockRegistry is ERC721 {

    mapping (uint => bytes) public hashToName;

    event NewRegistration(address registrant, uint tokenId, bytes name);

    function register(bytes memory name) public {
        require(name.length > 0, "Domain name should be at least 1 character");

        uint nameHash = uint(keccak256(name));
        require(hashToName[nameHash].length == 0, "Already registered"); // Already registered

        hashToName[nameHash] = name;
        _safeMint(msg.sender, nameHash);

        emit NewRegistration(msg.sender, nameHash, name);
    }


}
