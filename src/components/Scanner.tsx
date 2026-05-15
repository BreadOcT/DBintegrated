import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { parseReceiptWithAI } from "../lib/ai";
import { Transaction } from "../types";

interface ScannerProps {
  onScanSuccess: (data: Partial<Transaction>) => void;
}

export function Scanner({ onScanSuccess }: ScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useCamera, setUseCamera] = useState(false);

  const processImage = async (base64Str: string, mimeType: string) => {
    setIsProcessing(true);
    try {
      // Prepare base64 string (remove data URL prefix if present)
      const base64Data = base64Str.split(",")[1] || base64Str;
      const result = await parseReceiptWithAI(base64Data, mimeType);
      
      const parsedData: Partial<Transaction> = {
        type: "expense", // Default receipts to expense
        amount: result.totalAmount || 0,
        date: result.date || new Date().toISOString().split("T")[0],
        storeName: result.storeName || "",
        description: `Belanja di ${result.storeName || "Toko"}`,
        items: result.items || [],
      };
      
      onScanSuccess(parsedData);
    } catch (error) {
      alert("Gagal memproses gambar. Pastikan gambar jelas dan merupakan struk valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        processImage(imageSrc, "image/jpeg");
      }
    }
  }, [webcamRef]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        processImage(dataUrl, file.type);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] glass-card p-10 max-w-2xl mx-auto border-t-4 border-t-clay">
        <div className="relative">
          <div className="absolute inset-0 bg-clay/20 blur-xl rounded-full animate-pulse"></div>
          <div className="relative bg-white dark:bg-bg-card p-4 rounded-full shadow-lg border border-sand">
            <Loader2 className="h-12 w-12 text-clay animate-spin" />
            <div className="absolute top-0 right-0 w-4 h-4 bg-nature-green rounded-full border-2 border-white"></div>
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-text-main mt-6">Membaca Nota...</h3>
        <p className="text-text-muted mt-2 text-center max-w-sm font-medium">Beri kami beberapa detik. AI sedang mengekstrak total harga, nama toko, dan item dari gambar Anda.</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden max-w-2xl mx-auto shadow-sm pb-10">
      <div className="p-8 pb-6 border-b border-sand/50 bg-gradient-to-b from-white to-transparent dark:from-white/5">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-clay/10 text-clay rounded-full text-xs font-bold mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-clay animate-pulse"></span>
          AI Powered
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">Scan Nota / Struk</h2>
        <p className="text-sm font-medium text-text-muted mt-2">Biarkan AI kami yang mencatat. Gunakan kamera atau pilih foto nota dari galeri Anda secara otomatis.</p>
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
                <span className="text-xs font-bold uppercase tracking-wider backdrop-blur-md bg-black/30 px-3 py-1.5 rounded-full">Kamera</span>
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
              Batalkan & Kembali
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
                <h3 className="font-extrabold text-text-main text-lg md:text-xl mb-1 md:mb-2">Gunakan Kamera</h3>
                <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-2 md:line-clamp-3">Memotret fisik nota atau struk secara langsung.</p>
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
                <h3 className="font-extrabold text-text-main text-lg md:text-xl mb-1 md:mb-2">Pilih dari Galeri</h3>
                <p className="text-xs md:text-sm text-text-muted font-medium line-clamp-2 md:line-clamp-3">Unggah tangkapan layar e-receipt atau foto struk.</p>
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
