'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { compressImage, CompressionOptions, CompressionResult } from '@/lib/imageCompression';

interface ImageUploadWithCompressProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  compressionOptions?: CompressionOptions;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  className?: string;
}

export default function ImageUploadWithCompress({
  value,
  onChange,
  label = 'Upload Image',
  helperText = 'PNG, JPG, WebP up to 10MB (auto-compressed on select)',
  compressionOptions,
  aspectRatio = 'auto',
  className = '',
}: ImageUploadWithCompressProps) {
  const [compressing, setCompressing] = useState(false);
  const [stats, setStats] = useState<{ original: string; compressed: string; saved: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    setCompressing(true);
    setStats(null);

    try {
      const result: CompressionResult = await compressImage(file, compressionOptions);
      setStats({
        original: result.originalSizeFormatted,
        compressed: result.compressedSizeFormatted,
        saved: result.savedPercent,
      });
      onChange(result.dataUrl);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Failed to process and compress image');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]',
    auto: 'min-h-[160px]',
  }[aspectRatio];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-bold text-[#44505C]">{label}</label>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#DDD5C7] bg-[#FAF8F5] p-2 flex flex-col items-center">
          <div className={`relative w-full ${aspectClass} max-h-56 rounded-xl overflow-hidden bg-[#ECE6DC]/50 flex items-center justify-center`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Action overlay */}
          <div className="mt-2.5 w-full flex items-center justify-between text-xs px-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[#5C7489] hover:text-[#14191F] font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Image</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>

          {/* Auto-compress info badge */}
          {stats && (
            <div className="mt-2 w-full p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center justify-between font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Auto-Compressed</span>
              </span>
              <span>
                {stats.original} → <strong className="font-mono">{stats.compressed}</strong> ({stats.saved}% saved)
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 flex flex-col items-center justify-center ${
            dragOver
              ? 'border-[#5C7489] bg-[#EDF3F7]'
              : 'border-[#DDD5C7] bg-[#FAF8F5] hover:bg-[#F4EFEA] hover:border-[#8BA1B4]'
          }`}
        >
          {compressing ? (
            <div className="py-4 flex flex-col items-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#5C7489] animate-spin" />
              <p className="text-xs font-semibold text-[#14191F]">Optimizing & Auto-Compressing image...</p>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-2xl bg-white shadow-xs border border-[#ECE6DC] text-[#5C7489] mb-3">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#14191F]">
                Click or drag & drop to upload
              </p>
              <p className="text-[11px] text-[#7A8B99] mt-1">
                {helperText}
              </p>
              <span className="mt-2.5 inline-flex items-center gap-1 text-[10px] text-[#5C7489] font-semibold bg-[#EDF3F7] px-2.5 py-0.5 rounded-full border border-[#D5E1E9]">
                <Sparkles className="w-3 h-3" />
                <span>Auto-Compress Active</span>
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
