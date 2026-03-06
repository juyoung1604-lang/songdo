import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import DetailsSection from "@/components/DetailsSection";
import BuskerSection from "@/components/BuskerSection";
import SellerSection from "@/components/SellerSection";
import GallerySection from "@/components/GallerySection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import HomepagePopupLayer from "@/components/HomepagePopupLayer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HomepagePopupLayer />
      <HeroSection />
      <AboutSection />
      <DetailsSection />
      <BuskerSection />
      <SellerSection />
      <GallerySection />
      <FaqSection />
      <ContactSection />
      <Footer />
      <ScrollToTopButton />
    </main>
  );
}
