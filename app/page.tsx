'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Users, Settings, FileSpreadsheet } from 'lucide-react';

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Sistema de Liquidaciones OSDE
          </h1>
          <p className="text-lg text-slate-600">
            Gestión de liquidaciones y nomencladores para instrumentadores
          </p>
        </div>

        {/* Main sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Liquidaciones */}
          <Link href="/instrumentadores">
            <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <Calculator className="h-12 w-12 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Liquidaciones
                  </h2>
                  <p className="text-slate-600">
                    Procesar liquidaciones mensuales de procedimientos quirúrgicos
                  </p>
                </div>
                <Button className="mt-4 w-full" size="lg">
                  Ir a Liquidaciones
                </Button>
              </div>
            </Card>
          </Link>

          {/* Gestión de Instrumentadores */}
          <Link href="/admin/instrumentadores">
            <Card className="p-8 hover:shadow-lg transition-all cursor-pointer group h-full">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <Users className="h-12 w-12 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Instrumentadores
                  </h2>
                  <p className="text-slate-600">
                    Gestionar base de datos de instrumentadores del equipo
                  </p>
                </div>
                <Button className="mt-4 w-full" size="lg" variant="outline">
                  Gestionar Instrumentadores
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        {/* Admin section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nomenclador */}
          <Link href="/admin/nomenclador">
            <Card className="p-6 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Settings className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nomenclador
                  </h3>
                  <p className="text-sm text-slate-600">
                    Configurar códigos y valores
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Placeholder for future modules */}
          <Card className="p-6 bg-slate-50 border-dashed">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-200 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-500">
                  Próximamente
                </h3>
                <p className="text-sm text-slate-400">
                  Más funcionalidades en camino
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            Sistema de gestión de liquidaciones médicas • OSDE
          </p>
        </div>
      </div>
    </div>
  );
}
