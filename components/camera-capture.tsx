"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCw, Check } from "lucide-react";

interface CameraCaptureProps {
  onCapture: (imageData: string, fileName: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      setError(null);

      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Unable to access camera. Please ensure camera permissions are granted."
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      const fileName = `camera-capture-${Date.now()}.jpg`;
      onCapture(capturedImage, fileName);
      stopCamera();
      onClose();
    }
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCapturedImage(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleClose}
            className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close camera"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white font-medium">Capture Event</h2>
          <button
            onClick={switchCamera}
            className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Switch camera"
            disabled={!!capturedImage}
          >
            <RotateCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Camera View or Captured Image */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center p-8 space-y-4">
            <div className="text-red-400 text-lg">{error}</div>
            <button
              onClick={handleClose}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
          />
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-8">
        {capturedImage ? (
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={retakePhoto}
              className="flex flex-col items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center hover:bg-white/20 transition-colors">
                <RotateCw className="w-8 h-8" />
              </div>
              <span className="text-sm">Retake</span>
            </button>
            <button
              onClick={confirmPhoto}
              className="flex flex-col items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition-colors">
                <Check className="w-8 h-8" />
              </div>
              <span className="text-sm">Use Photo</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/20 transition-colors flex items-center justify-center"
              aria-label="Capture photo"
            >
              <div className="w-16 h-16 rounded-full bg-white"></div>
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      {!capturedImage && !error && (
        <div className="absolute top-20 left-0 right-0 text-center px-4">
          <div className="inline-block bg-black/50 text-white px-4 py-2 rounded-lg text-sm">
            Position the calendar or event in the frame and tap capture
          </div>
        </div>
      )}
    </div>
  );
}
