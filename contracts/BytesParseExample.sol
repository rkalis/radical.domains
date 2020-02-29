pragma solidity ^0.4.8;

contract c {
    event yeet(uint256 a);
    
    // bytes should be length of 128 
    // The first 64 bytes are for number
    // The last 64 bytes are for number2
    // example 0000000000000000000000000000000000000000000000000000000000000001ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    //      number = 1
    //      number2 = 115792089237316195423570985008687907853269984665640564039457584007913129639935

    function test64(bytes b){
        uint256 number;
        uint256 number2;
        for(uint i=0;i<64;i++){
            if(i < 32){
                number = number + uint(b[i])*(2**(8*(32-(i+1)))); // 1, 2, 3
            }
            else{
                number2 = number2 + uint(b[i])*(2**(8*(32-(i-31)))); // 33, 34
            }
        }
        emit yeet(number);
        emit yeet(number2);
    }       
}
