'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Code, Bug, Sparkles, FileText, Palette, Calculator, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ActualizacionesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-green-500/20 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-300 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 rounded-full"></div>
                <Image
                  src="/logogrow.png"
                  alt="Grow Labs"
                  width={40}
                  height={40}
                  className="relative z-10"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Grow Labs
                </h1>
                <p className="text-xs text-gray-400">Actualizaciones del Sistema</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
            <Sparkles className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400 font-medium">Versión 1.5.0</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Actualizaciones del Sistema
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Registro completo de mejoras, correcciones y nuevas funcionalidades del módulo de instrumentadores
          </p>
          
          {/* Fecha y Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="h-5 w-5 text-green-400" />
              <span>22 de Noviembre de 2025 - 18:17 hs</span>
            </div>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <div className="flex gap-4">
              <Badge variant="outline" className="border-green-500/50 text-green-400">
                8 Archivos modificados
              </Badge>
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                3 Bugs resueltos
              </Badge>
              <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                11 Mejoras
              </Badge>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="glass-effect border-green-500/30 glow-green">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-500/20">
                  <Code className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-gray-400">Archivos modificados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-blue-500/30 glow-blue">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Bug className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">3</p>
                  <p className="text-sm text-gray-400">Bugs corregidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">11</p>
                  <p className="text-sm text-gray-400">Nuevas mejoras</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-yellow-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-500/20">
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-sm text-gray-400">Documentos técnicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secciones de Actualizaciones */}
        <div className="space-y-8">
          {/* Mejoras Visuales */}
          <Card className="glass-effect border-green-500/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Palette className="h-6 w-6 text-green-400" />
                </div>
                <CardTitle className="text-2xl text-white">Mejoras Visuales y Branding</CardTitle>
              </div>
              <CardDescription>Actualización completa de la identidad visual del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Favicon Corporativo 🌱</h4>
                    <p className="text-sm text-gray-400">
                      Nuevo favicon con emoji de planta para identificación visual en pestañas del navegador
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Fondo Corporativo Global</h4>
                    <p className="text-sm text-gray-400">
                      Imagen fondogrow.png aplicada en todas las páginas con efecto parallax y overlay profesional
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">UX/UI Edición Inline Mejorada</h4>
                    <p className="text-sm text-gray-400">
                      Resuelto problema de texto invisible (blanco sobre blanco). Ahora con fondo gris oscuro, bordes verdes y feedback visual claro
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Tema Grow Labs Consistente</h4>
                    <p className="text-sm text-gray-400">
                      Paleta de colores verde corporativo aplicada en toda la interfaz: botones, bordes, headers y elementos interactivos
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mejoras en PDF */}
          <Card className="glass-effect border-blue-500/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-2xl text-white">Exportación PDF Profesional</CardTitle>
              </div>
              <CardDescription>Rediseño completo del sistema de generación de PDFs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Logo y Branding Grow Labs</h4>
                    <p className="text-sm text-gray-400">
                      Reemplazado "OSDE" por logo corporativo logogrow.png con texto verde y subtítulo profesional
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Matrículas Automáticas desde BD</h4>
                    <p className="text-sm text-gray-400">
                      Nueva función getMatriculaByNombre() que obtiene la matrícula provincial de cada instrumentador desde la base de datos
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Layout Perfectamente Centrado</h4>
                    <p className="text-sm text-gray-400">
                      Márgenes optimizados (15mm), cuadro de información balanceado (90mm) y logo ajustado (18x18mm)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Columnas Ajustadas a 180mm Exactos</h4>
                    <p className="text-sm text-gray-400">
                      <strong>Bug crítico resuelto:</strong> Columna "Cirujano" ya NO se sobrepone. Todos los anchos suman exactamente 180mm
                    </p>
                    <div className="mt-2 p-2 rounded bg-gray-800/50 text-xs font-mono text-gray-300">
                      Fecha: 23mm | Paciente: 38mm | Procedimiento: 58mm | Observ.: 15mm | Valor: 22mm | Cirujano: 24mm = 180mm ✓
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Colores Corporativos en Toda la Tabla</h4>
                    <p className="text-sm text-gray-400">
                      Headers con verde Grow Labs, filas alternadas en gris claro, bordes sutiles y nombres largos truncados automáticamente
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cálculo de Liquidaciones */}
          <Card className="glass-effect border-purple-500/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Calculator className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-2xl text-white">Cálculo de Liquidaciones</CardTitle>
              </div>
              <CardDescription>Corrección crítica en el cálculo de factores con plus horario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 mb-4">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Problema Crítico Identificado y Resuelto
                </h4>
                <p className="text-sm text-gray-300 mb-2">
                  El factor 70% (50% + 20% plus) NO se aplicaba en feriados y fines de semana
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Causa:</strong> Incompatibilidad de formatos de fecha (Excel: dd/mm/yyyy vs Sistema: YYYY-MM-DD)
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Normalización Automática de Fechas</h4>
                    <p className="text-sm text-gray-400">
                      Nueva función convertirFecha() que acepta ambos formatos: dd/mm/yyyy y YYYY-MM-DD
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Reglas de Plus Horario (20%)</h4>
                    <div className="space-y-2 mt-2">
                      <div className="text-sm text-gray-300">
                        <strong className="text-purple-400">Feriados:</strong> TODO el día (00:00 - 23:59)
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong className="text-purple-400">Sábados:</strong> Desde 13:00 hasta 23:59
                      </div>
                      <div className="text-sm text-gray-300">
                        <strong className="text-purple-400">Domingos:</strong> TODO el día (00:00 - 23:59)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <CheckCircle2 className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Cálculo Correcto del Factor</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="p-2 rounded bg-gray-800/50">
                        <span className="text-gray-400">1° Procedimiento normal:</span>{' '}
                        <span className="text-white font-semibold">100% (1.0)</span>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50">
                        <span className="text-gray-400">1° Proc con plus:</span>{' '}
                        <span className="text-green-400 font-semibold">120% (1.0 + 0.20)</span>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50">
                        <span className="text-gray-400">2° Procedimiento normal:</span>{' '}
                        <span className="text-white font-semibold">50% (0.5)</span>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50">
                        <span className="text-gray-400">2° Proc con plus:</span>{' '}
                        <span className="text-green-400 font-semibold">70% (0.5 + 0.20)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentación */}
          <Card className="glass-effect border-yellow-500/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-yellow-500/20">
                  <FileText className="h-6 w-6 text-yellow-400" />
                </div>
                <CardTitle className="text-2xl text-white">Documentación Técnica</CardTitle>
              </div>
              <CardDescription>8 documentos técnicos completos creados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'CHANGELOG_INSTRUMENTADORES.md',
                  'SOLUCION_FACTOR_70.md',
                  'REGLAS_LIQUIDACION.md',
                  'FONDO_GROW.md',
                  'MEJORAS_PDF.md',
                  'MEJORAS_PDF_MATRICULAS.md',
                  'MEJORAS_PDF_FINAL.md',
                  'MEJORAS_UX_EDICION_INLINE.md'
                ].map((doc) => (
                  <div key={doc} className="flex items-center gap-2 p-2 rounded bg-yellow-500/5 border border-yellow-500/20 text-sm">
                    <FileText className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-gray-300 font-mono text-xs">{doc}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estado del Sistema */}
        <Card className="glass-effect border-green-500/30 mt-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-green-500/20 border-2 border-green-500">
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Sistema Completamente Funcional</h3>
                  <p className="text-gray-400">Versión 1.5.0 - Producción Ready</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                  ✓ Bugs resueltos
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  ✓ UX mejorada
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  ✓ PDF perfecto
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  ✓ Documentado
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

