'use strict';

const QueryResultHandler = artifacts.require("./QueryResultHandler.sol");
const csv = require('fast-csv');
const inputFile = './test/example_result.csv';
const CsvReader = require('promised-csv');


contract('QueryResultHandler', function() {
  let queryResultHandlerContract;

  beforeEach('Setup contract for each test', async function() {
    queryResultHandlerContract = await QueryResultHandler.deployed();
  });

  it("Validation should return false, if the query ID and the result set ID are not stored yet", async () => {
    queryResultHandlerContract.validateQueryResultsById.call(1, 2).then(function(valid) {
      assert.equal(valid, false, "The query ID is already stored");
    });
  });

  it("Validation should return false, if the query and the result set are not stored yet", async () => {
    queryResultHandlerContract.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, false, "The query ID is already stored");
    });
  });

  it("Should store a query ID, result set ID, query and result set", async () => {
    //var resultSet = await readCSV(inputFile);
    //console.log(resultSet);
    queryResultHandlerContract.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, false);
    });
    queryResultHandlerContract.storeQueryResults(1, 21, "a", "b");
    queryResultHandlerContract.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, true);
    });
  });

  it("Should store a query ID, result set ID, query and result set", async () => {
    //var resultSet = await readCSV(inputFile);
    //console.log(resultSet);
    queryResultHandlerContract.validateQueryResultsByString.call("a", "b").then(function(valid) {
      assert.equal(valid, false);
    });
    queryResultHandlerContract.storeQueryResults(1, 21, "a", "b");
    queryResultHandlerContract.validateQueryResultsByString.call("a", "b").then(function(valid) {
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
