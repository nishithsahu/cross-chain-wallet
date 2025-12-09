# Cross-Chain Wallet Activity Dashboard

A minimal React application to track wallet activity across multiple EVM chains (Ethereum, Polygon, Arbitrum).

## 🚀 Features
- **Multi-Chain Support**: Switch seamlessly between Ethereum, Polygon, and Arbitrum.
- **Wallet Connection**: Connect via MetaMask (or use the built-in **Mock Wallet** for testing without an extension).
- **Activity Feed**: View recent transactions (Sent/Received) with details like amount, currency, and status.
- **Responsive Design**: Mobile-first UI built with Tailwind CSS.

## 🛠 Architecture & Component Structure

The project follows a clean, feature-based architecture:

```
src/
├── components/         # UI Components
│   ├── ChainSelector.tsx    # Network switching logic
│   ├── TransactionHistory.tsx # Activity feed display
│   └── WalletConnect.tsx    # Connect/Disconnect button
├── hooks/
│   └── useWallet.ts    # Custom hook for MetaMask interaction & state
├── services/
│   └── alchemyService.ts # API service for fetching transaction history
├── store/
│   └── useStore.ts     # Global state management (Zustand)
└── App.tsx             # Main layout
```

### Key Technical Choices

1.  **React + Vite**: Chosen for speed, minimal boilerplate, and excellent developer experience.
2.  **TypeScript**: Essential for type safety, especially when dealing with blockchain data structures and API responses.
3.  **Zustand**: Used for state management instead of Redux or Context API.
    *   *Why?* It's extremely lightweight, boilerplate-free, and handles simple global state (wallet address, selected chain) perfectly without complex providers.
4.  **Tailwind CSS**: For rapid styling. It ensures consistency and makes handling responsiveness (mobile vs desktop) trivial.
5.  **ethers.js (v6)**: The standard library for interacting with Ethereum-based chains.
6.  **Alchemy API**: Used to fetch transaction history (`alchemy_getAssetTransfers`). Standard RPC nodes are inefficient for fetching "history" (they are better for current state), so an indexer API like Alchemy is required.

## ⚙️ Configuration

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MetaMask Browser Extension (optional, Mock Mode available)

### Setup
1.  **Clone the repository**:
    ```bash
    git clone <repo-url>
    cd cross-chain-wallet
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure API Keys**:
    *   Open `src/services/alchemyService.ts`.
    *   Replace the `'demo'` placeholders in the `ALCHEMY_KEYS` object with your valid Alchemy API keys for each network.
    *   *Note*: The app works with `'demo'` keys but may be rate-limited.

    ```typescript
    const ALCHEMY_KEYS: Record<Chain, string> = {
      ethereum: 'YOUR_ETH_KEY',
      polygon: 'YOUR_POLYGON_KEY',
      arbitrum: 'YOUR_ARBITRUM_KEY',
    };
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

## ⚠️ Assumptions & Tradeoffs

- **Client-Side API Keys**: Since this is a minimal frontend-only dashboard, API keys are stored in the client code. **In a production app, this is a security risk.** You should proxy these requests through a backend server.
- **Mock Wallet**: To facilitate testing without a Web3 provider, the app falls back to a "Mock Wallet" mode if `window.ethereum` is not detected. It simulates a connection and returns dummy data.
- **Transaction History**: We fetch the last 10 transactions. The Alchemy `getAssetTransfers` API is powerful but has some limitations on the free tier regarding how far back it can look without pagination.
- **Styling**: No external UI library (like MUI or Chakra) was used, to keep the bundle size small and demonstrate custom Tailwind styling.

## 🔮 Known Limitations & Future Improvements

- **Security**: Move API calls to a serverless function (e.g., Vercel Functions) to hide API keys.
- **More Chains**: Easily extensible to support Optimism, Base, etc., by adding them to the `CHAINS` config.
- **Token Pricing**: Currently, amounts are shown in raw token values. Integrating CoinGecko API would allow displaying USD equivalents.
- **ENS Support**: Resolve addresses to ENS names (e.g., `user.eth`) for better UX.
