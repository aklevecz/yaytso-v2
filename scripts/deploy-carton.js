const hre = require("hardhat");

async function main() {
  const Carton = await hre.ethers.getContractFactory("Carton");
  const carton = await Carton.deploy(
    "0x155b65c62e2bf8214d1e3f60854df761b9aa92b3"
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
