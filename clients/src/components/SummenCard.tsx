import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface Summen {
  einnahmen: number;
  ausgaben: number;
  saldo: number;
  kategorien: {
    [key: string]: number;
  };
}

interface SummenCardProps {
  summen: Summen;
}

export default function SummenCard({ summen }: SummenCardProps) {
  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return "text-green-600";
    if (saldo < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getSaldoIcon = (saldo: number) => {
    if (saldo > 0) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (saldo < 0) return <TrendingDown className="h-5 w-5 text-red-600" />;
    return <Wallet className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Einnahmen */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Einnahmen</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {summen.einnahmen.toFixed(2)} €
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Beiträge, Einnahmen, Vorschüsse
          </p>
        </CardContent>
      </Card>

      {/* Ausgaben */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ausgaben</CardTitle>
          <TrendingDown className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {summen.ausgaben.toFixed(2)} €
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Alle Ausgabenposten
          </p>
        </CardContent>
      </Card>

      {/* Saldo */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          {getSaldoIcon(summen.saldo)}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getSaldoColor(summen.saldo)}`}>
            {summen.saldo > 0 ? "+" : ""}{summen.saldo.toFixed(2)} €
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {summen.saldo > 0 && "Überschuss - bitte überweisen"}
            {summen.saldo < 0 && "Defizit - wird erstattet"}
            {summen.saldo === 0 && "Ausgeglichen"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
