'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calculator, Users, Settings, FileSpreadsheet, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          {/* Logo y título */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6 animate-float">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-2xl opacity-50 rounded-full"></div>
                <img
                  src="/logogrow.png"
                  alt="Grow Labs"
                  className="h-24 w-24 object-contain relative z-10 drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.6))'
                  }}
                />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Sistema de Liquidaciones Médicas
              </span>
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-3">
              <Users className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400 font-semibold">Módulo de Instrumentadores</span>
            </div>
            <p className="text-gray-300 text-xl flex items-center justify-center gap-2 mt-3">
              <Sparkles className="h-5 w-5 text-green-400" />
              Todas las Obras Sociales en una sola plataforma
            </p>
          </div>

          {/* Main sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
            {/* Liquidaciones */}
            <Link href="/instrumentadores" className="group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl opacity-30 blur-lg animate-border-glow"></div>
                <Card className="relative glass-effect border-blue-500/30 glow-blue p-8 hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] h-full">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Calculator className="h-16 w-16 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Liquidaciones
                      </h2>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        Procesar liquidaciones mensuales de procedimientos quirúrgicos con precisión y eficiencia
                      </p>
                    </div>
                    <Button 
                      className="mt-4 w-full py-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 relative overflow-hidden group/btn border-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Ir a Liquidaciones
                      </span>
                    </Button>
                  </div>
                </Card>
              </div>
            </Link>

            {/* Gestión de Instrumentadores */}
            <Link href="/admin/instrumentadores" className="group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-30 blur-lg animate-border-glow"></div>
                <Card className="relative glass-effect border-green-500/30 glow-green p-8 hover:shadow-2xl transition-all duration-300 group-hover:scale-[1.02] h-full">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-16 w-16 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Instrumentadores
                      </h2>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        Gestionar base de datos completa del equipo de instrumentadores médicos
                      </p>
                    </div>
                    <Button 
                      className="mt-4 w-full py-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg transition-all duration-300 hover:shadow-xl hover:shadow-green-500/50 hover:scale-105 relative overflow-hidden group/btn border-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Gestionar Equipo
                      </span>
                    </Button>
                  </div>
                </Card>
              </div>
            </Link>
          </div>

          {/* Admin section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Nomenclador */}
            <Link href="/admin/nomenclador" className="group">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-20 blur group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative glass-effect border-purple-500/30 p-6 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group-hover:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <Settings className="h-10 w-10 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        Nomenclador
                      </h3>
                      <p className="text-gray-300 text-sm">
                        Configurar códigos y valores del sistema
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </Link>

            {/* Placeholder for future modules */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl opacity-10 blur"></div>
              <Card className="relative glass-effect border-gray-500/20 p-6 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-gray-500/10 to-slate-500/10 rounded-xl">
                    <FileSpreadsheet className="h-10 w-10 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-400 mb-1">
                      Próximamente
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Más funcionalidades en desarrollo
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Decoración inferior */}
          <div className="mt-16 flex justify-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 rounded-full bg-green-300 animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
