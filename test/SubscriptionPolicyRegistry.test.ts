import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("SubscriptionPolicyRegistry", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("SubscriptionPolicyRegistry");
    const registry = await Registry.deploy();

    return { registry, owner, other };
  }

  it("adds a subscription and indexes it by owner", async function () {
    const { registry, owner } = await deployFixture();
    const nextRenewalDate = Math.floor(Date.UTC(2026, 5, 1) / 1000);

    await expect(
      registry.addSubscription(
        "ChatGPT Plus",
        "AI Tool",
        20,
        "USDT",
        "monthly",
        nextRenewalDate,
        "mock-root"
      )
    )
      .to.emit(registry, "SubscriptionAdded")
      .withArgs(owner.address, 0, "ChatGPT Plus");

    const subscription = await registry.getSubscription(0);
    expect(subscription.owner).to.equal(owner.address);
    expect(subscription.serviceName).to.equal("ChatGPT Plus");
    expect(subscription.latestDecision).to.equal(0);

    const ids = await registry.getUserSubscriptions(owner.address);
    expect(ids.map((id) => Number(id))).to.deep.equal([0]);
  });

  it("records analysis and renewal decisions for the owner", async function () {
    const { registry, owner } = await deployFixture();
    const nextRenewalDate = Math.floor(Date.UTC(2026, 5, 1) / 1000);
    const analysisHash = ethers.keccak256(ethers.toUtf8Bytes("analysis"));

    await registry.addSubscription("Cursor", "AI Tool", 20, "USDT", "monthly", nextRenewalDate, "root-1");

    await expect(registry.recordAnalysis(0, analysisHash, "root-2"))
      .to.emit(registry, "AnalysisRecorded")
      .withArgs(owner.address, 0, analysisHash, "root-2");

    await expect(registry.recordDecision(0, 1))
      .to.emit(registry, "RenewalDecisionRecorded")
      .withArgs(owner.address, 0, 1);

    const subscription = await registry.getSubscription(0);
    expect(subscription.analysisHash).to.equal(analysisHash);
    expect(subscription.storageRootHash).to.equal("root-2");
    expect(subscription.latestDecision).to.equal(1);
  });

  it("blocks non-owners from changing subscription records", async function () {
    const { registry, other } = await deployFixture();
    const nextRenewalDate = Math.floor(Date.UTC(2026, 5, 1) / 1000);
    const analysisHash = ethers.keccak256(ethers.toUtf8Bytes("analysis"));

    await registry.addSubscription("Notion AI", "SaaS", 10, "USDT", "monthly", nextRenewalDate, "root");

    await expect(registry.connect(other).recordAnalysis(0, analysisHash, "root-2")).to.be.revertedWith(
      "Not subscription owner"
    );
    await expect(registry.connect(other).recordDecision(0, 2)).to.be.revertedWith("Not subscription owner");
    await expect(registry.connect(other).updatePolicyStorage(0, "root-3")).to.be.revertedWith("Not subscription owner");
  });
});
