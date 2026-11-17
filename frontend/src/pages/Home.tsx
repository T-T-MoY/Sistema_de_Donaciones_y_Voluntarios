/**
 * ============================================================================
 * ARCHIVO: Home.tsx
 * PÁGINA: Página Principal (Landing Page)
 * RUTA: /
 * NOTA: El chrome (LandingNavbar + Footer) lo provee PublicLayout.
 *       Esta página solo compone las secciones de la landing.
 * ============================================================================
 */

import { Hero } from '../components/landing/Hero';
import { HowItWorks } from '../components/landing/HowItWorks';
import { ServicesShowcase } from '../components/landing/ServicesShowcase';

export default function Home() {
  return (
    <>
      {/* 1. Sección Hero con métricas y bienvenida */}
      <Hero />

      {/* 2. ¿Cómo funciona? */}
      <HowItWorks />

      {/* 3. Comodidades y Servicios */}
      <ServicesShowcase />
    </>
  );
}
