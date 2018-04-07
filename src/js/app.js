window.App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    $('#queryFile').bind('change', function() {
      var reader = new FileReader();
      reader.onload = function() {
        $("#queryStringInput").innerHTML = reader.result;
        var resultArray = reader.result.replace(/\n/g, " ").split(" ");
        console.log(resultArray);
        $("#queryStringInput").append(resultArray);
      }

      var fileInput = document.getElementById("queryFile");
      reader.readAsBinaryString(fileInput.files[0]);
    });
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('QueryResultHandler.json', function(data) {
      var QueryResultArtifact = data;
      App.contracts.QueryResultHandler = TruffleContract(QueryResultArtifact);
      App.contracts.QueryResultHandler.setProvider(App.web3Provider);
    });
    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#test', App.storeInput);
  },

  storeInput: function(event) {
    var queryResultHandlerinstance;
    App.contracts.QueryResultHandler.deployed().then(function(instance) {
      queryResultHandlerinstance = instance;

      return queryResultHandlerinstance.storeQueryResults(1, 2, "a", "b", {
        from: web3.eth.accounts[0],
        gas: 3000000
      });
    }).then(function(success) {
      alert("success");
    }).catch(function(err) {
      alert(err.message);
    });
  },



};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
