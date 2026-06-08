import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Transaction } from "../types";
import { useSettings } from "../hooks/useSettings";

interface ScannerProps {
  isScanning: boolean;
  scanProgress: number;
  scanStatusText: string;
  scanImage: string | null;
  onStartScan: (base64Str: string) => void;
}

export function mockParseReceipt(rawText: string): Partial<Transaction> {
  const lines = rawText.split('\n');
  let storeName = "Toko Kelontong Berkah";
  let totalAmount = 0;
  const items: any[] = [];

  for (const line of lines) {
    if (/mart|indomaret|alfamart|superindo|transmart|solaria|kfc|mcd/i.test(line)) {
      storeName = line.trim();
      break;
    }
  }

  const numbers: number[] = [];
  for (const line of lines) {
    const match = line.match(/\d+[\d.,]*/);
    if (match) {
      const cleanNum = parseFloat(match[0].replace(/[.,]/g, ''));
      if (cleanNum >= 500 && cleanNum <= 5000000 && cleanNum % 100 === 0) {
        numbers.push(cleanNum);
      }
    }
  }

  if (numbers.length > 0) {
    const sorted = [...new Set(numbers)].sort((a, b) => b - a);
    totalAmount = sorted[0];

    const possibleItems = sorted.slice(1, 4);
    if (possibleItems.length > 0) {
      possibleItems.forEach((price, idx) => {
        const itemNames = ["Beras Premium", "Minyak Goreng 2L", "Gula Pasir 1kg", "Sabun Cuci Piring"];
        items.push({
          name: itemNames[idx] || `Barang Belanjaan ${idx + 1}`,
          qty: 1,
          price: price
        });
      });
      
      const sumItems = items.reduce((sum, item) => sum + item.price, 0);
      if (sumItems > 0 && Math.abs(sumItems - totalAmount) < totalAmount * 0.25) {
        totalAmount = sumItems;
      }
    }
  }

  if (totalAmount === 0) {
    items.push(
      { name: "Minyak Goreng 2L", qty: 1, price: 38000 },
      { name: "Beras Cianjur 5kg", qty: 1, price: 75000 },
      { name: "Gula Pasir 1kg", qty: 2, price: 16000 }
    );
    totalAmount = 145000;
  }

  return {
    type: "expense",
    amount: totalAmount,
    date: new Date().toISOString().split("T")[0],
    storeName,
    description: `Pembelian di ${storeName}`,
    items,
    rawText
  };
}

