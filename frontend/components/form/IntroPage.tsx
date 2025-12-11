"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface IntroPageProps {
  onStart: () => void;
}

export default function IntroPage({ onStart }: IntroPageProps) {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-6">

      <Button
        onClick={onStart}
        size="lg"
        className="flex items-center gap-2"
      >
        Start Assessment
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
