import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/ui/HeroSection';
import { SearchFilters } from '@/components/ui/SearchFilters';
import { FeaturedRooms } from '@/components/ui/FeaturedRooms';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <SearchFilters />
        <FeaturedRooms />
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                ¿Por qué elegir Hospedaje <span className="text-orange-500">Líder</span>?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto font-body">
                Ofrecemos la mejor experiencia de hospedaje con servicios de calidad
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">Calidad Garantizada</h3>
                <p className="text-gray-600 font-body">Habitaciones limpias y cómodas con todos los servicios necesarios</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">Atención 24/7</h3>
                <p className="text-gray-600 font-body">Servicio al cliente disponible las 24 horas del día</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">Ubicación Privilegiada</h3>
                <p className="text-gray-600 font-body">En el corazón de la ciudad, cerca de todo lo que necesitas</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              ¿Listo para tu próxima aventura?
            </h2>
            <p className="text-xl mb-8 text-blue-100 font-body">
              Reserva ahora y disfruta de una experiencia inolvidable
            </p>
            <a href="/reservar" className="inline-block bg-white text-orange-600 px-8 py-3 rounded-full font-heading font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Reservar Ahora
            </a>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
