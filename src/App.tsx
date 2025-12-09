
import { WalletConnect } from './components/WalletConnect';
import { ChainSelector } from './components/ChainSelector';
import { TransactionHistory } from './components/TransactionHistory';
import { LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Cross-Chain Activity
            </h1>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <ChainSelector />
        </section>

        <section>
          <TransactionHistory />
        </section>
      </main>

      <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© 2025 Cross-Chain Wallet Dashboard. Built with React & Alchemy.</p>
      </footer>
    </div>
  );
}

export default App;