export function Scanner({ 
  isScanning, 
  scanProgress, 
  scanStatusText, 
  scanImage, 
  onStartScan 
}: ScannerProps) {
  const { t, language } = useSettings();
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useCamera, setUseCamera] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onStartScan(imageSrc);
      }
    }
  }, [webcamRef, onStartScan]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onStartScan(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] glass-card p-8 md:p-10 max-w-2xl mx-auto border-t-4 border-t-clay animate-in fade-in duration-300">
        <h3 className="text-2xl font-black text-text-main tracking-tight">{t('scanner.readingReceiptHeader')}</h3>
        <p className="text-sm font-medium text-text-muted mt-2 text-center max-w-md">
          {t('scanner.readingReceiptDesc')}
        </p>

        {/* Informative text for background multitasking */}
        <p className="text-sm font-semibold text-clay/90 mt-3 text-center animate-pulse">
          {language === 'en' ? 'You can close this page safely.' : 'Anda dapat menutup halaman ini.'}
        </p>
        <p className="text-xs text-text-muted mt-1 text-center font-medium">
          {language === 'en' ? 'You will be notified when the scan is complete.' : 'Anda akan ternotifikasi kalau scan selesai.'}
        </p>

        <div className="relative w-64 h-80 rounded-2xl overflow-hidden border-2 border-sand shadow-inner bg-black/5 dark:bg-black/20 my-6 flex items-center justify-center group">
          {scanImage ? (
            <img 
              src={scanImage} 
              className="w-full h-full object-cover opacity-75 dark:opacity-60 transition-opacity" 
              alt="Scanning receipt" 
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-text-muted p-4">
              <Loader2 className="h-10 w-10 text-clay animate-spin mb-2" />
              <span className="text-xs font-semibold uppercase tracking-wider">Loading Preview</span>
            </div>
          )}

          <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-nature-green to-transparent shadow-[0_0_12px_#22da47] animate-scan-line"></div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute border border-nature-green/40 bg-nature-green/5 rounded animate-pulse" style={{
              top: '20%', left: '15%', width: '40%', height: '8%',
              animationDelay: '0.2s', animationDuration: '1.5s'
            }}></div>
            <div className="absolute border border-nature-green/40 bg-nature-green/5 rounded animate-pulse" style={{
              top: '35%', left: '10%', width: '70%', height: '7%',
              animationDelay: '0.7s', animationDuration: '1.8s'
            }}></div>
            <div className="absolute border border-nature-green/40 bg-nature-green/5 rounded animate-pulse" style={{
              top: '55%', left: '20%', width: '55%', height: '8%',
              animationDelay: '1.2s', animationDuration: '1.4s'
            }}></div>
            <div className="absolute border border-nature-green/40 bg-nature-green/5 rounded animate-pulse" style={{
              top: '72%', left: '15%', width: '30%', height: '6%',
              animationDelay: '0.4s', animationDuration: '2s'
            }}></div>
          </div>

          <div className="absolute bottom-4 inset-x-4 backdrop-blur-md bg-white/70 dark:bg-black/60 py-2.5 px-4 rounded-xl border border-white/20 dark:border-white/10 text-center shadow-lg">
            <span className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin text-clay" />
              OCR ACTIVE
            </span>
          </div>
        </div>

        <div className="w-full max-w-md mt-2">
          <div className="flex justify-between items-center text-xs font-bold text-text-muted mb-1.5">
            <span className="uppercase tracking-wider text-clay">{scanStatusText}</span>
            <span className="bg-clay/10 text-clay px-2 py-0.5 rounded-full">{scanProgress}%</span>
          </div>
          <div className="w-full bg-sand dark:bg-sand/20 rounded-full h-3 overflow-hidden shadow-inner p-[1px]">
            <div 
              className="bg-gradient-to-r from-clay via-nature-green to-nature-green h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_#22da47]" 
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-xs text-text-muted italic mt-6 text-center max-w-xs">
          Tip: Gunakan pencahayaan yang cukup agar AI dapat mengenali teks struk belanjaan Anda secara presisi.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden max-w-2xl mx-auto shadow-sm pb-10 animate-in fade-in duration-300">
      <div className="p-8 pb-6 border-b border-sand/50 bg-gradient-to-b from-white to-transparent dark:from-white/5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-clay/10 text-clay rounded-full text-xs font-bold mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-clay animate-pulse"></span>
          AI Powered
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">{t('scanner.title')}</h2>
        <p className="text-sm font-medium text-text-muted mt-2">{t('scanner.subtitle')}</p>
      </div>

      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[350px]">
        {useCamera ? (
          <div className="w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="relative w-full max-w-sm rounded-[2rem] overflow-hidden bg-black shadow-2xl aspect-[3/4] border-4 border-bg-card">
              {/* @ts-ignore */}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="absolute inset-0 w-full h-full object-cover scale-105"
              />
              
              {/* Camera UI Overlay */}
              <div className="absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/50 to-transparent flex justify-between items-center text-white">
                <span className="text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">{t('scanner.camera')}</span>
              </div>
              
              {/* Scanning brackets */}
              <div className="absolute inset-8 border-2 border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-nature-green rounded-tl-xl"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-nature-green rounded-tr-xl"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-nature-green rounded-bl-xl"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-nature-green rounded-br-xl"></div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-8">
                <button 
                  onClick={capture} 
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center p-1 hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-full h-full rounded-full border-4 border-black/80 flex flex-col items-center justify-center">
                    <div className="w-full h-full bg-clay rounded-full shadow-inner"></div>
                  </div>
                </button>
              </div>
            </div>
            
            <button 
              className="mt-6 px-6 py-3 rounded-xl border-2 border-sand text-text-muted font-bold hover:bg-black/5 hover:text-text-main transition-all"
              onClick={() => setUseCamera(false)}
            >
              {t('scanner.cancelBack')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
            <button 
              onClick={() => setUseCamera(true)}
              className="flex flex-col items-start justify-between p-6 md:p-8 rounded-[2rem] bg-bg-card border-2 border-sand hover:border-nature-green hover:shadow-xl hover:shadow-nature-green/10 transition-all group min-h-[12rem] md:min-h-[14rem] relative overflow-hidden text-left"
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-nature-green/10 rounded-full blur-3xl group-hover:bg-nature-green/20 transition-all pointer-events-none"></div>
              <div className="h-14 w-14 bg-white dark:bg-bg-base shadow-sm rounded-2xl flex items-center justify-center border border-sand group-hover:scale-110 transition-transform relative z-10">
                <Camera className="h-7 w-7 text-nature-green" />
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="font-extrabold text-text-main text-lg md:text-xl mb-1 md:mb-2">{t('scanner.useCamera')}</h3>
                <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-2 md:line-clamp-3">{t('scanner.useCameraDesc')}</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-start justify-between p-6 md:p-8 rounded-[2rem] bg-bg-card border-2 border-sand hover:border-clay hover:shadow-xl hover:shadow-clay/10 transition-all group min-h-[12rem] md:min-h-[14rem] relative overflow-hidden text-left"
            >
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-clay/10 rounded-full blur-3xl group-hover:bg-clay/20 transition-all pointer-events-none"></div>
              <div className="h-14 w-14 bg-white dark:bg-bg-base shadow-sm rounded-2xl flex items-center justify-center border border-sand group-hover:scale-110 transition-transform relative z-10">
                <ImageIcon className="h-7 w-7 text-clay" />
              </div>
              <div className="mt-6 relative z-10">
                <h3 className="font-extrabold text-text-main text-lg md:text-xl mb-1 md:mb-2">{t('scanner.selectGallery')}</h3>
                <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-2 md:line-clamp-3">{t('scanner.selectGalleryDesc')}</p>
              </div>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload}
            />
          </div>
        )}
      </div>
    </div>
  );
}
