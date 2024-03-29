# Prerequisites
1. Download the required programs to run Hyperledger Fabric. Visit http://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html and make sure to install the appropriate versions for your OS.
2. Install the Google Cloud SDK. Follow the steps in this link https://cloud.google.com/sdk/docs/quickstarts.
3. Use the newly installed gcloud commands to install kubectl here: https://kubernetes.io/docs/tasks/tools/install-kubectl/.
# Steps
1. Create a Google Cloud Platform account.
2. Create a project so you can run containers and configure clusters.
3. Set up a cluster on Kubernetes, under "Kubernetes Engine". IMPORTANT!!! Make the cluster with only 1 node, and DO NOT autoscale!
4. Connect to the cluster via terminal with the command obtained by clicking "Connect", to the right of the cluster name. This will let you gain access to your cluster.
# Create and deploy network in the single-node Kubernetes cluster
1. Clone the network files into your intended directory.
2. Change directory into MPnetwork (cd MPnetwork), and then (ls). You should see configFiles, artifacts, test_setup_blockchainNetwork.sh, and testDeleteNetwork.sh.
3. Ensure that you enable permissions for the scripts to run. Run commands: $ chmod +x test_setup_blockchainNetwork.sh || $ chmod +x testDeleteNetwork.sh
4. Deploy the network with the command $ test_setup_blockchainNetwork.sh
# Upgrade Chaincode
You can upgrade the chaincode after deploying the network. Run the below script to upgrade your chaincode. 

UpgradeChaincode.sh

You need to add new chaincode to the file at this location: artifacts/chaincode/chaincode_example02/chaincode_example02.js
Before you run the script, remember to set the new version of the chaincode in below two files 
1. configFiles/UpgradeChaincode/NewChaincodeInstall.yaml  
2. configFiles/UpgradeChaincode/ChaincodeUpgrade.yaml
# Functions
1. First, although the network is set up, you need to enter the bash shell of a peer with the command ($ kubectl exec -it [blockchain-org1peer1 pod name] bash). So for this network, the command would be ($ kubectl exec -it blockchain-org1peer1 bash). The command to exit the bash shell is simply ($ exit).
2. The account data is present in GCPnetwork/artifacts/chaincode/chaincode_example02/account.json You can now load this data into the blockchain network using this command: peer chaincode invoke -n cc -C channel1 -c '{"Args":["InitLedger","account.json"]}'
3. To check the current account status and other account details, you can use this query command: peer chaincode query -C channel1 -n cc -c '{"Args":["queryAccount", "B608843779"]}'
4. In order to update the account status, you can use this command: peer chaincode invoke -C channel1 -n cc -c '{"Args":["changeAccountStatus", "B608843779", "1"]}'
# Important Notes
1. Remember that the network can only support one node! If the cluster started with multiple nodes, certain jobs would run on different nodes than intended and would lead to inconsistencies with which nodes have the files and could cause errors during various steps in the script.
2. When creating the persistent volume and its corresponding persistent volume claim, a storageClassName MUST be specified. This is not necessary in an IBM implementation of the network, but will lead to an infinite pending state of container creation if neglected in a Google Cloud Platform launch of the network.
3. The mountPath directory itself is not important, but it is important that every job and deployment have the same mountPath. This iteration of the network uses /public as a mountPath, which creates/uses a directory called public in the cloud, but one could just as easily call it /potato or /arbitrary as long as the name of the directory is consistent throughout every part of the network.
4. The setup script does not contain any independent functions aside from copying the artifacts from the local directory to the cloud directory. All other commands are to create jobs and deployments and utilize echoes to streamline the process of setting up the network.
5. Deleting the network after a failed setup is crucial to avoid errors on the next setup. Always delete the network after the deployment has failed or done using it.
6. If you want to change the mountPath directory, not only must it be changed in all configFiles files, the contents of the artifacts folders must be fixed as well, particularly the certificate authorities files.
# Functionalities of each file in configFiles
1. CreateVolume - This file creates the persistent volume and persistent volume claim that the network uses to store data from containers so that the logs for containers are maintained even after their deletion. This is a critical element of container technology. Since it logs all the data from containers, it must be created first to ensure that every execution and error is kept account of after the deletion of all subsequent containers.

