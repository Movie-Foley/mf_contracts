module.exports = (number, decimal) => {
  return (number * 10 ** decimal).toString(16)
}