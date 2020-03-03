interface BaseRegistrarController{
    function renew(string calldata name, uint duration) external payable;
    function rentPrice(string calldata name, uint duration) view external returns(uint);

    event NameRenewed(string name, bytes32 indexed label, uint cost, uint expires);
}