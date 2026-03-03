import { PageLayout } from '../../components/layout/PageLayout';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { MetricsTicker } from './MetricsTicker';
import { MiniSimSection } from './MiniSimSection';
import { UseCasesSection } from './UseCasesSection';
import { TechOverview } from './TechOverview';
import { CTASection } from './CTASection';
import { Footer } from './Footer';
import '../../styles/animations.css';

export default function LandingPage() {
  return (
    <PageLayout>
      <HeroSection />
      <FeaturesSection />
      <MetricsTicker />
      <MiniSimSection />
      <UseCasesSection />
      <TechOverview />
      <CTASection />
      <Footer />
    </PageLayout>
  );
}
