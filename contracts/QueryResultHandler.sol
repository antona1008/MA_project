pragma solidity ^0.4.4;

contract QueryResultHandler {

  struct QueryResultStruct {
      bytes32 finalHash;
      bytes32 queryHash;
      bytes32 resultHash;
      uint256 queryId;
      uint256 resultId;
  }

  QueryResultStruct[] queryResultStructArray;

  mapping(uint256=>bytes32[]) idRowArrayMapping;

  function storeQueryResults(uint256 _queryId, uint256 _resultId, string _queryString, string _resultString) external returns (bool success) {
    bytes32 queryHash = keccak256(_queryString);
    bytes32 resultHash = keccak256(_resultString);
    bytes32 hashThem = keccak256(queryHash, resultHash);
    queryResultStructArray.push(QueryResultStruct(hashThem, queryHash, resultHash, _queryId, _resultId));
    return true;
  }

  function validateQueryResultsById(uint256 _queryId, uint256 _resultId) external view returns (bool success ) {
    for (uint i = 0; i < queryResultStructArray.length; i++) {
        if (queryResultStructArray[i].queryId == _queryId
        && queryResultStructArray[i].resultId == _resultId) {
            return true;
        }
    }
    return false;
  }

  function validateQueryResultsByString(string _queryString, string _resultString) external view returns (bool success ) {
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

  function storeRow(uint256 _id, string _row) external returns (bool success) {
    bytes32 rowHash = keccak256(_row);
    idRowArrayMapping[_id].push(rowHash);

    return true;
  }

  function validateRow(uint256 _id, string _row) external view returns (bool success) {
    bytes32 rowHash = keccak256(_row);
    bytes32[] storage dataSet = idRowArrayMapping[_id];

    for (uint i = 0; i < dataSet.length; i++) {
      if (dataSet[i] == rowHash) {
        return true;
      }
    }
    return false;
  }
}
