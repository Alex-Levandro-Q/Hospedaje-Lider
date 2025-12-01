'use client';

import { useState } from 'react';
import { FiPhone, FiMapPin, FiMail, FiClock, FiMessageCircle } from 'react-icons/fi';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola, me gustaría obtener información sobre sus servicios de hospedaje.');
    const whatsappUrl = `https://wa.me/59171294205?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Contáctanos
          </h1>
          <p className="text-xl font-body text-orange-100 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con nosotros para cualquier consulta o reserva
          </p>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8">
              Información de Contacto
            </h2>
            
            <div className="space-y-6">
              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
                  <FiPhone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
                    Teléfono
                  </h3>
                  <p className="text-gray-700 font-body">71294205</p>
                  <p className="text-sm text-gray-500">Disponible las 24 horas</p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
                  <FiMapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
                    Dirección
                  </h3>
                  <p className="text-gray-700 font-body">
                    [Dirección del hospedaje]<br />
                    Ciudad, País
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
                  <FiMail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-700 font-body">info@hospedajelider.com</p>
                  <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-4">
                <div className="bg-orange-500 rounded-full p-3 flex-shrink-0">
                  <FiClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
                    Horarios de Atención
                  </h3>
                  <div className="text-gray-700 font-body">
                    <p>Lunes - Domingo: 24 horas</p>
                    <p>Recepción: 6:00 AM - 10:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Button */}
            <div className="mt-8">
              <button
                onClick={handleWhatsApp}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-3 transition-colors font-heading font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <FiMessageCircle className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Respuesta inmediata por WhatsApp
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
              Envíanos un Mensaje
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({...formData, mensaje: e.target.value})}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 font-body"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-heading font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-heading font-bold text-gray-900 mb-8 text-center">
            Nuestra Ubicación
          </h2>
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <FiMapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-body">
                  Mapa de ubicación<br />
                  <span className="text-sm">(Integrar con Google Maps)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}