2. CopyArtifacts - The files in the artifacts folder must be copied from the user's local directory to the cloud directory and this job facilitates that process. While the actual copy command is written into the setup script, the container in this job clears out the public directory in case there are errant files, as well as ensures that the script does not advance until the artifacts are properly copied into the specified cloud directory.

3. GenerateArtifacts - After being copied into the cloud directory, the files in the artifacts folder are used to generate the programs needed to create the certificate authorities and genesis block for the network. This job uses three containers: one to generate the certificate authorities, one to specify the organization configurations as well as start the genesis block, and one to confirm the bootstrapping of the network. Once this job is completed, the certificates for all organizations including the orderer will be generated and the blockchain will be initiated with the genesis block. The parameters of the organizations will also have been specified, such as which peers will serve as anchor peers.

4. BlockchainServices - Here is where the actual services are created to play the parts of orderer and peers. Ports to access the services are specified here so that the services can be manipulated and the names of the services are given. While the services may be named, such as "blockchain-org1peer1", the association between the services and the organizations are not formed until the PeersDeployment step. In short, the names given here mean nothing except for being unique identifiers for each service.

5. PeersDeployment - At the beginning of this step, the services have been created, but links to organizations and anchor peer designations have not yet occured. This file consists of multiple deployments, which form the associations between services and their intended locations within different organizations and the orderer node. Each deployment specifies environment variables and exposes ports for its respective node within the network. Paths to MSP directories are also specified within the environment variables. IMPORTANT: state database options for peers are selected here. The current options are GoLevelDB or CouchDB. CouchDB allows for more extensive (rich) querying but requires additional setup.

6. CreateChannel - The configtx file is created in the first of two containers within the CreateChannel job. The second container then utilizes this configtx file to create the channel and link it with the orderer. Parameters such as channel name are specified in the environment variables. IMPORTANT: if your cluster has more than one node, this is most likely the job where you will start running into problems.

7. JoinChannel - This job exists to join the peers to the newly created channel. Unlike the PeersDeployment file, which contained a deployment for each peer, this file only contains one job that contains individual containers to join peers to the channel.
8. ChaincodeInstall - Chaincode must be installed over every peer so that all peers in the network can perform queries and invokes on the various electronic wallets. The chaincode being installed in this case is the base chaincode from IBM Corp. All business logic is contained within the chaincode and the chaincode file is the file to be modified to add functions such as rich queries if using CouchDB. For this network, every peer must have the same chaincode installed over it so that the network is consistent. Like JoinChannel, this file launches a job that uses a number of containers (one-to-one with the number of peers) to install the chaincode over every peer individually.

9. ChaincodeInstantiate - Now that the chaincode is installed over every peer, the chaincode is ready to be populated with electronic wallets that the user can interact with through peer shells. The names and balances of the electronic wallets are specified in the command used to initiate them. Note that there is no need for four distinct containers for this process. Only one container is needed since the chaincode is now universal over all peers.

10, Extra: Setup Script - The setup script creates all the jobs and deployments (and runs them) that are needed to run the network. It contains many echoes that assist the user in locating what steps are happening in real time, which is helpful for both debugging and quality of life purposes. Aside from create commands and non-essential echoes, the execution of copying the artifacts from the local directory to the cloud directory occurs in the script, within the "copyartifacts" job execution. This means that this command is not executed within a container; instead, it is a simple kubectl command that can be used in a terminal. Once the script is complete, the network is up and running, but a few additional steps must be taken to run queries and invokes on the network, which are articulated in the main instructions section.
