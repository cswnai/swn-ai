import Nav from "@/components/sections/Nav";
import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import HowItWorks from "@/components/sections/HowItWorks";
import Founder from "@/components/sections/Founder";
import Results from "@/components/sections/Results";
import FAQ from "@/components/sections/FAQ";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Services />
      <HowItWorks />
      <Founder />
      <Results />
      <FAQ />
      <ContactForm />
      <Footer />
    </main>
  );
}
