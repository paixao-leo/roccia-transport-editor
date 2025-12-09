import { Button } from "@/components/ui/button";
import { Construction } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  buttonText: string;
}

export function PlaceholderSection({ title, buttonText }: PlaceholderSectionProps) {
  return (
    <section className="animate-slide-in">
      <div className="section-header mb-8">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <Button className="gradient-primary shadow-glow shadow-glow-hover">
          {buttonText}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Construction className="w-16 h-16 mb-4 text-primary" />
        <p className="text-lg">Seção em desenvolvimento...</p>
        <p className="text-sm mt-2">Em breve novas funcionalidades!</p>
      </div>
    </section>
  );
}
