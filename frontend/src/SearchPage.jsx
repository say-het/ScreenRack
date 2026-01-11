import { useState } from 'react';
import { Search, RefreshCw, Command } from 'react-feather';
import ResultGrid from './ResultGrid';
import { search, reindex, getScreenshotUrl } from './api';
import NoResults from './NoResults';

function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [indexing, setIndexing] = useState(false);
    const [indexMsg, setIndexMsg] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setResults([]);
        setError('');

        try {
            const data = await search(query);
            setResults(data.results || []);
            if (data.results.length === 0) {
                setError('No results found. Try different keywords.');
            }
        } catch (err) {
            setError('Search failed. Is the backend running?');
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleIndex = async () => {
        setIndexing(true);
        setIndexMsg('Scanning screenshots...');
        setError('');

        try {
            const data = await reindex();
            setIndexMsg(data.message || `✓ Indexed ${data.count} images`);
            setTimeout(() => setIndexMsg(''), 4000);
        } catch (err) {
            setError('Indexing failed. Check backend logs.');
            console.error("Index error:", err);
        } finally {
            setIndexing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
            {/* Cyberpunk Grid Background */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <nav className="relative border-b border-cyan-500/20 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-cyan-500/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="relative bg-gradient-to-br from-cyan-500 to-purple-600 p-2.5 rounded-lg shadow-lg shadow-cyan-500/50 animate-pulse">
                                <Command className="w-5 h-5 text-white" />
                                <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-30 rounded-lg"></div>
                            </div>
                            <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                                SCREENRACK
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {indexMsg && (
                                <span className="text-sm text-cyan-400 font-mono px-3 py-1 bg-cyan-400/10 rounded-full border border-cyan-400/30 animate-pulse">
                                    {indexMsg}
                                </span>
                            )}
                            <button
                                onClick={handleIndex}
                                disabled={indexing}
                                className={`group relative p-2.5 rounded-lg bg-gray-900 border border-cyan-500/30 hover:border-cyan-400 transition-all ${indexing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-cyan-500/20'}`}
                                title="Index Screenshots"
                            >
                                <RefreshCw className={`w-5 h-5 text-cyan-400 ${indexing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Error Banner */}
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg backdrop-blur-sm animate-pulse">
                        <p className="text-red-400 text-sm font-mono text-center">{error}</p>
                    </div>
                )}

                {/* Search Hero */}
                <div className="flex flex-col items-center justify-center mb-20 space-y-10">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
                                Neural Screenshot Search
                            </span>
                        </h1>
                        <p className="text-gray-500 text-lg font-mono">AI-powered semantic search for your screenshots</p>
                    </div>

                    <form onSubmit={handleSearch} className="w-full max-w-3xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                            </div>

                            <input
                                type="text"
                                className="block w-full pl-14 pr-6 py-5 bg-gray-900/90 border-2 border-cyan-500/30 rounded-2xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20 sm:text-lg font-mono backdrop-blur-sm transition-all"
                                placeholder="Search: 'error message', 'slack conversation', 'code snippet'..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />

                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {loading ? (
                    <ResultGrid results={[]} loading={true} />
                ) : results.length > 0 ? (
                    <ResultGrid results={results} loading={false} />
                ) : (
                    query && <NoResults query={query} />
                )}
            </main>
        </div>
    );
}

export default SearchPage;
