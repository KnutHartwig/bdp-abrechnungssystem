import { Badge } from "./ui/badge";
import { CheckCircle, Clock, Send, Circle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  type?: "aktion" | "abrechnung";
}

export default function StatusBadge({ status, type = "aktion" }: StatusBadgeProps) {
  if (type === "aktion") {
    const aktionConfig = {
      AKTIV: {
        label: "Aktiv",
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      INAKTIV: {
        label: "Inaktiv",
        variant: "outline" as const,
        icon: <Circle className="h-3 w-3 mr-1" />
      },
      ABGESCHLOSSEN: {
        label: "Abgeschlossen",
        variant: "secondary" as const,
        icon: <XCircle className="h-3 w-3 mr-1" />
      }
    };

    const config = aktionConfig[status as keyof typeof aktionConfig] || {
      label: status,
      variant: "outline" as const,
      icon: <Circle className="h-3 w-3 mr-1" />
    };

    return (
      <Badge variant={config.variant} className="flex items-center w-fit">
        {config.icon}
        {config.label}
      </Badge>
    );
  }

  // Abrechnung Status
  const abrechnungConfig = {
    ENTWURF: {
      label: "Entwurf",
      variant: "outline" as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
      className: "border-gray-400 text-gray-700"
    },
    EINGEREICHT: {
      label: "Eingereicht",
      variant: "default" as const,
      icon: <Send className="h-3 w-3 mr-1" />,
      className: "bg-blue-600"
    },
    VERSENDET: {
      label: "Versendet",
      variant: "secondary" as const,
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      className: "bg-green-600 text-white"
    }
  };

  const config = abrechnungConfig[status as keyof typeof abrechnungConfig] || {
    label: status,
    variant: "outline" as const,
    icon: <Circle className="h-3 w-3 mr-1" />,
    className: ""
  };

  return (
    <Badge variant={config.variant} className={`flex items-center w-fit ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
