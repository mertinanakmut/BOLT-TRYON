'use client';

import { useMemo, useState, useEffect } from 'react';
import { Upload, Video, Image as ImageIcon, Download, Sparkles, Clock, Zap, AlertCircle } from 'lucide-react';
import { UploadArea } from '@/components/UploadArea';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Spinner } from '@/components/Spinner';
import { useToast } from '@/components/Toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateTryOnWithMock as generateTryOn, fileToBase64 } from '@/lib/api';

type TryOnResponse = {
  success?: boolean;
  data?: {
    imageUrl?: string;
    videoUrl?: string | null;
    generationTimeMs?: number;
    remainingCredits?: number;
    requestId?: string;
    historyId?: string;
    [key: string]: any;
  };
  imageUrl?: string;
  videoUrl?: string | null;
  generationTimeMs?: number;
  remainingCredits?: number;
  [key: string]: any;
};

type HistoryItem = {
  id: string;
  imageUrl?: string;
  videoUrl?: string | null;
  generationTimeMs?: number;
  timestamp: number;
};

type DisplayItem = {
  id: string;
  imageUrl?: string;
  videoUrl?: string | null;
  generationTimeMs?: number;
  timestamp: number;
};

// 🆕 Yeni: Görsel proxy fonksiyonu - CORS sorununu çözer
async function fetchImageWithCors(url: string): Promise<string> {
  try {
    // 1. Önce direkt deneyelim
    const testResponse = await fetch(url, { mode: 'cors', credentials: 'omit' });
    
    if (testResponse.ok) {
      return url; // Direkt çalışıyorsa URL'yi döndür
    }
    
    // 2. Çalışmazsa proxy kullan
    console.log('Direct fetch failed, using proxy...');
    
    // 🆕 Proxy endpoint'ine istek yap
    const proxyUrl = `/api/proxy/image?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error(`Proxy fetch failed: ${proxyResponse.status}`);
    }
    
    // Blob'u data URL'ye çevir
    const blob = await proxyResponse.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
    
  } catch (error) {
    console.error('Image fetch error:', error);
    throw error;
  }
}

export function TryOnClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [modelFile, setModelFile] = useState<File | null>(null);
  const [tshirtFile, setTshirtFile] = useState<File | null>(null);
  const [generateVideo, setGenerateVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<TryOnResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // 🆕 Yeni: Görsel data URL state'i (CORS çözümü için)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [modelImageErrors, setModelImageErrors] = useState<string>('');
  const [tshirtImageErrors, setTshirtImageErrors] = useState<string>('');

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return history.find((h) => h.id === selectedId) ?? null;
  }, [history, selectedId]);

  // 🆕 Görsel URL'sini doğru şekilde al
  const display = useMemo((): DisplayItem | null => {
    if (selected) {
      return {
        id: selected.id,
        imageUrl: selected.imageUrl,
        videoUrl: selected.videoUrl,
        generationTimeMs: selected.generationTimeMs,
        timestamp: selected.timestamp,
      };
    }
    
    if (result) {
      // Result'dan imageUrl'i çıkar
      const imageUrl = result.data?.imageUrl || result.imageUrl;
      const videoUrl = result.data?.videoUrl || result.videoUrl;
      const generationTimeMs = result.data?.generationTimeMs || result.generationTimeMs;
      
      return {
        id: 'current',
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || null,
        generationTimeMs: typeof generationTimeMs === 'number' ? generationTimeMs : 0,
        timestamp: Date.now(),
      };
    }
    
    return null;
  }, [selected, result]);

  // 🆕 Yeni: Görsel URL'si değiştiğinde data URL'ye çevir
  useEffect(() => {
    const loadImage = async () => {
      if (!display?.imageUrl) {
        setImageDataUrl(null);
        return;
      }

      setImageLoading(true);
      try {
        const dataUrl = await fetchImageWithCors(display.imageUrl);
        setImageDataUrl(dataUrl);
      } catch (error) {
        console.error('Failed to load image:', error);
        showToast('Failed to load image. Please try again.', 'error');
        setImageDataUrl(null);
      } finally {
        setImageLoading(false);
      }
    };

    loadImage();
  }, [display?.imageUrl, showToast]);

  const handleGenerateTryOn = async () => {
    setModelImageErrors('');
    setTshirtImageErrors('');
    setResult(null);
    setSelectedId(null);
    setImageDataUrl(null); // 🆕 Yeni: Eski görseli temizle

    if (!modelFile) {
      setModelImageErrors('Please upload a model image');
      showToast(t('tryon.selectImages'), 'error');
      return;
    }

    if (!tshirtFile) {
      setTshirtImageErrors('Please upload a T-shirt image');
      showToast(t('tryon.selectImages'), 'error');
      return;
    }

    try {
      setLoading(true);
      setImageLoading(true); // 🆕 Yeni: Görsel yükleme başladı

      const modelImageBase64 = await fileToBase64(modelFile);
      const tshirtImageBase64 = await fileToBase64(tshirtFile);

      const response = await generateTryOn({
        modelImage: modelImageBase64,
        tshirtImage: tshirtImageBase64,
        generateVideo,
      });

      console.log('API Response in TryOnClient:', response);

      // Response structure kontrolü
      let imageUrl: string | undefined = undefined;
      let videoUrl: string | null | undefined = undefined;
      let generationTimeMs: number | undefined = undefined;
      let remainingCredits: number | undefined = undefined;
      
      if (response.success && response.data) {
        // Yeni format: { success: true, data: { imageUrl: ... } }
        imageUrl = response.data.imageUrl;
        videoUrl = response.data.videoUrl;
        generationTimeMs = typeof response.data.generationTimeMs === 'number' 
          ? response.data.generationTimeMs 
          : undefined;
        remainingCredits = typeof response.data.remainingCredits === 'number'
          ? response.data.remainingCredits
          : undefined;
      } else if (response.imageUrl) {
        // Eski format: { imageUrl: ... }
        imageUrl = response.imageUrl;
        videoUrl = response.videoUrl;
        generationTimeMs = typeof response.generationTimeMs === 'number'
          ? response.generationTimeMs
          : undefined;
        remainingCredits = typeof response.remainingCredits === 'number'
          ? response.remainingCredits
          : undefined;
      }
      
      if (!imageUrl) {
        console.error('No imageUrl found in API response:', response);
        showToast('API did not return an image URL', 'error');
        return;
      }

      const resultData: TryOnResponse = {
        success: true,
        data: {
          imageUrl,
          videoUrl: videoUrl || null,
          generationTimeMs: generationTimeMs || 0,
          remainingCredits: remainingCredits || 0,
        }
      };

      setResult(resultData);

      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        imageUrl,
        videoUrl: videoUrl || null,
        generationTimeMs: generationTimeMs || 0,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newItem, ...prev].slice(0, 6));

      showToast(t('tryon.success'), 'success');
    } catch (error: unknown) {
      console.error('Try-on error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast(`Try-on failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!display?.imageUrl) {
      showToast('No image available to download', 'error');
      return;
    }
    
    try {
      const dataUrl = imageDataUrl || await fetchImageWithCors(display.imageUrl);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `vogue-ai-tryon-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Image downloaded successfully', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('Download failed. Please try again.', 'error');
    }
  };

  // 🆕 Yeni: Görsel yükleme durumu
  const isImageAvailable = !!imageDataUrl && !imageLoading;
  const isImageLoading = imageLoading && !!display?.imageUrl;

  const generationTimeDisplay = display?.generationTimeMs && typeof display.generationTimeMs === 'number'
    ? `${(display.generationTimeMs / 1000).toFixed(1)}s` 
    : 'Fast';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('tryon.modelImage')} & {t('tryon.tshirtImage')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Upload clear photos of yourself and the clothing item you want to try on
        </p>
      </div>

      {/* Upload Areas - Vercel Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model Image Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/10">
                <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tryon.modelImage')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clear portrait photo</p>
              </div>
            </div>
            {modelFile && (
              <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                Uploaded
              </div>
            )}
          </div>
          <UploadArea
            label={t('tryon.modelImage')}
            file={modelFile}
            onFileChange={setModelFile}
            error={modelImageErrors}
          />
        </div>

        {/* T-Shirt Image Upload */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/10">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{t('tryon.tshirtImage')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Clothing item photo</p>
              </div>
            </div>
            {tshirtFile && (
              <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                Uploaded
              </div>
            )}
          </div>
          <UploadArea
            label={t('tryon.tshirtImage')}
            file={tshirtFile}
            onFileChange={setTshirtFile}
            error={tshirtImageErrors}
          />
        </div>
      </div>

      {/* Video Option & Generate Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Video Generation</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create an animated video result</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <ToggleSwitch
            label="Generate Video"
            checked={generateVideo}
            onChange={(checked: boolean) => setGenerateVideo(checked)}
          />
          
          <PrimaryButton 
            onClick={handleGenerateTryOn} 
            disabled={loading || !modelFile || !tshirtFile}
            className="min-w-[200px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Spinner />
                <span>{t('tryon.generating')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>{t('tryon.generate')}</span>
              </div>
            )}
          </PrimaryButton>
        </div>
      </div>

      {/* Result Section */}
      {display && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{t('tryon.result')}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{generationTimeDisplay}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>2 credits used</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={!isImageAvailable || imageLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {imageLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{imageLoading ? 'Loading...' : 'Download'}</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* 🆕 Yeni: Görsel yükleme durumu */}
            {isImageLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Spinner />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Loading image...</p>
              </div>
            )}

            {isImageAvailable ? (
              <div className="relative">
                <img
                  src={imageDataUrl || ''}
                  alt="Try-on result"
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                  crossOrigin="anonymous" // 🆕 CORS için önemli
                  onError={() => {
                    console.error('Image failed to load');
                    showToast('Image failed to load. Please try again.', 'error');
                  }}
                />
                {display.videoUrl && (
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium flex items-center space-x-1">
                      <Video className="w-4 h-4" />
                      <span>Video Available</span>
                    </div>
                  </div>
                )}
              </div>
            ) : !isImageLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">Image not available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try reloading or check console for errors
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white">{t('tryon.history')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your recent try-ons</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedId === item.id 
                      ? 'border-blue-500 dark:border-blue-400' 
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  {item.imageUrl ? (
                    <img
                      src={`/api/proxy/image?url=${encodeURIComponent(item.imageUrl)}`}
                      alt="History item"
                      className="w-full h-32 object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {item.videoUrl && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Video className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300">High Quality Photos</h4>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Use well-lit, clear photos for best results
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-500/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
              <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-medium text-purple-900 dark:text-purple-300">Fast Processing</h4>
          </div>
          <p className="text-sm text-purple-700 dark:text-purple-400">
            Results in under 30 seconds with our AI
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-500/10 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
              <Download className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-medium text-green-900 dark:text-green-300">Download HD</h4>
          </div>
          <p className="text-sm text-green-700 dark:text-green-400">
            Download high-resolution results instantly
          </p>
        </div>
      </div>
    </div>
  );
}