// components/HistoryGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/Card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Eye } from 'lucide-react';

interface HistoryItem {
  id: string;
  created_at: string;
  model_image_preview: string;
  garment_type: string;
  result_url: string;
  video_url: string | null;
  credits_used: number;
}

interface HistoryGridProps {
  userId: string;
}

export function HistoryGrid({ userId }: HistoryGridProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('tryon_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const { error } = await supabase
        .from('tryon_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <div className="text-5xl opacity-50">📁</div>
          <h3 className="text-xl font-semibold">No History Yet</h3>
          <p className="text-gray-400">
            Your generated try-ons will appear here
          </p>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mt-4"
          >
            Create Your First Try-On
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Item Preview */}
      {selectedItem && (
        <Card className="p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <img
                src={selectedItem.result_url}
                alt="Try-on result"
                className="w-full rounded-lg"
              />
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => downloadImage(
                    selectedItem.result_url,
                    `tryon-${selectedItem.id}.jpg`
                  )}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                {selectedItem.video_url && (
                  <Button
                    onClick={() => window.open(selectedItem.video_url!, '_blank')}
                    className="flex-1"
                    variant="outline"
                  >
                    Watch Video
                  </Button>
                )}
              </div>
            </div>
            <div className="md:w-64 space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Created</p>
                <p className="font-medium">
                  {new Date(selectedItem.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Garment Type</p>
                <p className="font-medium capitalize">{selectedItem.garment_type}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Credits Used</p>
                <p className="font-medium">{selectedItem.credits_used}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* History Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:bg-white/5 transition-colors">
            <div className="aspect-square overflow-hidden">
              <img
                src={item.result_url}
                alt="Try-on result"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                onClick={() => setSelectedItem(item)}
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium capitalize">{item.garment_type}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedItem(item)}
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItem(item.id)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {item.video_url && (
                <div className="mt-2 flex items-center text-sm text-blue-400">
                  <span className="mr-1">🎬</span>
                  Video available
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Total Generations</p>
            <p className="text-2xl font-bold">{history.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Credits Used</p>
            <p className="text-2xl font-bold">
              {history.reduce((sum, item) => sum + item.credits_used, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Last Generation</p>
            <p className="text-lg font-medium">
              {history[0] ? new Date(history[0].created_at).toLocaleDateString() : 'Never'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
