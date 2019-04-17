start=`date +%s`

declare -a arr=()
while IFS= read -r var
do
  arr+=( $var )
done < "accounts1k.json"
accounts=''
i=0
for j in "${arr[@]}"
 do
   ((i+=1))
   accounts="$accounts $j"
   if [ "$i" == 500 ]; then
     printf -v json '{"Args":["InitLedgerAdvanced","%s"]}' "${accounts//\"/\\\"}"
     peer chaincode invoke -n cc -C channel1 -c "$json"
     accounts=''
     i=0
   fi
 done
end=`date +%s`
runtime=$((end-start))
echo "time taken:"
echo $runtime
