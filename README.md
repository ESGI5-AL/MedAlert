# MedAlert - Passeport Médical Intelligent & Réseau d'Alerte Communautaire

Un réseau d'alerte décentralisé en temps réel pour les effets secondaires des médicaments, combinant blockchain et santé publique pour sauver des vies grâce à la transparence.

---


## Vue d'ensemble du projet

MedAlert est une plateforme révolutionnaire de pharmacovigilance qui exploite la technologie blockchain pour créer un système de surveillance de la sécurité des médicaments transparent, immuable et centré sur le patient. En combinant la puissance de la blockchain avec l'expertise médicale, MedAlert répond aux défaillances critiques des systèmes de pharmacovigilance centralisés actuels.

---

## Le problème

Les systèmes actuels de surveillance des médicaments présentent des défaillances critiques qui mettent en danger la santé publique:

- **Retards dangereux** : Les effets secondaires graves sont détectés trop tard, parfois après des années d'utilisation généralisée
- **Centralisation risquée** : Les entreprises pharmaceutiques peuvent influencer ou supprimer les rapports, compromettant l'objectivité du système
- **Patients non informés** : Aucun système d'alerte en temps réel n'existe pour avertir les utilisateurs de médicaments à risque
- **Sous-déclaration massive** : 95% des effets secondaires ne sont jamais signalés aux autorités sanitaires

**Résultat** : Des milliers de vies menacées par l'opacité des systèmes actuels de pharmacovigilance.

---

## Notre solution

MedAlert propose un réseau d'alerte décentralisé et immuable avec quatre composantes clés :

### 1. Passeport NFT évolutif
Chaque patient possède un NFT unique qui suit automatiquement tous ses achats de médicaments en pharmacie.

### 2. Signalement décentralisé
Les patients signalent anonymement les effets secondaires directement sur la blockchain, sans intermédiaires.

### 3. Validation médicale
Réseau de médecins certifiés validant les rapports via des smart contracts transparents et vérifiables.

### 4. Alertes instantanées
Notification immédiate de tous les patients affectés lorsqu'un seuil critique est atteint.

---

## 👥 Équipe

**Promotion 5AL1**

- HAMMOU Camillia
- DUDAS Denisa
- ALOUI Sonia
- CHABANE Celina

---

## Installation et démarrage

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- MetaMask (pour l'interaction avec la blockchain)

### Installation du projet

```bash
npm install
```

### Compilation et exécution du projet

```bash
npm start
```

Le projet sera accessible à l'adresse : `http://localhost:3000`

---

## Utilisation des composants shadcn/ui

Pour ajouter un composant, utilisez la commande ci-dessous avec le nom du composant souhaité :

```bash
npx shadcn@latest add nomDuComposant
```

**Exemple** :

```bash
npx shadcn@latest add breadcrumb
```

Consultez la documentation complète : [https://ui.shadcn.com/docs/installation](https://ui.shadcn.com/docs/installation)

---

## Technologies utilisées

### Frontend

[![React][React.js]][React-url]
[![Tailwind CSS][Tailwind.css]][Tailwind-url]

- **React.js** - Framework JavaScript pour l'interface utilisateur
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI réutilisables
- **Lucide React** - Icônes

### Blockchain

- **Hardhat 3** - Environnement de développement Ethereum
- **Ethers v6** - Bibliothèque JavaScript pour interagir avec Ethereum
- **Solidity 0.8.x** - Langage de programmation pour smart contracts

[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/

---

## Déploiement des Smart Contracts

### Contrats

| Contrat | Objectif |
|---------|----------|
| `Registration.sol` | Gestion des rôles (médecins, pharmacies, patients) |
| `MedAlert.sol` | Logique d'alerte médicale (médicaments, seuils, signalement d'effets secondaires) |


> ⚠️ **Note importante** : Hardhat 3 n'injecte pas `ethers` globalement. Utilisez : `const { ethers } = await hre.network.connect();`

### Fichiers clés

| Fichier | Objectif |
|---------|----------|
| `scripts/deploy.js` | Déploie les contrats et initialise les données |
| `seedData.json` | État initial (médecins, pharmacies, médicaments, paramètres) |
| `deployments.localhost.json` | Informations de déploiement auto-générées |

### Déploiement local

#### Étape 1 : Démarrer le nœud local

**Terminal 1** – Démarrer le nœud Hardhat :

```bash
npx hardhat node
```

#### Étape 2 : Déployer et initialiser

**Terminal 2** – Déployer et charger les données :

```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Vérification du déploiement

Ouvrez la console Hardhat :

```bash
npx hardhat console --network localhost
```

Exécutez les commandes suivantes pour vérifier :

```javascript
const hre = await import("hardhat");
const { ethers } = await hre.network.connect();
const deployments = require("./deployments.localhost.json");

const registration = await ethers.getContractAt("Registration", deployments.contracts.Registration);
const medAlert = await ethers.getContractAt("MedAlert", deployments.contracts.MedAlert);

await registration.getDoctorsCount();
await medAlert.getAlertThreshold();
```

### Notes importantes

- **Réseau localhost** : Les comptes des pharmacies sont simulés pour l'initialisation
- **Autres réseaux** : L'initialisation des médicaments nécessite les clés privées des pharmacies

> ⚠️ **Attention** :  Il faut ajouter un réseaux local Hardhat pour pouvoir se connecer correctement avec son wallet

Pour faire ceci, connectez-vous à votre wallet et ajouter un nouveau réseaux personnalisé. <br>
Completez le ainsi: <br> <br>
Nom : Hardhat local <br>
Default RPC URL : 127.0.0.1:8545 <br>
Chain id: 31337 <br>
Currency: ETH <br>

---

