'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MobileView } from '@/components/responsive/MobileView';
import { WebView } from '@/components/responsive/WebView';

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Web Footer */}
        <WebView>
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative w-12 h-12">
                    <Image
                      src="/images/logolider.jpg"
                      alt="Hospedaje Líder Logo"
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <span className="text-2xl font-heading font-bold">
                    Hospedaje <span className="text-orange-500">Líder</span>
                  </span>
                </div>
                <p className="text-gray-300 mb-6 max-w-md font-body text-lg leading-relaxed">
                  Tu destino ideal para una estadía cómoda y memorable en La Paz. 
                  Ofrecemos habitaciones de calidad con el mejor servicio al cliente.
                </p>
                <div className="flex space-x-6">
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-xl font-heading font-bold mb-6 text-orange-500">Enlaces Rápidos</h3>
                <ul className="space-y-3">
                  <li><Link href="/" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-body hover:translate-x-2 inline-block">Inicio</Link></li>
                  <li><Link href="/habitaciones" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-body hover:translate-x-2 inline-block">Habitaciones</Link></li>
                  <li><Link href="/reservas" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-body hover:translate-x-2 inline-block">Reservas</Link></li>
                  <li><Link href="/sobre-nosotros" className="text-gray-300 hover:text-orange-500 transition-all duration-300 font-body hover:translate-x-2 inline-block">Sobre Nosotros</Link></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-heading font-bold mb-6 text-orange-500">Contáctanos</h3>
                <ul className="space-y-4 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg mt-1">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="font-body">
                      <p className="font-semibold text-white">Dirección:</p>
                      <p className="text-sm leading-relaxed">Av. Las Américas, Zona Villa Fátima #520-B<br />Entre Chulimani y San Borja<br />La Paz, Bolivia</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="font-body">
                      <p className="font-semibold text-white">Teléfono:</p>
                      <p>71294205</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="font-body">
                      <p className="font-semibold text-white">Email:</p>
                      <p>info@hospedajelider.com</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </WebView>

        {/* Mobile Footer */}
        <MobileView>
          <div className="py-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="relative w-10 h-10">
                  <Image
                    src="/images/logolider.jpg"
                    alt="Hospedaje Líder Logo"
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <span className="text-xl font-heading font-bold">
                  Hospedaje <span className="text-orange-500">Líder</span>
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-6 font-body px-4">
                Tu destino ideal para una estadía cómoda y memorable en La Paz.
              </p>
            </div>

            <div className="space-y-8 mb-8">
              <div className="text-center">
                <h3 className="text-lg font-heading font-bold mb-4 text-orange-500">Enlaces Rápidos</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/" className="text-gray-300 hover:text-orange-500 transition-colors font-body">Inicio</Link>
                  <Link href="/habitaciones" className="text-gray-300 hover:text-orange-500 transition-colors font-body">Habitaciones</Link>
                  <Link href="/sobre-nosotros" className="text-gray-300 hover:text-orange-500 transition-colors font-body">Sobre Nosotros</Link>
                </div>
              </div>
              
              <div className="text-center">
                <h3 className="text-lg font-heading font-bold mb-4 text-orange-500">Contáctanos</h3>
                <div className="space-y-3 text-sm text-gray-300 font-body">
                  <div>
                    <p className="font-semibold text-white mb-1">Dirección:</p>
                    <p>Av. Las Américas, Zona Villa Fátima #520-B</p>
                    <p>Entre Chulimani y San Borja, La Paz</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Teléfono:</p>
                    <p>71294205</p>
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">Email:</p>
                    <p>info@hospedajelider.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-orange-500 transition-all duration-300 transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
        </MobileView>

        {/* Copyright */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-center text-gray-400 text-sm font-body mb-2 md:mb-0">
              © 2025 Hospedaje Líder. Todos los derechos reservados.
            </p>
         
          </div>
        </div>
      </div>
    </footer>
  );
};