'use strict';

const QueryResultHandler = artifacts.require("./QueryResultHandler");
const ViewResultCodes = {
  Success: 0,
  NoMatchFound: 1,
  IntegerNotPositive: 2,
  StringEmpty: 3
};

let instance;

contract('validateRow() function test', function() {
  beforeEach('Setup contract for each test', async function() {
    instance = await QueryResultHandler.deployed();
  });

  it("(0,'a'): Should return the IntegerNotPositive code", async () => {
    instance.validateRow.call(0, 'a').then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,''): Should return the StringEmpty code", async () => {
    instance.validateRow.call(1, 0).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
    });
  });

  it("('a',1): Should return the IntegerNotPositive code", async () => {
    instance.validateRow.call("a", 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.IntegerNotPositive, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,1): Should return the StringEmpty code", async () => {
    instance.validateRow.call(1, 1).then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.StringEmpty, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,'a'): Should return the NoMatchFound code", async () => {
    instance.validateRow.call(1, "a").then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.NoMatchFound, "Returned code was: " + viewResultCode);
    });
  });

  it("(1,'a'): Should return the Success code", async () => {
    instance.storeRow(1, "a");
    instance.validateRow.call(1, "a").then(function(viewResultCode) {
      assert.equal(viewResultCode, ViewResultCodes.Success, "Returned code was: " + viewResultCode);
    });
  });
});
