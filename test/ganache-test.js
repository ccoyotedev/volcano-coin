const {
  expect,
} = require("chai");
const {
  ethers,
  waffle,
} = require("hardhat");

describe("GanacheTest", async () => {
  it("should send ETH from Vitalik's account to my own", async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );;
    // Set	variable	here	for	reuse
    [owner] = await ethers.getSigners();
    const vitaliksAddress = "0x1db3439a222c519ab44bb1144fc28167b4fa6ee6";

    const ownerEthBalance = await provider.getBalance(owner.address);
    const vitaliksEthBalance = await provider.getBalance(vitaliksAddress);

    console.log(ownerEthBalance.toString());
    console.log(vitaliksEthBalance.toString());

    const txOptions = {
      from: vitaliksAddress,
      to: owner.address,
      value: "1000000000000000000",
    }

    const tx = await owner.sendTransaction(txOptions);

    const res = await tx.wait();
    expect(res.status).to.eq(1);

    console.log(res);
    const vitaliksNewEthBalance = await provider.getBalance(vitaliksAddress);
    console.log(vitaliksNewEthBalance.toString());

  })
});