import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import DataBelt from "@/components/landing/DataBelt";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <Hero />
      <DataBelt />
      <HowItWorks />
      <Features />
      <Footer />
    </main>
  );
}
