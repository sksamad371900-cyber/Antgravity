/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_MOCKUPS, MockupSample } from '../utils/sampleMockups';

interface MockupSelectorProps {
  onImageSelected: (dataUrl: string, sample?: MockupSample) => void;
  selectedSampleId?: string;
  hasCustomImage: boolean;
  imageDimensions?: { width: number; height: number };
}

export const MockupSelector: React.FC<MockupSelectorProps> = ({
  onImageSelected,
  selectedSampleId,
  hasCustomImage,
  imageDimensions,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      alert('Please upload a valid PNG, JPG or WebP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onImageSelected(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-[#121824] border border-[#232f42] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#8a7af8]">STEP 01</span>
          <h2 className="text-sm font-bold text-white tracking-wide">Select or Drop Mockup</h2>
        </div>
        {imageDimensions && (
          <span className="text-[11px] font-mono text-[#8b9bb2] bg-[#192231] px-2 py-0.5 rounded">
            {imageDimensions.width} × {imageDimensions.height} px
          </span>
        )}
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative cursor-pointer border border-dashed border-[#34445c] hover:border-[#7b6cf2] bg-[#0d121c] hover:bg-[#151a27] rounded-lg p-4 text-center transition-all flex flex-col items-center justify-center gap-2"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-lg bg-[#1f283a] group-hover:bg-[#28254f] group-hover:text-[#9d8fff] text-[#8696ae] flex items-center justify-center transition-colors">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#d2deee] block">
            Click to upload your jersey mockup
          </span>
          <span className="text-[11px] text-[#6d7e97]">
            or drag &amp; drop PNG, JPG, WebP (up to 25 MB)
          </span>
        </div>
      </div>

      {/* Pre-loaded sample presets */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-[#7e8ea6] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ffe27a]" />
            Or try instant realistic samples:
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_MOCKUPS.map((sample) => {
            const isSelected = selectedSampleId === sample.id && !hasCustomImage;
            return (
              <button
                key={sample.id}
                onClick={() => onImageSelected(sample.imageUrl || sample.svgDataUri || '', sample)}
                className={`p-2 rounded-lg text-left border transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'border-[#7b6cf2] bg-[#1a1c32] shadow-sm'
                    : 'border-[#232f42] bg-[#0d131f] hover:border-[#384863] hover:bg-[#141b29]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white truncate max-w-[140px]">
                    {sample.name}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a8]"></span>
                  )}
                </div>
                <span className="text-[10px] text-[#7d8ca3] leading-tight">
                  {sample.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
