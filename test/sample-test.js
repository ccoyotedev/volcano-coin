const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

describe("VolcanoCoin", function () {
  // Initialise vars
  let VolcanoCoin, volcanoCoin, owner, addr1, addr2;

  beforeEach(async () => {
    // Deploy new instance
    VolcanoCoin = await ethers.getContractFactory('VolcanoCoin');
    volcanoCoin = await VolcanoCoin.deploy();

    // Get accounts
    [owner, addr1, addr2, _] = await ethers.getSigners();
  })

  describe("Deployment", () => {
    it("Should be set with the Volcano Coin information", async () => {
      // Failing test
      expect(addr1.address).to.not.equal(await volcanoCoin.owner());
      // Passing tests
      expect(await volcanoCoin.owner()).to.equal(owner.address);
      expect(await volcanoCoin.name()).to.equal("Volcano Coin");
      expect(await volcanoCoin.symbol()).to.equal("VOC");
    })

    it("Should mint an initial supply of 10000 to the contracts address", async () => {
      expect(await volcanoCoin.totalSupply()).to.equal(10000);
    })
  })

  describe("Increasing supply", () => {
    it("Should be able to increase the supply by 1000 tokens", async () => {
      const tx = await volcanoCoin.increaseSupply(1000);
      const res = await tx.wait();
      expect(res.status).to.equal(1);
      expect(await volcanoCoin.totalSupply()).to.equal(11000);
    })

    it("Should only allow the owner to increase supply", async () => {
      expect(async () => {
        await volcanoCoin.increaseSupply(1000, {
          from: addr1
        }).to.be.revertedWith("Ownable: caller is not the owner");
      })
      expect(await volcanoCoin.totalSupply()).to.equal(10000);
    })
  })
});