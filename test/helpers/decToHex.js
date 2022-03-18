module.exports = (number, decimal) => {
  return web3.utils.toBN(`0x${(number * 10 ** decimal).toString(16)}`)
}