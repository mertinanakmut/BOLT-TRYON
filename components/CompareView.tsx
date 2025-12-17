// components/CompareView.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Check, X, Maximize2, Download } from 'lucide-react';

interface CompareItem {
  id: string;
  created_at: string;
  result_url: string;
  garment_type: string;
}

interface CompareViewProps {
  userId: string;
}

export function CompareView({ userId }: CompareViewProps) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [userId]);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('tryon_history')
        .select('id, created_at, result_url, garment_type')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching compare items:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const getSelectedItems = () => {
    return items.filter(item => selectedItems.includes(item.id));
  };

  const downloadComparison = async () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    // Create a canvas with side-by-side comparison
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Load all images first
    const images = await Promise.all(
      selected.map(item => 
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.src = item.result_url;
        })
      )
    );

    // Calculate canvas size
    const maxWidth = 800;
    const imageWidth = maxWidth / selected.length;
    const imageHeight = 600;
    
    canvas.width = maxWidth;
    canvas.height = imageHeight + 50; // Extra space for labels

    // Draw images
    images.forEach((img, index) => {
      const x = index * imageWidth;
      ctx.drawImage(img, x, 0, imageWidth, imageHeight);
      
      // Draw label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x, imageHeight, imageWidth, 50);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${selected[index].garment_type} - ${new Date(selected[index].created_at).toLocaleDateString()}`,
        x + imageWidth / 2,
        imageHeight + 30
      );
    });

    // Download
    const link = document.createElement('a');
    link.download = `comparison-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-5xl opacity-50">⚖️</div>
          <h3 className="text-xl font-semibold">Nothing to Compare Yet</h3>
          <p className="text-gray-400">
            Generate some try-ons first to compare them
          </p>
          <Button
            onClick={() => {
              const generateTab = document.querySelector('[data-tab="generate"]');
              if (generateTab instanceof HTMLElement) generateTab.click();
            }}
            className="mt-4"
          >
            Create Your First Try-On
          </Button>
        </div>
      </Card>
    );
  }

  const selected = getSelectedItems();

  return (
    <div className="space-y-6">
      {/* Fullscreen View */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={fullscreen}
              alt="Fullscreen view"
              className="max-w-full max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreen(null)}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Comparison Controls */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="font-semibold">Compare Results</h3>
            <p className="text-sm text-gray-400">
              Select 2-4 images to compare side by side
            </p>
          </div>
          
          <div className="flex gap-2">
            {selected.length > 0 && (
              <>
                <Button
                  onClick={downloadComparison}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Comparison ({selected.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </>
            )}
            <div className="text-sm px-3 py-2 bg-white/10 rounded">
              {selected.length} selected / {items.length} total
            </div>
          </div>
        </div>
      </Card>

      {/* Selected Preview */}
      {selected.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Selected for Comparison</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selected.map((item) => (
              <div key={item.id} className="relative group">
                <img
                  src={item.result_url}
                  alt="Selected for comparison"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFullscreen(item.result_url)}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    className="w-6 h-6 rounded-full bg-green-500 hover:bg-green-600"
                    onClick={() => toggleSelect(item.id)}
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-xs text-center mt-2 text-gray-400">
                  {item.garment_type}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* All Items Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          
          return (
            <div
              key={item.id}
              className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-transparent hover:border-white/30'
              }`}
              onClick={() => toggleSelect(item.id)}
            >
              {/* Selection Indicator */}
              <div className="absolute top-2 right-2 z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-green-500' : 'bg-white/20'
                }`}>
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>

              {/* Image */}
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.result_url}
                  alt="Try-on result"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Overlay Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-sm font-medium capitalize">{item.garment_type}</p>
                <p className="text-xs text-gray-300">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Fullscreen Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreen(item.result_url);
                }}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Comparison Tips */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comparison Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">1</span>
            </div>
            <p className="font-medium">Select 2-4 Images</p>
            <p className="text-sm text-gray-400">
              Choose similar poses for accurate comparison
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">2</span>
            </div>
            <p className="font-medium">Download Side-by-Side</p>
            <p className="text-sm text-gray-400">
              Get a single image with all selected results
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-400">3</span>
            </div>
            <p className="font-medium">Share Results</p>
            <p className="text-sm text-gray-400">
              Compare different garments on the same model
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
