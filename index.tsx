import React, { useState, useEffect, createContext, useContext, useCallback, FC, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom/client';

const API_BASE_URL = 'http://localhost:8000';

// Type Definitions from OpenAPI Spec
type Transaction = {
    ticker: string;
    buy_date: string;
    quantity: number;
    price: number;
};
type StockData = {
    ticker: string;
    pe_ratio: number;
    eps: number;
    price_history: { date: string; close: number }[];
};
type NewsHeadline = {
    source: string;
    title: string;
    link: string;
};
type Recommendation = {
    ticker: string;
    recommendation: string;
    confidence: string;
    reasoning: string;
};

// --- CONTEXT for State Management ---
interface AppContextType {
    navigate: (page: string) => void;
    logout: () => void;
    transactions: Transaction[] | null;
    setTransactions: (transactions: Transaction[] | null) => void;
    sentiment: string;
    setSentiment: (sentiment: string) => void;
    stockData: StockData[] | null;
    setStockData: (data: StockData[] | null) => void;
    news: NewsHeadline[] | null;
    setNews: (news: NewsHeadline[] | null) => void;
    analysis: Recommendation[] | null;
    setAnalysis: (analysis: Recommendation[] | null) => void;
}
const AppContext = createContext<AppContextType | null>(null);
const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};

// --- HELPER & UI COMPONENTS ---
const Spinner: FC = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
);

const Card: FC<PropsWithChildren<{ className?: string }>> = ({ children, className = '' }) => (
    <div className={`bg-gray-800 shadow-lg rounded-xl p-6 ${className}`}>
        {children}
    </div>
);

// --- PAGE COMPONENTS ---
const UploadPage: FC = () => {
    const { setTransactions, navigate } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a CSV file to upload.');
            return;
        }
        setIsLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_BASE_URL}/upload-transactions`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Server error: ${response.status}`);
            }
            setTransactions(data.preview);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <h1 className="text-5xl font-bold text-white mb-2">Andre</h1>
            <p className="text-xl text-gray-400 mb-8">Your Best Smart Wall Street BFF</p>
            <Card className="w-full max-w-md">
                <h2 className="text-2xl font-semibold text-white mb-4 text-center">Link to Your Account</h2>
                <p className="text-gray-400 mb-6 text-center">Upload your transaction history CSV to get started.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300">CSV File</label>
                        <input id="file-upload" name="file-upload" type="file" accept=".csv" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"/>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50">
                        {isLoading ? <Spinner /> : 'Upload & Analyze'}
                    </button>
                </form>
            </Card>
        </div>
    );
};

