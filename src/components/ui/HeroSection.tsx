'use client';

import { MobileView } from '@/components/responsive/MobileView';
import { WebView } from '@/components/responsive/WebView';

export const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      
      {/* Web Hero */}
      <WebView>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Encuentra tu <span className="text-orange-400">estadía perfecta</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto font-body">
              Descubre habitaciones cómodas y modernas con el mejor servicio. 
              Tu comodidad es nuestra prioridad.
            </p>
            

          </div>
        </div>
      </WebView>

      {/* Mobile Hero */}
      <MobileView>
        <div className="px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold mb-4">
              Encuentra tu <span className="text-orange-400">estadía perfecta</span>
            </h1>
            <p className="text-lg mb-8 text-blue-100 font-body">
              Habitaciones cómodas con el mejor servicio
            </p>
            

          </div>
        </div>
      </MobileView>

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>
    </section>
  );
};