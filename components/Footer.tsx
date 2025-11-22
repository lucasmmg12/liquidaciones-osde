import { Instagram, Globe, MessageCircle, Linkedin, Sparkles, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer 
      className="relative mt-12"
      style={{
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(34, 197, 94, 0.2)',
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 blur-lg opacity-50 rounded-full"></div>
                <img
                  src="/logogrow.png"
                  alt="Grow Labs Logo"
                  className="h-12 w-12 object-contain relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.5))'
                  }}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  Liquidaciones Médicas
                </h3>
                <p className="text-green-300 text-sm font-semibold flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  Módulo de Instrumentadores
                </p>
                <p className="text-gray-400 text-xs italic mt-1">
                  Todas las obras sociales
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Sistema integral de gestión de liquidaciones médicas y nomencladores para todas las obras sociales. Plataforma unificada desarrollada con tecnología de vanguardia.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/growsanjuan/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)',
                }}
                aria-label="Instagram"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Instagram size={20} className="text-white relative z-10" />
              </a>
              <a
                href="https://www.growsanjuan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)',
                }}
                aria-label="Sitio web"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Globe size={20} className="text-white relative z-10" />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=5492643229503&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)',
                }}
                aria-label="WhatsApp"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <MessageCircle size={20} className="text-white relative z-10" />
              </a>
              <a
                href="https://www.linkedin.com/in/lucas-marinero-182521308/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg group relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(16, 185, 129, 0.8) 100%)',
                }}
                aria-label="LinkedIn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <Linkedin size={20} className="text-white relative z-10" />
              </a>
            </div>
          </div>

          {/* Client Notice */}
          <div 
            className="rounded-xl p-6"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <h4 className="text-lg font-bold text-green-300 mb-2 flex items-center gap-2">
              <Sparkles size={18} className="text-green-400" />
              Plataforma Profesional
            </h4>
            <p className="text-gray-300 text-sm mb-4">
              Sistema multi-obra social que permite gestionar liquidaciones de <span className="font-bold text-green-300">OSDE, Swiss Medical, PAMI, Sancor Salud</span> y más. Solución completa desarrollada por <span className="font-bold text-green-300">Grow Labs</span>.
            </p>
            
            {/* Link a Actualizaciones */}
            <Link 
              href="/actualizaciones"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 hover:border-green-400/60 text-green-300 hover:text-green-200 transition-all duration-300 text-sm font-medium group"
            >
              <FileText size={16} className="group-hover:scale-110 transition-transform" />
              Ver Actualizaciones del Sistema
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-green-500/30 text-xs">
                v1.5.0
              </span>
            </Link>
          </div>
        </div>

        <div 
          className="mt-6 pt-6 text-center"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-gray-400 text-sm">
            © 2025 Grow Labs. Todos los derechos reservados. | Powered by Grow Labs Technology
          </p>
        </div>
      </div>
    </footer>
  );
}

