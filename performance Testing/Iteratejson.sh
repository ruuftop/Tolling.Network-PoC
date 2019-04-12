start=`date +%s`
declare -a arr=()
while IFS= read -r var
do
  arr+=( $var )
done < "accounts5k.json"
args=''
for j in "${arr[@]}"
 do
   args="$args $j"
 done
 peer chaincode invoke -n cc -C channel1 -c '{"Args":["InitLedgerAdvanced",'"\"$args\""']}'
end=`date +%s`
runtime=$((end-start))
echo "time taken:"
echo $runtime
