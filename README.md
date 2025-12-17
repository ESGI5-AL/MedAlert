# MedAlert - Smart Medical Passport & Community Alert Network

A decentralized real-time alert network for medication side effects, combining blockchain and public health to save lives through transparency.

## Project Overview

MedAlert is a revolutionary pharmacovigilance platform that leverages blockchain technology to create a transparent, immutable, and patient-centered drug safety monitoring system. By combining the power of blockchain with medical expertise, MedAlert addresses critical flaws in current centralized pharmacovigilance systems. <br>

### The Problem

Current drug surveillance systems have critical failures that endanger public health:

- Dangerous Delays: Serious side effects are detected too late, sometimes after years of widespread use
- Risky Centralization: Pharmaceutical companies can influence or suppress reports, compromising system objectivity
- Uninformed Patients: No real-time alert system exists to warn users of at-risk medications
- Massive Under-reporting: 95% of side effects are never reported to health authorities

**Result**: Thousands of lives threatened by the opacity of current pharmacovigilance systems.

## Our Solution

MedAlert proposes a decentralized and immutable alert network with four key components:
1. Evolving NFT Passport : <br>
Each patient owns a unique NFT that automatically tracks all their medication purchases from pharmacies.

2. Decentralized Reporting : <br>
Patients anonymously report side effects directly on the blockchain, without intermediaries.

3. Medical Validation : <br>
Network of certified physicians validating reports via transparent and verifiable smart contracts.

4. Instant Alerts : <br>
Immediate notification of all affected patients when a critical threshold is reached.

## Team

- HAMMOU Camillia
- DUDAS Denisa
- ALOUI Sonia
- CHABANE Celina

-> 5AL1

## How to run our project

### Project setup
```bash
$ npm install
```
### Compile and run the project
```bash
$ npm start
```

### How to use shadcn/ui components

To add a component use the command below with the name of the component you want to add.

```bash
$ npx shadcn@latest add componentName
```

exemple :
```bash
$ npx shadcn@latest add breadcrumb
```


checkout the doc:
https://ui.shadcn.com/docs/installation

## Built with
[![React][React.js]][React-url] [![Tailwind CSS][Tailwind.css]][Tailwind-url]

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
``


## Smart Contract Deployment

### Contracts

| Contract | Purpose |
|----------|---------|
| `Registration.sol` | Role management (doctors, pharmacies, patients) |
| `MedAlert.sol` | Medical alert logic (medicines, thresholds, side-effect reporting) |

### Tech Stack

Hardhat 3 | Ethers v6 | Solidity 0.8.x

> Hardhat 3 does not inject `ethers` globally. Use: `const { ethers } = await hre.network.connect();`

### Key Files

| File | Purpose |
|------|---------|
| `scripts/deploy.js` | Deploys contracts, seeds data |
| `seedData.json` | Initial state (doctors, pharmacies, medicines, settings) |
| `deployments.localhost.json` | Auto-generated deployment info |

### Local Deployment

**Terminal 1** – Start node:

```bash
npx hardhat node
```

**Terminal 2** – Deploy & seed:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Verify Deployment

```bash
npx hardhat console --network localhost
```

```js
const hre = await import("hardhat");
const { ethers } = await hre.network.connect();
const deployments = require("./deployments.localhost.json");

const registration = await ethers.getContractAt("Registration", deployments.contracts.Registration);
const medAlert = await ethers.getContractAt("MedAlert", deployments.contracts.MedAlert);

await registration.getDoctorsCount();
await medAlert.getAlertThreshold();
```

### Notes

- **Localhost**: Pharmacy accounts are impersonated for seeding
- **Other networks**: Medicine seeding requires pharmacy private keys