start=`date +%s`
while IFS=, read -r accountID accountStatus lp_jurisdiction lp_number mac_address tag_id
do
    peer chaincode invoke -n cc -C channel1 -c '{"Args":["addAccount",'$accountID','$lp_jurisdiction','$lp_number','$mac_address','$tag_id','$accountStatus']}'
done < Accounts1k.csv
end=`date +%s`
runtime=$((end-start))
echo "time taken:"
echo $runtime
