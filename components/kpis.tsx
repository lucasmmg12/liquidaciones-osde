import { Card, CardContent } from '@/components/ui/card';
import { FileText, DollarSign, AlertCircle } from 'lucide-react';
import { formatARS } from '@/lib/formatters';

interface KpisProps {
  totalProcedimientos: number;
  totalLiquidado: number;
  codigosFaltantes: number;
}

export function Kpis({ totalProcedimientos, totalLiquidado, codigosFaltantes }: KpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="glass-effect-dark border-blue-500/20 glow-blue">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Procedimientos</p>
              <p className="text-3xl font-bold text-white">{totalProcedimientos}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect-dark border-green-500/20 glow-green">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Liquidado</p>
              <p className="text-3xl font-bold text-white">{formatARS(totalLiquidado)}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-effect-dark border-amber-500/20 glow-amber">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Códigos Faltantes</p>
              <p className="text-3xl font-bold text-white">{codigosFaltantes}</p>
            </div>
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
