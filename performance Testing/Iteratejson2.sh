start=`date +%s`

declare -a arr=()
while IFS= read -r var
do
  arr+=( $var )
done < "accounts1k.json"
accounts=''
for j in "${arr[@]}"
 do
   accounts="$accounts $j"
 done

# create the json, escaping the accounts quotes along the way
printf -v json '{"Args":["InitLedgerAdvanced","%s"]}' "${accounts//\"/\\\"}"

# and invoke the command
peer chaincode invoke -n cc -C channel1 -c "$json"
end=`date +%s`
runtime=$((end-start))
echo "time taken:"
echo $runtime
