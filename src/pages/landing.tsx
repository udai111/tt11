import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LineChart, Shield, Trophy } from "lucide-react";

export default function LandingPage() {
  const [_, setLocation] = useLocation();

  const features = [
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Real-Time Trading",
      description: "Experience live market conditions with real-time data"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Risk-Free Learning",
      description: "Practice with ₹10,00,000 virtual currency"
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Trading Competition",
      description: "Compete with other traders"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <img 
            src="/assets/logo.webp" 
            alt="TRG Logo" 
            className="mx-auto mb-2 h-20 w-auto"
          />
          <p className="text-xs text-muted-foreground/60 mb-6">
            Created by TRG for Gangwar's the market
          </p>
          <h1 className="text-4xl font-bold mb-4">
            Virtual Trading Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Master trading with our market simulation platform
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/login")}
          >
            Start Trading Now
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg bg-card border"
            >
              <div className="p-2 rounded-md bg-primary/10 w-fit mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}