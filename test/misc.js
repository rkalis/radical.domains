function _getIt(varr) {
    var rt = "";
    var varr_hex = web3.utils.toHex(varr);
    varr_hex = varr_hex.substring(2)
    var zeroes = 64 - varr_hex.length;
    for (var i = 0; i < zeroes; i++) {
        rt = rt + "0";
    }
    rt = rt + varr_hex;
    return rt
}

function encode(price, rent) {
    var str = "0x";
    str = str + _getIt(price);
    str = str + _getIt(rent);
    return str
}