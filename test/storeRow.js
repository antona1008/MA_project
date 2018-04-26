'use strict';

require('truffle-test-utils').init();

const QueryResultHandler = artifacts.require("./QueryResultHandler");
let instance;

contract('storeRow() function test', function() {

  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("(1,'a'): returns RowStored event", async () => {
    let result = await instance.storeRow(1, "a");
    assert.web3Event(result, {
      event: 'RowStored'
    }, 'Storing valid input failed');
  });

  it("(0,'a'): returns Error event (Result ID must be greater than 0)", async () => {
    let result = await instance.storeRow(0, "a");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Result ID must be greater than 0'
      }
    }, 'Error event is missing when result ID is equal to 0');
  });


  it("(1,''): returns Error event (Row string must be provided)", async () => {
    let result = await instance.storeRow(1,'');
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Row string must be provided'
      }
    }, 'Error event is missing when result string is empty');
  });

  it("(1): returns error (Invalid number of arguments to Solidity function)", async () => {
    let err = null
    try {
      await instance.storeRow(1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "Invalid number of arguments to Solidity function", 'Invalid number of arguments error was not thrown');
  });

  it("('a','a'): returns error (BigNumber Error: new BigNumber() not a number)", async () => {
    let err = null
    try {
      await instance.storeRow("a", "a");
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "new BigNumber() not a number: a", 'BigNumber error was not thrown');
  });

  it("(1,1): returns Error event (Row string must be provided)", async () => {
    let result = await instance.storeRow(1, 1);
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Row string must be provided'
      }
    }, 'Error event is missing when row is an integer');
  });
})
