# Project Commands

This file documents the separate commands for starting the local blockchain network, deploying the smart contracts, and running the frontend application.

---

## 💻 Local Development (Localhost)

### 1. Start the Local Hardhat Node
This starts a local Ethereum network on `http://127.0.0.1:8545` and generates 20 test accounts. Keep this terminal window open.
```bash
npx hardhat node
```

### 2. Deploy Smart Contracts locally
Run this in a separate terminal to compile and deploy the contracts to your running local node. This will also update `frontend/src/addresses.json` with the new contract addresses.
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Run the Frontend Application
Run the React development server. You can run this either from the project root or by navigating to the `frontend` folder.
* **From Root**:
  ```bash
  npm --prefix frontend run dev
  ```
* **From Frontend Folder**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 🌐 BSC Testnet Development

### 1. Configure Private Key
Ensure you have created a `.env` file in the root directory with your test account's private key:
```env
PRIVATE_KEY=your_private_key_here
```
*Make sure your account has some test BNB (tBNB) for gas and pool funding.*

### 2. Deploy Smart Contracts to BSC Testnet
This compiles and deploys the contracts to the BSC Testnet network and updates the address configuration.
```bash
npx hardhat run scripts/deploy.js --network bscTestnet
```

### 3. Run the Frontend Application
Start the frontend interface. It will automatically detect the BSC Testnet network from the address configuration.
* **From Root**:
  ```bash
  npm --prefix frontend run dev
  ```
* **From Frontend Folder**:
  ```bash
  cd frontend
  npm run dev
  ```
