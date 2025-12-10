"use client";

import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface FormHeaderProps {
  showProgress?: boolean;
  progress?: number;
}

export default function FormHeader({ showProgress = true, progress = 0 }: FormHeaderProps) {
  const router = useRouter();
  
  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => router.push("/")}
        >
<h1 className="text-3xl font-bold tracking-tight text-primary mb-6">
  RISP
</h1>
        </div>
      </div>
      {showProgress && <Progress value={progress} className="h-1" />}
    </header>
  );
}