[World State](https://hyperledger-fabric.readthedocs.io/en/release-1.4/ledger/ledger.html#world-state) holds the current values of all keys in the blockchain and it is physically implemented as a database. This gives us the ability to write rich queries on the data for audit. CouchDB is the database we use for the world state implementation.  

optional reading: https://hyperledger-fabric.readthedocs.io/en/release-1.4/couchdb_tutorial.html

In our blockchain network, each peer has a couchDB database that contains the world state.Couch DB can be accessed from the peer using HTTP requests. After logging into the peer, you can run the below command to check if couchDB is running. 

curl -X GET http://127.0.0.1:5984/
(Note:You might want to install curl if it is not already installed.)

### Adding new design document and views for efficient data retrieval
Below command adds a new design document with several views. 
```
curl -X PUT http://127.0.0.1:5984/channel1_cc/_design/moneyOwed --data-binary @MoneyOwed.json
```
### Retrieving data from the views
Below commands retrievs data using the above created design document and views.
```
curl -g -X GET http://127.0.0.1:5984/channel1_cc/_design/moneyOwed/_view/totalAccounts?key=[\"B\",\"A\",\"unpaid\"]
```

### Exporting data from state database
An interesting use case is to export the contents of the World state to a remote couchDB database using [couchDB replication](http://docs.couchdb.org/en/stable/replication/intro.html). This can be used by lane controller which might not have sufficient bandwidth to connect to the peer on the network. By regularly running the below command, the lane controllers can just copy the entire world state to a local couchDB database. (Note: use appropriate username, password and ip address for the target couchDB database).
```
curl -X POST http://127.0.0.1:5984/_replicate -d '{"source":"http://127.0.0.1:5984/channel1_cc","target":"http://username:password@xx.xxx.xxx.xxx:5984/xxx"}' -H "Content-Type: application/json"
```
