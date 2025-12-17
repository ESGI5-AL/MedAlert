import hre from "hardhat";
import fs from "node:fs";
import path from "node:path";

function readJson(filename) {
  const filePath = path.join(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`${filename} not found in project root.`);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    throw new Error(`Failed to parse ${filename}: ${e?.message ?? e}`);
  }
}

async function deployContract(ethers, name, args = []) {
  const c = await ethers.deployContract(name, args);
  await c.waitForDeployment();
  return c;
}

function toHexWei(eth) {
  // hardhat_setBalance expects a hex quantity string
  const wei = BigInt(Math.floor(Number(eth))) * 10n ** 18n;
  return "0x" + wei.toString(16);
}

async function impersonate(connection, ethers, address) {
  // Hardhat JSON-RPC methods are available via connection.provider in HH3
  await connection.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  await connection.provider.request({
    method: "hardhat_setBalance",
    params: [address, toHexWei(10000)],
  });

  const signer = await ethers.getSigner(address);

  const stop = async () => {
    await connection.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [address],
    });
  };

  return { signer, stop };
}

async function main() {
  const seed = readJson("seedData.json");

  const connection = await hre.network.connect();
  const { ethers } = connection;

  const [deployer] = await ethers.getSigners();

  console.log("Deployer:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "ETH"
  );

  // Deploy Registration
  console.log("\n--- Deploying Registration ---");
  const registration = await deployContract(ethers, "Registration");
  const registrationAddr = await registration.getAddress();
  console.log("Registration deployed to:", registrationAddr);

  // Deploy MedAlert (constructor expects Registration address)
  console.log("\n--- Deploying MedAlert ---");
  const medAlert = await deployContract(ethers, "MedAlert", [registrationAddr]);
  const medAlertAddr = await medAlert.getAddress();
  console.log("MedAlert deployed to:", medAlertAddr);

  // Instances
  const registrationC = await ethers.getContractAt("Registration", registrationAddr);
  const medAlertC = await ethers.getContractAt("MedAlert", medAlertAddr);

  console.log("\n--- Seeding from seedData.json ---");

  // Seed doctors (Registration.addDoctor(address))
  if (Array.isArray(seed.doctors)) {
    for (const d of seed.doctors) {
      const addr = d?.address;
      if (!addr) continue;
      const exists = await registrationC.isDoctor(addr);
      if (!exists) {
        const tx = await registrationC.addDoctor(addr);
        await tx.wait();
        console.log("Added doctor:", addr);
      } else {
        console.log("Doctor already exists:", addr);
      }
    }
  }

  // Seed pharmacies (Registration.addPharmacy(address))
  if (Array.isArray(seed.pharmacies)) {
    for (const p of seed.pharmacies) {
      const addr = p?.address;
      if (!addr) continue;
      const exists = await registrationC.isPharmacy(addr);
      if (!exists) {
        const tx = await registrationC.addPharmacy(addr);
        await tx.wait();
        console.log("Added pharmacy:", addr);
      } else {
        console.log("Pharmacy already exists:", addr);
      }
    }
  }

  // Seed threshold (MedAlert.setAlertThreshold(uint256) onlyOwner)
  if (seed.settings?.alertThreshold != null) {
    const desired = BigInt(seed.settings.alertThreshold);
    const current = await medAlertC.getAlertThreshold();
    if (current !== desired) {
      const tx = await medAlertC.setAlertThreshold(desired);
      await tx.wait();
      console.log("Set alert threshold to:", desired.toString());
    } else {
      console.log("Alert threshold already:", current.toString());
    }
  }

  // Seed medicines (MedAlert.addMedicine(address,string,string,uint256) onlyPharmacy)
  const { chainId } = await ethers.provider.getNetwork();
  const isLocal = chainId === 31337n;
  console.log("Network chainId:", chainId.toString(), "isLocal:", isLocal);

  const patients = Array.isArray(seed.testPatients) ? seed.testPatients.map((x) => x.address).filter(Boolean) : [];
  const medicines = Array.isArray(seed.medicines) ? seed.medicines : [];
  const pharmacies = Array.isArray(seed.pharmacies) ? seed.pharmacies.map((x) => x.address).filter(Boolean) : [];

  if (!patients.length || !medicines.length || !pharmacies.length) {
    console.log("Skipping medicine seeding: seedData.json is missing testPatients, medicines, or pharmacies.");
  } else if (!isLocal) {
    console.log("Skipping medicine seeding: onlyPharmacy requires using real pharmacy keys on non-local networks.");
  } else {
    const pharmacyAddr = pharmacies[0];
    console.log("Impersonating pharmacy for seeding medicines:", pharmacyAddr);

    const { signer: pharmacySigner, stop } = await impersonate(connection, ethers, pharmacyAddr);
    const medAlertAsPharmacy = medAlertC.connect(pharmacySigner);

    try {
      for (const patientAddr of patients) {
        for (const m of medicines) {
          const medicineId = m?.medicineId;
          const name = m?.name;
          const quantity = m?.quantity != null ? BigInt(m.quantity) : 1n;

          if (!medicineId || !name) continue;

          const tx = await medAlertAsPharmacy.addMedicine(
            patientAddr,
            medicineId,
            name,
            quantity
          );
          await tx.wait();
        }
        console.log("Seeded medicines for patient:", patientAddr);
      }
      console.log("Medicine seeding complete.");
    } finally {
      await stop();
    }
  }

  // Save deployment info
  const out = {
    network: hre.network?.name ?? "unknown",
    chainId: chainId.toString(),
    deployer: deployer.address,
    contracts: {
      Registration: registrationAddr,
      MedAlert: medAlertAddr,
    },
    timestamp: new Date().toISOString(),
  };

  const outPath = path.join(process.cwd(), "deployments.localhost.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log("\nSaved deployment info to:", outPath);

  console.log("\nDone.");
}

main().catch((e) => {
  console.error("\nDeployment failed:", e);
  process.exitCode = 1;
});
