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
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Procedimientos</p>
              <p className="text-3xl font-bold text-slate-900">{totalProcedimientos}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Liquidado</p>
              <p className="text-3xl font-bold text-slate-900">{formatARS(totalLiquidado)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Códigos Faltantes</p>
              <p className="text-3xl font-bold text-slate-900">{codigosFaltantes}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
