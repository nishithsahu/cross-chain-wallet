export const fetchTokenPrices = async (): Promise<Record<string, number>> => {
    try {
        // Fetch prices for Ethereum, Polygon (MATIC), and Arbitrum
        // CoinGecko IDs: ethereum, matic-network, arbitrum
        const response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,arbitrum&vs_currencies=usd'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch prices');
        }

        const data = await response.json();

        return {
            ETH: data.ethereum.usd,
            MATIC: data['matic-network'].usd,
            ARB: data.arbitrum.usd, // Note: Arbitrum token is ARB, but native gas token on Arb is ETH. 
            // However, for the dashboard we might be displaying ETH on Arbitrum.
            // The Alchemy API returns 'ETH' for native transfers on Arbitrum.
            // So we mainly need ETH price. 
            // But if we support other tokens, we'd need their IDs.
            // For this MVP, we'll assume native token transfers mostly.
        };
    } catch (error) {
        console.error("Error fetching prices:", error);
        return {
            ETH: 0,
            MATIC: 0,
            ARB: 0,
        };
    }
};
