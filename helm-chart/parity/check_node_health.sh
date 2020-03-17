set -ex # -e exits on error

usage() { echo "Usage: $0 <rpc_endpoint> <max_lag_in_seconds> <last_synced_block_file>]" 1>&2; exit 1; }

rpc_endpoint="$1"
max_lag_in_seconds="$2"
last_synced_block_file="$3"

if [ -z "${rpc_endpoint}" ] || [ -z "${max_lag_in_seconds}" ] || [ -z "${last_synced_block_file}" ]; then
    usage
fi

block_number_request='{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
block_number_response=$(curl -H 'Content-Type: application/json' -X POST --data "$block_number_request" ${rpc_endpoint})

# -r: print raw output, -n: don't read any input, --argjson data: create variable data with passed json as value
block_number_hex=$(jq -r -n --argjson data "${block_number_response}" '$data.result')

if [ -z "${block_number_hex}" ] || [ "${block_number_hex}" == "null" ]; then
    echo "Block number returned by the node is empty or null"
    exit 1
fi

if [ ! -f ${last_synced_block_file} ]; then
    old_block_number_hex="";
else
    old_block_number_hex=$(cat ${last_synced_block_file});
fi;

if [ "${block_number_hex}" != "${old_block_number_hex}" ]; then
  mkdir -p $(dirname "${last_synced_block_file}")
  echo ${block_number_hex} > ${last_synced_block_file}
fi

file_age=$(($(date +%s) - $(date -r ${last_synced_block_file} +%s)));
max_age=${max_lag_in_seconds};
echo "${last_synced_block_file} age is $file_age seconds. Max healthy age is $max_age seconds";
if [ ${file_age} -lt ${max_age} ]; then exit 0; else exit 1; fi