const DashboardPage: FC = () => {
    const { transactions } = useAppContext();
    if (!transactions) return <p>No transaction data found. Please upload your history.</p>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Transaction Preview</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-300">
                        <thead className="bg-gray-700 text-xs text-gray-200 uppercase">
                            <tr>
                                <th scope="col" className="px-6 py-3">Ticker</th>
                                <th scope="col" className="px-6 py-3">Buy Date</th>
                                <th scope="col" className="px-6 py-3">Quantity</th>
                                <th scope="col" className="px-6 py-3">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, index) => (
                                <tr key={index} className="bg-gray-800 border-b border-gray-700">
                                    <td className="px-6 py-4 font-medium text-white">{tx.ticker}</td>
                                    <td className="px-6 py-4">{tx.buy_date}</td>
                                    <td className="px-6 py-4">{tx.quantity}</td>
                                    <td className="px-6 py-4">${tx.price.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const SentimentPage: FC = () => {
    const { sentiment, setSentiment } = useAppContext();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/get-sentiment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: 'default-user', sentiment: input }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit sentiment');
            setSentiment(data.sentiment);
            setMessage(`Sentiment captured: "${data.sentiment}"`);
            setInput('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">What's Up?</h1>
            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Log Your Daily Sentiment</h2>
                <p className="text-gray-400 mb-4">How are you feeling about the market today?</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g., bullish on tech, worried about inflation" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400" />
                    <button type="submit" disabled={isLoading} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold disabled:opacity-50">
                        {isLoading ? <Spinner/> : "Submit"}
                    </button>
                </form>
                {error && <p className="text-red-400 mt-4">{error}</p>}
                {message && <p className="text-green-400 mt-4">{message}</p>}
                {sentiment && <p className="text-gray-300 mt-4">Current stored sentiment: <span className="font-bold text-cyan-400">{sentiment}</span></p>}
            </Card>
        </div>
    );
};

const MarketDataPage: FC = () => {
    const { stockData, setStockData, news, setNews } = useAppContext();
    const [tickers, setTickers] = useState('AAPL,GOOG,MSFT');
    const [isLoading, setIsLoading] = useState({ stock: false, news: false });
    const [error, setError] = useState({ stock: '', news: '' });

    const fetchStockData = async () => {
        setIsLoading(prev => ({...prev, stock: true}));
        setError(prev => ({...prev, stock: ''}));
        try {
            const response = await fetch(`${API_BASE_URL}/get-stock-data?tickers=${tickers}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch stock data');
            setStockData(data.data);
        } catch(err: any) {
            setError(prev => ({...prev, stock: err.message}));
        } finally {
            setIsLoading(prev => ({...prev, stock: false}));
        }
    };

    const fetchNews = async () => {
        setIsLoading(prev => ({...prev, news: true}));
        setError(prev => ({...prev, news: ''}));
        try {
            const response = await fetch(`${API_BASE_URL}/get-news?tickers=${tickers}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch news');
            setNews(data.headlines);
        } catch(err: any) {
            setError(prev => ({...prev, news: err.message}));
        } finally {
            setIsLoading(prev => ({...prev, news: false}));
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-white">Market Data</h1>
            <Card>
                <h2 className="text-xl font-semibold text-white mb-4">Fetch Stock & News Data</h2>
                <div className="flex items-end space-x-4">
                    <div className="flex-grow">
                        <label htmlFor="tickers" className="block text-sm font-medium text-gray-300">Tickers (comma-separated)</label>
                        <input type="text" id="tickers" value={tickers} onChange={e => setTickers(e.target.value)} className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white"/>
                    </div>
                    <button onClick={fetchStockData} disabled={isLoading.stock} className="py-2 px-4 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-semibold disabled:opacity-50 h-10">
                        {isLoading.stock ? <Spinner/> : "Get Stock Data"}
                    </button>
                    <button onClick={fetchNews} disabled={isLoading.news} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-semibold disabled:opacity-50 h-10">
                        {isLoading.news ? <Spinner/> : "Get News"}
                    </button>
                </div>
            </Card>

            {error.stock && <p className="text-red-400">{error.stock}</p>}
            {stockData && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">Stock Financials</h3>
                    {stockData.map(stock => (
                        <div key={stock.ticker} className="mb-4">
                            <h4 className="font-bold text-cyan-400">{stock.ticker}</h4>
                            <p>P/E Ratio: {stock.pe_ratio}</p>
                            <p>EPS: {stock.eps}</p>
                        </div>
                    ))}
                </Card>
            )}

            {error.news && <p className="text-red-400">{error.news}</p>}
            {news && (
                <Card>
                    <h3 className="text-lg font-semibold text-white mb-4">News Headlines</h3>
                    <ul className="space-y-2">
                        {news.map((item, i) => (
                            <li key={i}><a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{item.title}</a> ({item.source})</li>
                        ))}
                    </ul>
                </Card>
            )}
        </div>
    );
};

const AnalysisPage: FC = () => {
    const { analysis, setAnalysis, transactions, sentiment, stockData, news } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const canAnalyze = transactions && sentiment && stockData && news;

    const handleAnalysis = async () => {
        if (!canAnalyze) {
            setError("Please ensure you have uploaded transactions, logged sentiment, and fetched market data/news before analyzing.");
            return;
        }
        setIsLoading(true);
        setError('');

        const payload = {
            user_id: 'default-user',
            sentiment: sentiment,
            transaction_history: transactions.map(t => ({...t, transaction_date: t.buy_date, transaction_type: 'buy'})),
            current_metrics: stockData.map(s => ({ticker: s.ticker, pe_ratio: s.pe_ratio, eps: s.eps})),
            news_summaries: news.map(n => ({ticker: '', headline: n.title})), // Mocking ticker for news
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.message || "Analysis failed");
            setAnalysis(data.recommendations);
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Analysis my Portfolio</h1>
            <Card>
                <button onClick={handleAnalysis} disabled={isLoading || !canAnalyze} className="w-full py-3 px-6 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                     {isLoading ? <span className="flex items-center justify-center"><Spinner/></span> : "Analyze My Portfolio"}
                </button>
                {!canAnalyze && <p className="text-yellow-400 text-sm mt-4">Please complete all previous steps (upload transactions, log sentiment, get market data and news) to enable analysis.</p>}
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </Card>

            {analysis && (
                <Card>
                    <h2 className="text-xl font-semibold text-white mb-4">AI Recommendations</h2>
                    <div className="space-y-4">
                        {analysis.map((rec, i) => (
                            <div key={i} className="p-4 bg-gray-700 rounded-lg">
                                <h3 className="font-bold text-cyan-400 text-lg">{rec.ticker}: <span className="text-white">{rec.recommendation}</span> <span className="text-sm text-gray-400">({rec.confidence} confidence)</span></h3>
                                <p className="text-gray-300">{rec.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const Header: FC = () => {
    const { logout } = useAppContext();
    return (
        <header className="bg-gray-800/80 backdrop-blur-md shadow-md p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-3">
                <span className="text-2xl">📈</span>
                <h1 className="text-xl font-bold text-white">Andre</h1>
            </div>
            <button onClick={logout} className="py-2 px-4 text-sm bg-red-600 hover:bg-red-700 rounded-md text-white font-semibold">
                Logout
            </button>
        </header>
    );
};

const Nav: FC<{ currentPage: string }> = ({ currentPage }) => {
    const { navigate } = useAppContext();
    const navItems = [
        { path: '/dashboard', title: 'Dashboard' },
        { path: '/sentiment', title: "What's Up" },
        { path: '/market-data', title: 'Get Market Data' },
        { path: '/analysis', title: 'Analysis my Portfolio' },
    ];
    return (
        <nav className="w-64 bg-gray-800 p-4 space-y-2 flex-shrink-0">
            {navItems.map(item => (
                <button key={item.path} onClick={() => navigate(item.path)} className={`w-full text-left p-3 rounded-md font-semibold ${currentPage === item.path ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                    {item.title}
                </button>
            ))}
        </nav>
    );
};

// --- MAIN APP COMPONENT ---

// Helper to get the current page from the URL hash.
const getCurrentPage = () => {
    // Default to '/upload' if hash is empty, '#', or just '/'
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
        return '/upload';
    }
    // Return the path part of the hash (e.g., #/dashboard -> /dashboard)
    return window.location.hash.slice(1);
};

const App: FC = () => {
    const [page, setPage] = useState(getCurrentPage());
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [sentiment, setSentiment] = useState('');
    const [stockData, setStockData] = useState<StockData[] | null>(null);
    const [news, setNews] = useState<NewsHeadline[] | null>(null);
    const [analysis, setAnalysis] = useState<Recommendation[] | null>(null);

    // Effect to handle browser navigation (back/forward buttons) by listening to hash changes.
    useEffect(() => {
        const handleHashChange = () => {
            setPage(getCurrentPage());
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []); // Empty dependency array ensures this runs only once on mount.

    // Navigation function now updates the URL hash.
    const navigate = (newPage: string) => {
        window.location.hash = `#${newPage}`;
    };

    const logout = () => {
        setTransactions(null);
        setSentiment('');
        setStockData(null);
        setNews(null);
        setAnalysis(null);
        navigate('/upload');
    };
    
    const contextValue = {
        navigate,
        logout,
        transactions, setTransactions,
        sentiment, setSentiment,
        stockData, setStockData,
        news, setNews,
        analysis, setAnalysis,
    };

    const renderPage = () => {
        switch(page) {
            case '/dashboard': return <DashboardPage />;
            case '/sentiment': return <SentimentPage />;
            case '/market-data': return <MarketDataPage />;
            case '/analysis': return <AnalysisPage />;
            default: return <UploadPage />;
        }
    };
    
    const isUploadPage = page === '/upload';

    return (
        <AppContext.Provider value={contextValue}>
            {isUploadPage ? (
                <UploadPage />
            ) : (
                <div className="flex h-full">
                    <Nav currentPage={page} />
                    <div className="flex-1 flex flex-col">
                        <Header />
                        <main className="flex-1 p-8 overflow-y-auto">
                           {renderPage()}
                        </main>
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);