import { X, ExternalLink, FileText } from 'react-feather';
import { useEffect } from 'react';

function ImageModal({ image, onClose }) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative max-w-6xl w-full max-h-[90vh] bg-gray-900 rounded-2xl border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/20 overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-gray-950/80 backdrop-blur-sm">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        <h3 className="text-sm font-mono text-gray-300 truncate" title={image.filename}>
                            {image.filename}
                        </h3>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-400/30 whitespace-nowrap">
                            Score: {image.score.toFixed(2)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                        <a
                            href={image.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-gray-800 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 transition-all group"
                            title="Open in new tab"
                        >
                            <ExternalLink className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-gray-800 border border-cyan-500/30 hover:border-red-400 hover:shadow-lg hover:shadow-red-500/20 transition-all group"
                            title="Close (Esc)"
                        >
                            <X className="w-4 h-4 text-cyan-400 group-hover:text-red-400 transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-5rem)] custom-scrollbar">
                    <div className="grid lg:grid-cols-2 gap-6 p-6">
                        {/* Image Preview */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Preview</h4>
                            <div className="relative rounded-lg overflow-hidden border border-cyan-500/20 bg-gray-950">
                                <img
                                    src={image.imageUrl}
                                    alt="Screenshot preview"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>

                        {/* OCR Text */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Extracted Text (OCR)</h4>
                            <div className="relative rounded-lg border border-cyan-500/20 bg-gray-950/50 p-4 min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
                                {image.text && image.text.trim() ? (
                                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap break-words leading-relaxed">
                                        {image.text}
                                    </pre>
                                ) : (
                                    <p className="text-sm text-gray-600 italic font-mono">No text detected in this screenshot.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImageModal;
