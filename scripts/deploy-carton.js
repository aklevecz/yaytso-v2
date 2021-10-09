const hre = require("hardhat");

async function main() {
  const Carton = await hre.ethers.getContractFactory("Carton");
  const carton = await Carton.deploy(
    "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf"
  );

  await carton.deployed();

  console.log("Carton deployed to:", carton.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
