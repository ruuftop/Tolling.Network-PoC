if [ -d "${PWD}/configFiles" ]; then
    KUBECONFIG_FOLDER=${PWD}/configFiles
else
    echo "Configuration files are not found."
    exit
fi

pod=$(kubectl get pods -l name=org1peer1 --output=jsonpath={.items..metadata.name})
kubectl cp artifacts/chaincode/TollInteroperabilityPOCchaincode/TollInteroperabilityPOCchaincode.js $pod:/public/artifacts/chaincode/TollInteroperabilityPOCchaincode/ -c org1peer1
echo "waiting 5 seconds to avoid network delay."
sleep 5;

kubectl delete -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/NewChaincodeInstall.yaml
sleep 5;
kubectl delete -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/ChaincodeUpgrade.yaml
sleep 5;

# Install chaincode on each peer
echo -e "\nCreating install chaincode job"
echo "Running: kubectl create -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/NewChaincodeInstall.yaml"
kubectl create -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/NewChaincodeInstall.yaml

JOBSTATUS=$(kubectl get jobs |grep chaincodeinstallnew |awk '{print $3}')
while [ "${JOBSTATUS}" != "1" ]; do
    echo "Waiting for chaincodeinstall job to be completed"
    sleep 1;
    if [ "$(kubectl get pods --show-all| grep chaincodeinstallnew | awk '{print $3}')" == "Error" ]; then
        echo "Chaincode Install Failed"
        exit 1
    fi
    JOBSTATUS=$(kubectl get jobs |grep chaincodeinstallnew |awk '{print $3}')
done
echo "Chaincode Install Completed Successfully"

# Instantiate chaincode on channel
echo -e "\nCreating chaincodeinstantiate job"
echo "Running: kubectl create -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/ChaincodeUpgrade.yaml"
kubectl create -f ${KUBECONFIG_FOLDER}/UpgradeChaincode/ChaincodeUpgrade.yaml

JOBSTATUS=$(kubectl get jobs |grep chaincodeupgrade |awk '{print $3}')
while [ "${JOBSTATUS}" != "1" ]; do
    echo "Waiting for chaincodeupgrade job to be completed"
    sleep 1;
    if [ "$(kubectl get pods --show-all| grep chaincodeupgrade | awk '{print $3}')" == "Error" ]; then
        echo "Chaincode chaincodeupgrade Failed"
        exit 1
    fi
    JOBSTATUS=$(kubectl get jobs |grep chaincodeupgrade |awk '{print $3}')
done
echo "Chaincode chaincodeupgrade Successfully"
