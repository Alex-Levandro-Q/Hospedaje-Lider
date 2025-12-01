import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function SobreNosotros() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Sobre Nosotros
          </h1>
          <p className="text-xl font-body text-orange-100 max-w-3xl mx-auto">
            Conoce nuestra historia, misión y visión que nos impulsa a brindar la mejor experiencia de hospedaje
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-6">
              Hospedaje Líder
            </h2>
            <p className="text-lg font-body text-gray-700 mb-6 leading-relaxed">
              Somos un hospedaje comprometido con brindar experiencias únicas a nuestros huéspedes. 
              Ubicados estratégicamente, ofrecemos comodidad, calidad y calidez humana en cada uno de 
              nuestros servicios.
            </p>
            <p className="text-lg font-body text-gray-700 leading-relaxed">
              Nuestro equipo trabaja día a día para superar las expectativas de nuestros clientes, 
              creando un ambiente donde cada visitante se sienta como en casa.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
            <Image
              src="/images/logolider.jpg"
              alt="Hospedaje Líder"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-500 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900">Nuestra Misión</h3>
            </div>
            <p className="text-gray-700 font-body leading-relaxed">
              Proporcionar a nuestros huéspedes una experiencia única de alojamiento, donde la comodidad, 
              la calidad del servicio y la calidez humana se combinen para crear un entorno donde cada 
              visitante se sienta como en casa. Nos esforzamos por ofrecer servicios excepcionales que 
              superen las expectativas de nuestros clientes, mientras fomentamos un ambiente de hospitalidad 
              genuina y de excelencia operativa.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="bg-orange-500 rounded-full p-3 mr-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900">Nuestra Visión</h3>
            </div>
            <p className="text-gray-700 font-body leading-relaxed">
              Convertirnos en una referencia en la industria de la hospitalidad dentro de la región, 
              distinguiéndonos por nuestra calidad de servicio, innovación constante y compromiso con 
              el bienestar de los clientes. A largo plazo, buscamos expandir nuestra presencia con nuevas 
              ubicaciones y continuar mejorando nuestras instalaciones y servicios para satisfacer las 
              cambiantes demandas del mercado turístico.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-8 text-center">
            Nuestros Valores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-heading font-semibold text-gray-900 mb-2">Calidez Humana</h4>
              <p className="text-gray-600 font-body">
                Tratamos a cada huésped con respeto, amabilidad y atención personalizada
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-heading font-semibold text-gray-900 mb-2">Excelencia</h4>
              <p className="text-gray-600 font-body">
                Nos comprometemos con la calidad en cada detalle de nuestros servicios
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-heading font-semibold text-gray-900 mb-2">Innovación</h4>
              <p className="text-gray-600 font-body">
                Mejoramos constantemente para adaptarnos a las necesidades del mercado
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}