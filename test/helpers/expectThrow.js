module.exports = async (promise, expectedMsg) => {
  try {
    await promise;
  } catch (error) {
    assert.equal(error.reason, expectedMsg);
    return;
  }
  assert.fail('Expected throw not received');
};