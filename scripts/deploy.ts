import hre from "hardhat";

const { ethers, network } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(`Deploying SubscriptionPolicyRegistry to ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);

  const Registry = await ethers.getContractFactory("SubscriptionPolicyRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log(`SubscriptionPolicyRegistry deployed at: ${address}`);
  console.log(`Set NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
