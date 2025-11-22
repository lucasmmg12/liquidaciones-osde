import { Instagram, Globe, MessageCircle, Linkedin, Sparkles } from 'lucide-react';
import Image from 'next/image';

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
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center relative z-10">
                  <span className="text-white font-bold text-xl">O</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                  OSDE Liquidaciones
                </h3>
                <p className="text-green-300 text-sm italic flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                  Sistema de gestión profesional
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Sistema de gestión de liquidaciones médicas y nomencladores para instrumentadores. Desarrollado con tecnología de vanguardia.
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
              Plataforma Exclusiva
            </h4>
            <p className="text-gray-300 text-sm">
              Esta plataforma es única y exclusivamente para <span className="font-bold text-green-300">OSDE</span> y los servicios contratados. Sistema desarrollado por <span className="font-bold text-green-300">Grow Labs</span>.
            </p>
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

