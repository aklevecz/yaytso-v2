const hre = require("hardhat");

async function main() {
  const Yaytso = await hre.ethers.getContractFactory("Yaytso");
  const yaytso = await Yaytso.deploy();

  await yaytso.deployed();
  console.log("Yaytso deployed to:", yaytso.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => console.log(error).process.exit(1));
