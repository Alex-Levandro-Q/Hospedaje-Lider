export default function AcercaPage() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Acerca de Hospedaje Líder
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Nuestra Historia</h2>
            <p className="text-gray-600 mb-4">
              Hospedaje Líder nació con la visión de ofrecer un servicio de hospedaje 
              de calidad en La Paz, Bolivia. Ubicados estratégicamente en la zona villa Fátima, 
              nos hemos convertido en la opción preferida para viajeros que buscan comodidad, 
              seguridad y excelente ubicación.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Nuestra Misión</h3>
              <p className="text-gray-600">
                Brindar un servicio de hospedaje excepcional que supere las expectativas 
                de nuestros huéspedes, ofreciendo comodidad, seguridad y atención personalizada.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">Nuestra Visión</h3>
              <p className="text-gray-600">
                Ser reconocidos como el hospedaje líder en La Paz, destacando por 
                nuestra calidad de servicio, instalaciones modernas y compromiso 
                con la satisfacción del cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}