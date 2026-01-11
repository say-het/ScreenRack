import { Image } from 'react-feather';

function NoResults({ query }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 animate-fadeIn">
            <div className="bg-gray-800/50 p-6 rounded-full mb-6 relative">
                <Image className="w-12 h-12 text-gray-600 opacity-50" />
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-20"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">No matches found</h3>
            <p className="text-gray-500 max-w-md text-center">
                We couldn't find any screenshots matching <span className="text-cyan-400 font-mono">"{query}"</span>.
            </p>
            <div className="mt-8 flex gap-3 text-sm text-gray-500 font-mono">
                <span className="px-3 py-1 bg-gray-800 rounded border border-gray-700">Try keywords</span>
                <span className="px-3 py-1 bg-gray-800 rounded border border-gray-700">Try descriptions</span>
            </div>
        </div>
    );
}

export default NoResults;
