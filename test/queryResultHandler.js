'use strict';

require('truffle-test-utils').init();
const QueryResultHandler = artifacts.require("./QueryResultHandler.sol");
const csv = require('fast-csv');
const inputFile = './test/example_result.csv';
const CsvReader = require('promised-csv');


contract('QueryResultHandler', function() {
  let instance;

  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("storeQueryResults: returns Error event (Query ID must be greater than 0)", async () => {
    let result = await instance.storeQueryResults(0, 0, "a", "b");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query ID must be greater than 0'
      }
    }, 'Error event when query ID is less than or equal to 0');
  });

  it("storeQueryResults: returns Error event (Result ID must be greater than 0)", async () => {
    let result = await instance.storeQueryResults(1, 0, "a", "b");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Result ID must be greater than 0'
      }
    }, 'Error event when result ID is less than or equal to 0');
  });

  it("storeQueryResults: returns Errore event (Query string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, "", "");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query string must be provided'
      }
    }, 'Error event when query string is empty');
  });

  it("storeQueryResults: returns Error event (Result string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, "a", "");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Result string must be provided'
      }
    }, 'Error event when result string is empty');
  });

  it("storeQueryResults: returns error (Invalid number of arguments to Solidity function)", async () => {
    let err = null
    try {
      await instance.storeQueryResults(1);
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error);
    assert.equal(err.message, "Invalid number of arguments to Solidity function");
  });

  it("storeQueryResults: returns error (BigNumber Error: new BigNumber() not a number)", async () => {
    let err = null
    try {
      await instance.storeQueryResults("a", 1, "a", "b");
    } catch (error) {
      err = error;
    }
    assert.ok(err instanceof Error);
    assert.equal(err.message, "new BigNumber() not a number: a");
  });

  it("storeQueryResults: returns Error event (Query string must be provided)", async () => {
    let result = await instance.storeQueryResults(1, 1, 1, "b");
    assert.web3Event(result, {
      event: 'Error',
      args: {
        errorMessage: 'Query string must be provided'
      }
    }, 'Error event when query string is empty');
  });

  it("Validation should return false, if the query ID and the result set ID are not stored yet", async () => {
    instance.validateQueryResultsById.call(1, 2).then(function(valid) {
      assert.equal(valid, false, "The query ID is already stored");
    });
  });

  it("Validation should return false, if the query and the result set are not stored yet", async () => {
    instance.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, false, "The query ID is already stored");
    });
  });

  it("Should store a query ID, result set ID, query and result set", async () => {
    //var resultSet = await readCSV(inputFile);
    //console.log(resultSet);
    instance.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, false);
    });
    instance.storeQueryResults(1, 21, "a", "b");
    instance.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, true);
    });
  });

  it("Should store a query ID, result set ID, query and result set", async () => {
    //var resultSet = await readCSV(inputFile);
    //console.log(resultSet);
    instance.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, true);
    });
    instance.storeQueryResults(1, 21, "a", "b");
    instance.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, true);
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
})
