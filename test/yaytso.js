const { expect } = require("chai");
const CID = require("cids");

async function layYaytso(contract, address, prefix) {
  const patternHash = ethers.utils.formatBytes32String(`${prefix}-token-hash`);
  const uri = `${prefix}-token-uri`;
  const resp = await contract.layYaytso(address, patternHash, uri);
  return resp;
}

describe("Yaytso", function () {
  beforeEach(async function () {
    this.Yaytso = await ethers.getContractFactory("Yaytso");
    this.yaytso = await this.Yaytso.deploy();
    this.accounts = await ethers.getSigners();
    this.owner = this.accounts[0];

    await this.yaytso.deployed();
  });

  it("Creates egg, and creator is owner", async function () {
    await layYaytso(this.yaytso, this.owner.address, "first");
    const firstTokenOwner = await this.yaytso.ownerOf(1);
    expect(firstTokenOwner).to.equal(this.owner.address);
  });

  it("Creates egg. uri is expected uri", async function () {
    const prefix = "first";
    await layYaytso(this.yaytso, this.owner.address, prefix);
    const tokenURI = await this.yaytso.tokenURI(1);
    expect(tokenURI).to.equal(`ipfs://${prefix}-token-uri`);
  });

  it("Cannot create a dupe", async function () {
    await layYaytso(this.yaytso, this.owner.address, "first");
    await expect(
      layYaytso(this.yaytso, this.owner.address, "first")
    ).to.be.revertedWith("no dupes");
  });

  it("Finds the token of the owner", async function () {
    const patternHash = ethers.utils.formatBytes32String("first-token-hash");
    const uri = "whatever-uri";
    await this.yaytso.layYaytso(this.owner.address, patternHash, uri);
    const resp = await this.yaytso.yaytsosOfOwner(this.owner.address);
    expect(resp.length).to.be.above(0);
  });
});
