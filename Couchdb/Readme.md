[World State](https://hyperledger-fabric.readthedocs.io/en/release-1.4/ledger/ledger.html#world-state) holds the current values of all keys in the blockchain and it is physically implemented as a database. This gives us the ability to write rich queries on the data for audit. CouchDB is the database we use for the world state implementation.  

optional reading: https://hyperledger-fabric.readthedocs.io/en/release-1.4/couchdb_tutorial.html

In our blockchain network, each peer has a couchDB database that contains the world state.Couch DB can be accessed from the peer using HTTP requests. After logging into the peer, you can run the below command to check if couchDB is running. 
\n Note:You might want to install curl if it is not already installed.

curl -X GET http://127.0.0.1:5984/


