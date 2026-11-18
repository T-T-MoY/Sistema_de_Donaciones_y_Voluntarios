import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <>
      <LandingNavbar />
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}