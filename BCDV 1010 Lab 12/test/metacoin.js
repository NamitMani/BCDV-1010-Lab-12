const MetaCoin = artifacts.require("MetaCoin");

contract('MetaCoin', (accounts) => {
  console.log(accounts[0])
  it('should put 10000 MetaCoin in the first account', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const balance = await metaCoinInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
  it('should call a function that depends on a linked library', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();

    const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();
    console.log("metaCoin balance:", metaCoinBalance)
    console.log("metaCoinEthBalance balance: ", metaCoinEthBalance)

    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  });
  it('should send coin correctly', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });

//FIRST NEW TEST CASE
  it('should handle multiple sends correctly', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    // Make multiple transactions from first account to second.
    const amount1 = 10;
    const amount2 = 20;
    const amount3 = 30;
    await metaCoinInstance.sendCoin(accountTwo, amount1, { from: accountOne });
    await metaCoinInstance.sendCoin(accountTwo, amount2, { from: accountOne });
    await metaCoinInstance.sendCoin(accountTwo, amount3, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    assert.equal(accountOneEndingBalance, accountOneStartingBalance - (amount1 + amount2 + amount3), "Amount wasn't correctly taken from the sender for multiple transactions");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + (amount1 + amount2 + amount3), "Amount wasn't correctly sent to the receiver for multiple transactions");
  });
//SECOND NEW TEST CASE
  it('should not allow the same owner address to be set twice', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const newOwner = accounts[1];
    await metaCoinInstance.transferOwnership(newOwner);
    try {
      await metaCoinInstance.transferOwnership(newOwner);
      assert.fail("Transaction should have thrown an error")
    } catch (err) {
      assert.include(err.message, 'revert', 'Transaction did not revert with a "revert" error message');
    }
  });
//THIRD NEW TEST CASE
  it('should not allow negative amounts to be sent', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const accountOne = accounts[0];
    const accountTwo = accounts[1];
    try {
      await metaCoinInstance.sendCoin(accountTwo, -10, { from: accountOne });
      assert.fail("Transaction should have thrown an error")
    } catch (err) {
      assert.include(err.message, 'revert', 'Transaction did not revert with a "revert" error message');
    }
  });  
});
