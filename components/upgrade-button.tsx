"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UpgradeButtonProps {
  plan: "plus" | "pro";
  children?: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function UpgradeButton({
  plan,
  children = "Actualizar Plan",
  variant = "default",
  size = "default",
  className,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error("Error creating checkout session:", data.error);
        alert("Error al iniciar pago. Por favor intenta nuevamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error upgrading:", error);
      alert("Error al iniciar pago. Por favor intenta nuevamente.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleUpgrade}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Procesando...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
