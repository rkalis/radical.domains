pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./RadicalFreeholdToken.sol";
import "./RadicalLeaseholdToken.sol";

contract RadicalManager is IERC721Receiver {
    using SafeMath for uint256;

    RadicalLeaseholdToken leasehold;
    RadicalFreeholdToken freehold;
    bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

    mapping (uint256 => uint256) _depositedRent;
    mapping (uint256 => uint256) _lastRentSettlement;

    // TODO
    // event RentDeposited
    // event RentWithdrawn
    // event RentCollected

    modifier onlyLeaseholderOrContract(uint256 tokenId) {
        require(
            msg.sender == leasehold.ownerOf(tokenId) || msg.sender == address(leasehold),
            "RadicalManager: action can only be performed by leaseholder or contract"
        );
        _;
    }

    modifier onlyFreeholder(uint256 tokenId) {
        require(msg.sender == freehold.ownerOf(tokenId), "RadicalManager: action can only be performed by freeholder");
        _;
    }

    constructor() public {
        leasehold = new RadicalLeaseholdToken();
        freehold = new RadicalFreeholdToken();
    }

    // Parse data sent to onReceivedERC721
    function _parseBytes(bytes memory b) private pure returns (uint256, uint256) {
        uint256 price;
        uint256 rent;
        for (uint i = 0; i < 64; i++) {
            if(i < 32) {
                price = price.add(uint8(b[i]) * (2 ** (8 * (32 - (i + 1))))); // 1, 2, 3
            } else {
                rent = rent.add(uint8(b[i]) * (2 ** (8 * (32 - (i - 31))))); // 33, 34
            }
        }
        return (price, rent);
    }

    // When an ERC721 token is sent to the manager, a leasehold and freehold token
    // are minted using the passed parameters.
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public virtual override returns (bytes4) {
        // TODO: Check that only ENS tokens can be used
        (uint256 price, uint256 rent) = _parseBytes(data);
        leasehold.mint(from, tokenId, price, rent);
        freehold.mint(from, tokenId);
        return ERC721_RECEIVED;
    }

    // Deposit rent as prepayment
    function depositRent(uint256 tokenId) public payable onlyLeaseholderOrContract(tokenId) {
        _depositedRent[tokenId] = _depositedRent[tokenId].add(msg.value);
    }

    // Withdraw an amount of prepaid rent
    // Can only be withdrawn if it is not claimable by the freeholder
    // CAUTION: If no/little rent is left, the leasehold is at risk of liquidation
    function withdrawRent(uint256 tokenId, uint256 amount) public onlyLeaseholderOrContract(tokenId) {
        uint256 rent = calculateCurrentRent(tokenId);
        uint256 depositedRent = _depositedRent[tokenId];
        require(depositedRent >= rent, "RadicalManager: not enough rent deposited");

        uint256 leftover = _depositedRent[tokenId].sub(rent);
        uint256 withdrawAmount = leftover < amount ? leftover : amount;

        address leaseholder = leasehold.ownerOf(tokenId);
        payable(leaseholder).transfer(withdrawAmount);
    }

    // Collect currently owed rent.
    // Calculates the amount of rent that is due, and withdraws this.
    // Updates the last settlement variable.
    // If the deposited rent can not cover the rent owed, the leasehold token is
    // repossessed to the freeholder.
    function collectRent(uint256 tokenId) public {
        uint256 rent = calculateCurrentRent(tokenId);
        _lastRentSettlement[tokenId] = block.timestamp;
        address freeholder = freehold.ownerOf(tokenId);

        // If the leaseholder can't pay their rent, their property is repossed
        if (_depositedRent[tokenId] < rent) {
            rent = _depositedRent[tokenId];
            leasehold.repossess(freeholder, tokenId);
        }

        // Transfer rent to freeholder
        payable(freeholder).transfer(rent);
    }

    function calculateCurrentRent(uint256 tokenId) private view returns (uint256) {
        uint256 lastSettlement = _lastRentSettlement[tokenId];
        uint256 timePassed = block.timestamp - lastSettlement;
        uint256 rentPerYear = leasehold.rentOf(tokenId);
        uint256 rent = rentPerYear.div(52 weeks).mul(timePassed); // Not entirely accurate due to leap years

        return rent;
    }
}
