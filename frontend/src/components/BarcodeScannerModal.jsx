import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const html5QrCode = new Html5Qrcode('barcode-reader-box');
    scannerRef.current = html5QrCode;

    Html5Qrcode.getCameras()
      .then((cameras) => {
        if (!cameras || cameras.length === 0) {
          setError('No camera detected on this system.');
          return;
        }

        const cameraId = cameras[cameras.length - 1].id;
        html5QrCode
          .start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 180 },
            },
            (decodedText) => {
              html5QrCode.stop().then(() => {
                onScanSuccess(decodedText);
                onClose();
              }).catch(() => {
                onScanSuccess(decodedText);
                onClose();
              });
            },
            () => {}
          )
          .then(() => setIsScanning(true))
          .catch((err) => {
            setError('Camera permission denied or camera in use: ' + err);
          });
      })
      .catch((err) => {
        setError('Error accessing camera hardware: ' + err);
      });

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Barcode & QR Code Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border-2 border-dashed border-primary-300 bg-slate-950 flex flex-col items-center justify-center min-h-[260px] relative">
            <div id="barcode-reader-box" className="w-full"></div>
            {!isScanning && !error && (
              <span className="text-xs text-slate-400">Requesting camera permissions...</span>
            )}
          </div>

          <p className="text-center text-xs text-slate-500">
            Hold product barcode or QR code within the viewfinder. The item will be identified automatically.
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
            >
              Close Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
