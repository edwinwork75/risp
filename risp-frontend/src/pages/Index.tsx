import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Edit } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-background transition-colors duration-300">
      <Button 
        onClick={() => navigate("/form-builder")} 
        size="lg" 
        className="gap-2"
      >
        <Edit className="h-4 w-4" />
        Create a Form
      </Button>
    </div>
  );
};

export default Index;
