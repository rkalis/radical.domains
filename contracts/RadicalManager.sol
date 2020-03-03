pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "@ensdomains/ens/contracts/ENS.sol";
import "./BaseRegistrar.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./RadicalFreeholdToken.sol";
import "./RadicalLeaseholdToken.sol";

contract RadicalManager is IERC721Receiver {
    using SafeMath for uint256;

    RadicalLeaseholdToken public leasehold;
    RadicalFreeholdToken public freehold;
    // ENS ens = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    BaseRegistrar registrar = BaseRegistrar(0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85);

    bytes4 constant ERC721_RECEIVED = 0x150b7a02;

    mapping (uint256 => uint256) _depositedRent;
    mapping (uint256 => uint256) _lastRentSettlement;

    // TODO
    event Radicalised(address indexed owner, uint256 indexed tokenId);
    event Unradicalised(address indexed owner, uint256 indexed tokenId);
    event RentDeposited(address indexed depositor, uint256 indexed tokenId, uint256 amount);
    event RentWithdrawn(address indexed withdrawer, uint256 indexed tokenId, uint256 amount);
    event RentCollected(address indexed collector, uint256 indexed tokenId, uint256 amount);

    modifier onlyLeaseholderOrContract(uint256 tokenId) {
        require(
            msg.sender == leasehold.ownerOf(tokenId) || msg.sender == address(leasehold),
            "RadicalManager: action can only be performed by leaseholder or contract"
        );
        _;
    }

    modifier onlyLeaseholdContract() {
        require(msg.sender == address(leasehold), "RadicalManager: action can only be performed by leasehold contract");
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
        uint256 rate;
        for (uint i = 0; i < 64; i++) {
            if(i < 32) {
                price = price.add(uint8(b[i]) * (2 ** (8 * (32 - (i + 1))))); // 1, 2, 3
            } else {
                rate = rate.add(uint8(b[i]) * (2 ** (8 * (32 - (i - 31))))); // 33, 34
            }
        }
        return (price, rate);
    }

    // When an ERC721 token is sent to the manager, a leasehold and freehold token
    // are minted using the passed parameters.
    function onERC721Received(
        address /* operator */,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public returns (bytes4) {
        // TODO: Check that only ENS tokens can be used
        (uint256 price, uint256 rate) = _parseBytes(data);
        leasehold.mint(from, tokenId, price, rate);
        freehold.mint(from, tokenId);

        emit Radicalised(from, tokenId);
        return ERC721_RECEIVED;
    }

    function unradicalise(uint256 tokenId) public {
        require(freehold.ownerOf(tokenId) == msg.sender, "Only freehold owners can unradicalise tokens");
        require(leasehold.ownerOf(tokenId) == msg.sender, "Only leasehold owners can unradicalise tokens");
        freehold.burn(msg.sender, tokenId);
        leasehold.burn(msg.sender, tokenId);
        registrar.transferFrom(address(this), msg.sender, tokenId);
        emit Unradicalised(msg.sender, tokenId);
    }

    // Deposit rent as prepayment
    function depositRent(uint256 tokenId) public payable onlyLeaseholderOrContract(tokenId) {
        _depositedRent[tokenId] = _depositedRent[tokenId].add(msg.value);

        address leaseholder = leasehold.ownerOf(tokenId);
        emit RentDeposited(leaseholder, tokenId, msg.value);
    }

    // Withdraw an amount of prepaid rent
    // Can only be withdrawn if it is not claimable by the freeholder
    // CAUTION: If no/little rent is left, the leasehold is at risk of repossession
    function withdrawRent(uint256 tokenId, uint256 amount) public onlyLeaseholderOrContract(tokenId) {
        uint256 rent = calculateCurrentRent(tokenId);
        uint256 depositedRent = _depositedRent[tokenId];
        require(depositedRent >= rent, "RadicalManager: not enough rent deposited");

        uint256 available = depositedRent.sub(rent);
        uint256 withdrawAmount = available < amount ? available : amount;

        _depositedRent[tokenId] = _depositedRent[tokenId].sub(withdrawAmount);
        address leaseholder = leasehold.ownerOf(tokenId);
        if (withdrawAmount > 0) address(uint160(leaseholder)).transfer(withdrawAmount);
        emit RentWithdrawn(leaseholder, tokenId, withdrawAmount);
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

        // // Transfer rent to freeholder
        _depositedRent[tokenId] = _depositedRent[tokenId].sub(rent);
        if (rent > 0) address(uint160(freeholder)).transfer(rent);
        emit RentCollected(freeholder, tokenId, rent);
    }

    function calculateCurrentRent(uint256 tokenId) private view returns (uint256) {
        uint256 lastSettlement = _lastRentSettlement[tokenId];
        uint256 timePassed = block.timestamp.sub(lastSettlement);
        uint256 rentPerYear = leasehold.rentOf(tokenId);
        uint256 rent = rentPerYear.div(52 weeks).mul(timePassed); // Not entirely accurate due to leap years

        return rent;
    }

    function changeDomainController(uint256 tokenId, address newController) external onlyLeaseholdContract {
        registrar.reclaim(tokenId, newController);
    }
}
