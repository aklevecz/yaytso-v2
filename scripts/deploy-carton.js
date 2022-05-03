const hre = require("hardhat");

const YAYTO_MAIN = "0x6fE0E0672C967dA6F7927150b9f8CEb028021cFf";
const YAYTSO_POLY_MAIN = "0x37847a40B038094046B1C767ddf9A536C924A55f";

async function main() {
  const Carton = await hre.ethers.getContractFactory(
    "contracts/Carton.sol:Carton"
  );
  const carton = await Carton.deploy(YAYTSO_POLY_MAIN);

  await carton.deployed();

  console.log("Carton deployed to:", carton.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
