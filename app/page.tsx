import Navigation from '@/components/landing/Navigation';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import StellarBenefitsSection from '@/components/landing/StellarBenefitsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WaitlistSection from '@/components/landing/WaitlistSection';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navigation />
      <HeroSection />
      <ProblemSection />
      <StellarBenefitsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <WaitlistSection />
      <Footer />
    </div>
  );
}