# MedAlert - Passeport Médical Intelligent & Réseau d'Alerte Communautaire en utilisant la Blockchain

Un réseau d'alerte décentralisé en temps réel pour les effets secondaires des médicaments, combinant blockchain et santé publique pour sauver des vies grâce à la transparence.

## Vue d'ensemble du projet

MedAlert est une plateforme révolutionnaire de pharmacovigilance qui exploite la technologie blockchain pour créer un système de surveillance de la sécurité des médicaments transparent, immuable et centré sur le patient. En combinant la puissance de la blockchain avec l'expertise médicale, MedAlert répond aux défaillances critiques des systèmes de pharmacovigilance centralisés actuels.

<img width="1215" height="612" alt="landing page" src="https://github.com/user-attachments/assets/f29d0146-4856-43fd-9803-3bdbae91c484" />

## Le problème

Les systèmes actuels de surveillance des médicaments présentent des défaillances critiques qui mettent en danger la santé publique:

- **Retards dangereux** : Les effets secondaires graves sont détectés trop tard, parfois après des années d'utilisation généralisée
- **Centralisation risquée** : Les entreprises pharmaceutiques peuvent influencer ou supprimer les rapports, compromettant l'objectivité du système
- **Patients non informés** : Aucun système d'alerte en temps réel n'existe pour avertir les utilisateurs de médicaments à risque
- **Sous-déclaration massive** : 95% des effets secondaires ne sont jamais signalés aux autorités sanitaires

**Résultat** : Des milliers de vies menacées par l'opacité des systèmes actuels de pharmacovigilance.


## Notre solution

MedAlert propose un réseau d'alerte décentralisé et immuable avec quatre composantes clés :

### 1. Passeport médical
Chaque patient possède un passeport médical qui suit automatiquement tous ses achats de médicaments en pharmacie et toutes les déclarations des effets secondaires.

### 2. Signalement décentralisé
Les patients signalent anonymement les effets secondaires directement sur la blockchain, sans intermédiaires.

### 3. Validation médicale
Réseau de médecins certifiés validant les rapports via des smart contracts transparents et vérifiables.

### 4. Alertes instantanées
Notification immédiate de tous les patients affectés lorsqu'un seuil critique est atteint.


## Stack Technique

### Frontend

[![React][React.js]][React-url]
[![Tailwind CSS][Tailwind.css]][Tailwind-url]

- **React.js** - Framework JavaScript pour l'interface utilisateur
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Composants UI réutilisables
- **Lucide React** - Icônes
- **Ethers.js** - Communication avec la blockchain

### Blockchain
[![Hardhat][Hardhat]][Hardhat-url]
[![Ethers][Ethers.js]][Ethers-url]
[![Solidity][Solidity]][Solidity-url]
- **Hardhat 3** - Framework de développement et déploiement automatisé
- **Ethers v6** - Bibliothèque JavaScript utilisé par hardhat pour interagir avec les contrats
- **Solidity 0.8.x** - Langage de programmation pour smart contracts

[Hardhat]: https://img.shields.io/badge/Hardhat-FFF100?style=for-the-badge&logo=hardhat&logoColor=black
[Hardhat-url]: https://hardhat.org/
[Ethers.js]: https://img.shields.io/badge/Ethers.js-2535A0?style=for-the-badge&logo=ethereum&logoColor=white
[Ethers-url]: https://docs.ethers.org/
[Solidity]: https://img.shields.io/badge/Solidity-363636?style=for-the-badge&logo=solidity&logoColor=white
[Solidity-url]: https://soliditylang.org/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Tailwind.css]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/


## Démo

### 1. La Pharmacie distribue les médicaments


https://github.com/user-attachments/assets/a8092ca8-0670-4892-839e-2b30457e530d


### 2. Les patients signalent un effet secondaire


https://github.com/user-attachments/assets/7cadcdb8-4b03-4c34-b6c6-6f57d8d2e495


### 3. Un médecin valide le signalement


https://github.com/user-attachments/assets/a7e2a67d-758c-48da-9eac-2df26e93b33a

### 4. Déclenchement de l’alerte


https://github.com/user-attachments/assets/fe6a503a-3c83-4cc3-9f7d-aeb8db10f991


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


## Déploiement des Smart Contracts

### Contrats

| Contrat | Objectif |
|---|---|
| `Registration.sol` | Gestion des rôles (médecins, pharmacies, patients) |
| `MedAlert.sol` | Logique d'alerte médicale (médicaments, seuils, signalement d'effets secondaires) |


> ⚠️ **Note importante** : Hardhat 3 n'injecte pas `ethers` globalement. Utilisez : `const { ethers } = await hre.network.connect();`

### Fichiers clés

| Fichier | Objectif |
|---|---|
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

Pour ajouter des utlisateurs avec des rôles différents, il faut utiliser les clées fournis par hardhat et les ajouter également au fichier seedData.

## Équipe

**Promotion 5AL ESGI**

- DUDAS Denisa
- HAMMOU Camillia
- ALOUI Sonia
- CHABANE Celina
