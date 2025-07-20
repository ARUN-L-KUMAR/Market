import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, FileText, Plus, Check, X } from 'lucide-react';
import Button from '../ui/Button';
import { toast } from 'react-toastify';
import axios from 'axios';

const BulkProductUpload = ({ onProductsAdded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/admin/products/bulk-upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setUploadResults(response.data);
      toast.success(`Successfully uploaded ${response.data.successful} products`);
      onProductsAdded();
      setFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `title,description,shortDescription,price,comparePrice,stock,sku,brand,tags,isFeatured,isActive,imageUrl,colors,sizes
"Sample Product","This is a sample product description","Short description",99.99,129.99,50,"SAMPLE-001","Sample Brand","electronics,sample",true,true,"https://via.placeholder.com/400","[{""name"":""Black"",""hexCode"":""#000000"",""stock"":25},{""name"":""White"",""hexCode"":""#FFFFFF"",""stock"":25}]","[{""name"":""Small"",""stock"":20},{""name"":""Medium"",""stock"":20},{""name"":""Large"",""stock"":10}]"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-8"
    >
      <div className="flex items-center mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-full mr-4">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bulk Product Upload</h2>
          <p className="text-gray-600">Upload multiple products at once using a CSV file</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {file ? file.name : 'Click to select CSV file'}
              </p>
              <p className="text-sm text-gray-500">
                Supported format: CSV files only
              </p>
            </label>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Products'}
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {uploadResults && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 rounded-xl p-4"
            >
              <h3 className="font-semibold text-gray-800 mb-3">Upload Results</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total processed:</span>
                  <span className="font-medium">{uploadResults.total}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Successful:
                  </span>
                  <span className="font-medium text-green-600">{uploadResults.successful}</span>
                </div>
                
                {uploadResults.failed > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600 flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      Failed:
                    </span>
                    <span className="font-medium text-red-600">{uploadResults.failed}</span>
                  </div>
                )}
              </div>

              {uploadResults.errors && uploadResults.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    {uploadResults.errors.slice(0, 3).map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                    {uploadResults.errors.length > 3 && (
                      <li>• ... and {uploadResults.errors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">CSV Format Requirements:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Required: title, price, stock, sku</li>
              <li>• Optional: description, brand, tags, images</li>
              <li>• Colors/sizes should be JSON format</li>
              <li>• Use comma-separated values for tags</li>
              <li>• Boolean fields: true/false</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkProductUpload;
