
KUBECONFIG_FOLDER=${PWD}/configFiles

kubectl delete -f ${KUBECONFIG_FOLDER}/testChaincodeInstantiate.yaml
kubectl delete -f ${KUBECONFIG_FOLDER}/testChaincodeInstall.yaml

kubectl delete -f ${KUBECONFIG_FOLDER}/testJoinChannel.yaml
kubectl delete -f ${KUBECONFIG_FOLDER}/testCreateChannel.yaml

kubectl delete -f ${KUBECONFIG_FOLDER}/testPeersDeployment.yaml
kubectl delete -f ${KUBECONFIG_FOLDER}/testBlockchainServices.yaml

kubectl delete -f ${KUBECONFIG_FOLDER}/checkpvc.yaml

kubectl delete -f ${KUBECONFIG_FOLDER}/testGenerateArtifacts.yaml
kubectl delete -f ${KUBECONFIG_FOLDER}/testCopyArtifacts.yaml

kubectl delete -f ${KUBECONFIG_FOLDER}/testCreateVolume.yaml

sleep 15

echo -e "\npv:" 
kubectl get pv
echo -e "\npvc:"
kubectl get pvc
echo -e "\njobs:"
kubectl get jobs 
echo -e "\ndeployments:"
kubectl get deployments
echo -e "\nservices:"
kubectl get services
echo -e "\npods:"
kubectl get pods --show-all

echo -e "\nNetwork Deleted!!\n"

