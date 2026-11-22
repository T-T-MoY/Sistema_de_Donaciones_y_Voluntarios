import { Outlet } from 'react-router-dom';
import LandingNavbar from './LandingNavbar';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div className="relative">
      <LandingNavbar />
      <main className="min-h-dvh">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
