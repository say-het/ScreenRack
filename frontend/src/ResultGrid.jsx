import { useState } from 'react';
import { Image } from 'react-feather';
import ImageModal from './ImageModal';
import { getScreenshotUrl } from './api';

function ResultGrid({ results, loading }) {
    const [selectedImage, setSelectedImage] = useState(null);

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="relative bg-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/10 animate-pulse">
                        <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
                        <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (results.length === 0) {
        return null;
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, idx) => {
                    const filename = result.path.split('\\').pop().split('/').pop();
                    const imageUrl = getScreenshotUrl(filename);

                    return (
                        <div
                            key={idx}
                            onClick={() => setSelectedImage({ ...result, filename, imageUrl })}
                            className="group relative bg-gray-900/50 rounded-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-400/60 transition-all cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20"
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500 pointer-events-none"></div>

                            {/* Image */}
                            <div className="aspect-video w-full overflow-hidden bg-gray-950 relative">
                                <img
                                    src={imageUrl}
                                    alt="Screenshot"
                                    className="w-full h-full object-cover object-top opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                    loading="lazy"
                                />

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-400/30">
                                        Click to view
                                    </span>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="relative p-4 bg-gray-900/80 backdrop-blur-sm">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-mono text-gray-300 truncate flex-1" title={filename}>
                                        {filename}
                                    </h3>
                                    <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/30 whitespace-nowrap">
                                        {result.score.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}
        </>
    );
}

export default ResultGrid;
