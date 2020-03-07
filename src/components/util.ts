import Web3 from "web3";
import { BigNumber, bigNumberify } from "ethers/utils";

function _getIt(varr: number) {
  var rt = ""
  var varr_hex = Web3.utils.toHex(varr);
  varr_hex = varr_hex.substring(2)
  var zeroes = 64 - varr_hex.length;
  for (var i = 0; i < zeroes; i++) {
      rt = rt + "0";
  }
  rt = rt + varr_hex;
  return rt
}

export function encode(price: string, rent: string) {
  var str = "0x"
  str = str + _getIt(Number(price));
  str = str + _getIt(Number(rent));
  return str
}

export function formatAddress(address: string): string {
  return `${address.substr(0, 6)}...${address.substr(address.length - 4, 4)}`
}

export function formatTimeRemaining(seconds?: BigNumber): string {
  if (seconds === undefined) return ''
  const pad = (t: string): string => t.length < 2 ? pad(`0${t}`) : t

  const days = Math.floor(seconds.div(3600 * 24).toNumber())
  seconds = seconds.sub(bigNumberify(days).mul(3600 * 24))
  const hours = Math.floor(seconds.div(3600).toNumber())
  seconds = seconds.sub(hours * 3600)
  const minutes = Math.floor(seconds.div(60).toNumber())
  seconds = seconds.sub(minutes * 60)

  return `${days}d ${pad(hours.toString())}h ${pad(minutes.toString())}m ${pad(seconds.toString())}s`
}
