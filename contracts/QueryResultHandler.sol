pragma solidity ^ 0.4.4;

contract QueryResultHandler {

  struct QueryResultStruct {
    bytes32 finalHash;
    bytes32 queryHash;
    bytes32 resultHash;
    uint256 queryId;
    uint256 resultId;
  }

  QueryResultStruct[] queryResultStructArray;

  event Error(string errorMessage);

  function storeQueryResults(uint256 _queryId, uint256 _resultId, string _queryString, string _resultString) external returns(bool success) {
    if (_queryId <= 0) {
      Error("Query ID must be greater than 0");
      return false;
    }
    if (_resultId <= 0) {
      Error("Result ID must be greater than 0");
      return false;
    }
    if (bytes(_queryString).length == 0) {
      Error("Query string must be provided");
      return false;
    }
    if (bytes(_resultString).length == 0) {
      Error("Result string must be provided");
      return false;
    }

    bytes32 queryHash = keccak256(_queryString);
    bytes32 resultHash = keccak256(_resultString);
    bytes32 hashThem = keccak256(queryHash, resultHash);

    queryResultStructArray.push(QueryResultStruct(hashThem, queryHash, resultHash, _queryId, _resultId));
    return true;
  }

  function validateQueryResultsById(uint256 _queryId, uint256 _resultId) external view returns(bool success) {
    for (uint i = 0; i < queryResultStructArray.length; i++) {
      if (queryResultStructArray[i].queryId == _queryId &&
        queryResultStructArray[i].resultId == _resultId) {
        return true;
      }
      return false;
    }
  }

    function validateQueryResultsByString(string _queryString, string _resultString) external view returns(bool success) {
      bytes32 queryHash = keccak256(_queryString);
      bytes32 resultHash = keccak256(_resultString);
      bytes32 hashThem = keccak256(queryHash, resultHash);

      for (uint i = 0; i < queryResultStructArray.length; i++) {
        if (queryResultStructArray[i].finalHash == hashThem) {
          return true;
        }
      }
      return false;
    }

    function() public {
      Error("Function is not defined");
    }
}
