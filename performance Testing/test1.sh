test=string1string2
peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccountTest",'\"$test\"']}'
