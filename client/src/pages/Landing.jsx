import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Industries from "../components/landing/Industries";
import Footer from "../components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <Industries />
      <Footer />
    </div>
  );
};

export default Landing;