const ethers = require("ethers");
const provider = ethers.providers.getDefaultProvider("rinkeby", {
  // infura: process.env.REACT_APP_INFURA_KEY,
  alchemy: "e4ej--n7cdRR-_rL3f55XQSTc-Z5ZW3j",
  // etherscan: process.env.REACT_APP_ETHERSCAN_KEY,
});

let abi = ["event YaytsoLaid(address indexed recipient, uint256 tokenId)"];
const contract = new ethers.Contract(
  "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf",
  abi,
  provider
);

const filter = contract.filters.YaytsoLaid();
// filter.fromBlock = 0;
// filter.toBlock = "latest";
contract.queryFilter(filter).then((logs) => {
  logs.forEach((log) => {
    console.log(log.args[0]);
  });
});
