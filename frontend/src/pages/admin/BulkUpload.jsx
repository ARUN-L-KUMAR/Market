import React, { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    UploadCloud,
    FileText,
    Info,
    AlertCircle,
    CheckCircle2,
    Download,
    ChevronRight,
    ArrowUpCircle,
    X,
    Clipboard,
    Search
} from 'lucide-react';
import { toast } from 'react-toastify';

const BulkUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
            setFile(selectedFile);
            setUploadResult(null);
            setProgress(0);
            toast.info(`Asset "${selectedFile.name}" staged for deployment.`);
        } else {
            toast.error('Invalid Protocol: Only .csv architecture files are supported.');
        }
    };

    const handleDownloadTemplate = () => {
        toast.info('Synthesizing CSV schema template...');
        setTimeout(() => {
            toast.success('Schema template downloaded to your system.');
            // Implementation detail: In a real app, this would trigger a window.location.href or blob download
        }, 1000);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        // Simulating progressive sync
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);

        setTimeout(() => {
            setUploading(false);
            setUploadResult({
                success: true,
                total: 45,
                imported: 42,
                errors: [
                    { row: 12, message: 'Invalid SKU format' },
                    { row: 28, message: 'Price must be a number' },
                    { row: 31, message: 'Category not found' }
                ]
            });
            toast.success('Catalog Synchronization Protocol Complete.');
        }, 2500);
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
                        <UploadCloud className="h-3 w-3" />
                        Sync Engine v2.0
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Bulk Infrastructure</h1>
                    <p className="text-slate-500 font-medium max-w-xl mx-auto">High-performance product synchronization and catalog migration tool.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Left Side: Upload Zone */}
                    <div className="space-y-6">
                        <div className="bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm">
                            <div className={`p-10 border-2 border-dashed rounded-[2rem] transition-all flex flex-col items-center text-center ${file ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                }`}>
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm ${file ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400'
                                    }`}>
                                    <FileText className="h-10 w-10" />
                                </div>
                                {file ? (
                                    <div className="animate-in fade-in zoom-in duration-300 w-full">
                                        <h3 className="text-lg font-black text-slate-900 truncate px-4">{file.name}</h3>
                                        <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{(file.size / 1024).toFixed(2)} KB • Ready for sync</p>
                                        <button
                                            onClick={() => setFile(null)}
                                            className="mt-6 text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 mx-auto hover:text-red-600 transition-colors"
                                        >
                                            <X className="h-3 w-3" /> Remove File
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Drop your CSV here</h3>
                                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-[240px]">Download our schema template for optimal data mapping.</p>
                                        <label className="mt-8 px-8 py-3.5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all cursor-pointer shadow-xl shadow-slate-200 flex items-center gap-2 transform active:scale-95">
                                            <UploadCloud className="h-4 w-4" />
                                            Browse Files
                                            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {file && !uploading && !uploadResult && (
                            <button
                                onClick={handleUpload}
                                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs transform active:scale-[0.98]"
                            >
                                <ArrowUpCircle className="h-5 w-5" />
                                Initialize Catalog Sync
                            </button>
                        )}

                        {uploading && (
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center">
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4 p-0.5 border border-slate-50">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
                                    Processing Rows • {progress}% Complete
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: Instructions & Results */}
                    <div className="space-y-6">
                        {!uploadResult ? (
                            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                                <div className="absolute right-[-10%] top-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                                <h3 className="text-xl font-black tracking-tight mb-6">Synchronization Protocol</h3>
                                <div className="space-y-6 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 shrink-0 border border-white/10 font-black text-xs">01</div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Schema Verification</div>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">Headers must exactly match: <code className="text-[10px] bg-white/5 p-1 rounded font-mono">title, sku, price, stock, category</code></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 shrink-0 border border-white/10 font-black text-xs">02</div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Image Assets</div>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">Use absolute Cloudinary or AWS S3 URLs. Local file paths will be rejected.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 shrink-0 border border-white/10 font-black text-xs">03</div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Data Cleaning</div>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">SKUs must be unique. Duplicate keys will trigger a row exception.</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="mt-10 w-full py-4 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all transform active:scale-95"
                                >
                                    <Download className="h-4 w-4" />
                                    Get Schema Template
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Import Summary</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Process completed successfully</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                        <div className="text-2xl font-black text-slate-900">{uploadResult.imported}</div>
                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Succeeded</div>
                                    </div>
                                    <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 text-center">
                                        <div className="text-2xl font-black text-red-600">{uploadResult.errors.length}</div>
                                        <div className="text-[8px] font-black text-red-400 uppercase tracking-widest mt-1">Exceptions</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex justify-between">
                                        Exception Log
                                        <span onClick={() => toast.info('Exporting error log...')} className="text-indigo-600 cursor-pointer hover:underline">Export CSV</span>
                                    </div>
                                    {uploadResult.errors.map((error, idx) => (
                                        <div key={idx} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 hover:border-red-200 transition-all cursor-pointer">
                                            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black text-[10px] border border-red-100">
                                                L{error.row}
                                            </div>
                                            <div className="text-xs font-bold text-slate-700">{error.message}</div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setUploadResult(null)}
                                    className="mt-8 w-full py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                >
                                    <Clipboard className="h-4 w-4" />
                                    New Infrastructure Load
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default BulkUpload;
