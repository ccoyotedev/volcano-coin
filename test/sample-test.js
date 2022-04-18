const {
  expect,
} = require("chai");
const {
  ethers,
} = require("hardhat");
const {
  expectRevert, // Assertions for transactions that should fail
  constants, // Common constants, like the zero address and largest integers
} = require("@openzeppelin/test-helpers");

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

  describe("Deployment", async () => {
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

    it("Has 18 decimals", async () => {
      expect(await volcanoCoin.decimals()).to.equal(18);
    })
  })

  describe("Increasing supply", async () => {
    it("Should be able to increase the supply by 1000 tokens", async () => {
      const tx = await volcanoCoin.increaseSupply(1000);
      const res = await tx.wait();
      expect(res.status).to.equal(1);
      expect(await volcanoCoin.totalSupply()).to.equal(11000);
    })

    it("Should only allow the owner to increase supply", async () => {
      await expectRevert(volcanoCoin.connect(addr1).increaseSupply(1000, {
        from: addr1.address
      }), "Ownable: caller is not the owner")
      expect(await volcanoCoin.totalSupply()).to.equal(10000);
    })
  })

  describe("Allowance", async () => {
    it("increases allowance for address1", async () => {
      const currentAllowance = await volcanoCoin.allowance(owner.address, addr1.address);
      const tx = await volcanoCoin.increaseAllowance(addr1.address, 1000);
      const res = await tx.wait();
      expect(res.status).to.equal(1);
      expect(await volcanoCoin.allowance(owner.address, addr1.address)).to.be.gt(currentAllowance);
    })

    it("decreases allowance for address1", async () => {
      const increaseTx = await volcanoCoin.increaseAllowance(addr1.address, 1000);
      const increaseRes = await increaseTx.wait();
      expect(increaseRes.status).to.equal(1);
      const increasedAllowance = await volcanoCoin.allowance(owner.address, addr1.address);

      const decreaseTx = await volcanoCoin.decreaseAllowance(addr1.address, 1000);
      const decreaseRes = await decreaseTx.wait();
      expect(decreaseRes.status).to.equal(1);
      expect(await volcanoCoin.allowance(owner.address, addr1.address)).to.be.lt(increasedAllowance);
    });

    it("emits an event when increasing allowance", async () => {
      await expect(volcanoCoin.increaseAllowance(addr1.address, 1000)).to.emit(volcanoCoin, 'Approval').withArgs(owner.address, addr1.address, 1000);
    });

    it("reverts decreaseAllowance when trying decrease below 0", async () => {
      await expectRevert(
        volcanoCoin.decreaseAllowance(addr1.address, 1000),
        "ERC20: decreased allowance below zero"
      );
    });

  })

  describe("Transfer", async () => {
    it("reverts when transferring tokens to the zero address", async () => {
      await expectRevert(
        volcanoCoin.transfer(constants.ZERO_ADDRESS, 10),
        "ERC20: transfer to the zero address"
      );
    });

    it("updates balances on successful transfer from owner to addr1", async () => {
      const ownerBalance = await volcanoCoin.balanceOf(owner.address);
      const recipientBalance = await volcanoCoin.balanceOf(addr1.address);

      const sendAmount = 100;
      const tx = await volcanoCoin.transfer(addr1.address, sendAmount);
      const res = await tx.wait();

      expect(res.status).to.equal(1);
      expect(await volcanoCoin.balanceOf(owner.address)).to.be.equal(ownerBalance.sub(sendAmount));
      expect(await volcanoCoin.balanceOf(addr1.address)).to.be.equal(recipientBalance.add(sendAmount));
    });

    it("reverts transfer when sender does not have enough balance", async () => {
      await expectRevert(
        volcanoCoin.transfer(addr1.address, 10001),
        "ERC20: transfer amount exceeds balance"
      );
    });

    it("reverts transferFrom addr1 to addr2 called by the owner without setting allowance", async () => {
      await expectRevert(
        volcanoCoin.transferFrom(addr1.address, addr2.address, 100),
        "ERC20: insufficient allowance"
      );
    });

    it("updates balances after transferFrom addr1 to addr2 called by the owner", async () => {
      const sendAmount = 50;
      const tx = await volcanoCoin.transfer(addr1.address, sendAmount * 2);
      const res = await tx.wait();
      expect(res.status).to.equal(1);

      const tx2 = await volcanoCoin.connect(addr1).approve(owner.address, 10000000);
      const res2 = await tx2.wait();
      expect(res2.status).to.equal(1);

      const tx3 = await volcanoCoin.transferFrom(addr1.address, addr2.address, sendAmount);
      const res3 = await tx3.wait();
      expect(res3.status).to.equal(1);

      expect(await volcanoCoin.balanceOf(addr1.address)).to.be.equal(sendAmount);
      expect(await volcanoCoin.balanceOf(addr2.address)).to.be.equal(sendAmount);
    });
  })
});