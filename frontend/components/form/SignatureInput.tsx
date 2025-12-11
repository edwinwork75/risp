"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

interface SignatureInputProps {
    value?: string;
    onChange: (value: string) => void;
}

export default function SignatureInput({ value, onChange }: SignatureInputProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(!value);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && value) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = new Image();
                img.onload = () => {
                    ctx.drawImage(img, 0, 0);
                    setIsEmpty(false);
                };
                img.src = value;
            }
        }
    }, []); // Only load initial value once

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        setIsDrawing(true);
        setIsEmpty(false);

        // Get correct coordinates
        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#000";
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = 'touches' in e ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            if (canvas) {
                onChange(canvas.toDataURL());
            }
        }
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            onChange("");
            setIsEmpty(true);
        }
    };

    return (
        <div className="border rounded-md p-2 bg-white relative">
            <canvas
                ref={canvasRef}
                width={300}
                height={150}
                className="border border-dashed border-gray-300 w-full touch-none cursor-crosshair bg-[#fdfdfd]"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="flex justify-end mt-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clear}
                    className="text-gray-500 hover:text-red-500"
                >
                    <Eraser className="w-4 h-4 mr-1" /> Clear
                </Button>
            </div>
            {isEmpty && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                    Sign here
                </div>
            )}
        </div>
    );
}
