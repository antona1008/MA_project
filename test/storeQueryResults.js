'use strict';

require('truffle-test-utils').init();

const QueryResultHandler = artifacts.require("./QueryResultHandler");
const csv = require('fast-csv');
const inputFile = './test/example_result.csv';
const CsvReader = require('promised-csv');
let instance;

contract('storeQueryResults() function test', function() {

  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("(1,1,'a','b'): returns QueryResultStored(1, 1) event", async () => {
    let result = await instance.storeQueryResults(1, 1, "a", "b");
    assert.web3Event(result, {
      event: 'QueryResultStored',
      args: {
        queryId: 1,
        resultId: 1
      }
    }, 'Storing valid input failed');
  });

  it("(0,0,'a','b'): returns Error event (Query ID must be greater than 0)", async () => {
    let result = await instance.storeQueryResults(0, 0, "a", "b");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query ID must be greater than 0'
      }
    }, 'Error event is missing when query ID is equal to 0');
  });

  it("(1,0,'a','b'): returns Error event (Result ID must be greater than 0)", async () => {
    let result = await instance.storeQueryResults(1, 0, "a", "b");
    assert.web3Event(result, {
        event: 'Error',
        args: {
          errorMessage: 'Result ID must be greater than 0'
        }
      },
      'Error event is missing when result ID is equal to 0');
  });

  it("1,1,'',''): returns Error event (Query string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, "", "");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query string must be provided'
      }
    }, 'Error event when query string is empty');
  });

  it("(1,1,'a',''): returns Error event (Result string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, "a", "");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Result string must be provided'
      }
    }, 'Error event when result string is empty');
  });

  it("(1): returns error (Invalid number of arguments to Solidity function)", async () => {
    let err = null
    try {
      await instance.storeQueryResults(1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "Invalid number of arguments to Solidity function", 'Invalid number of arguments error was not thrown');
  });

  it("('a',1,'a','b'): returns error (BigNumber Error: new BigNumber() not a number)", async () => {
    let err = null
    try {
      await instance.storeQueryResults("a", 1, "a", "b");
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "new BigNumber() not a number: a", 'BigNumber error was not thrown');
  });

  it("(1,1,1,'b'): returns Error event (Query string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, 1, "b");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query string must be provided'
      }
    }, 'Error event is missing when result string is an integer');
  });

  it("(nonExistentFunction: returns error (instance.nonExistentFunction is not a function)", async () => {
    let err = null
    try {
      await instance.nonExistentFunction(1, 1, "a", "b");
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error, 'No error was thrown');
    assert.equal(err.message, "instance.nonExistentFunction is not a function", 'Not a function error was not thrown');
  });
});


function readCSV(inputFile) {
  var reader = new CsvReader();
  var output = [];
  reader.on('row', function(data) {
    //console.log(data);
    output.push(data[0]);
  });

  return reader.read(inputFile, output);
}
