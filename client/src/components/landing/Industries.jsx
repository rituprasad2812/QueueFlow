import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

const industries = [
  { emoji: "🏥", name: "Clinics & Hospitals", description: "Patient queues, OPD management" },
  { emoji: "💇", name: "Salons & Spas", description: "Walk-in management, appointments" },
  { emoji: "🏦", name: "Banks", description: "Token systems, multi-counter" },
  { emoji: "🏛️", name: "Government Offices", description: "Public service queues" },
  { emoji: "🍽️", name: "Restaurants", description: "Waitlist management" },
  { emoji: "🚗", name: "Service Centers", description: "Car service, repairs" },
];

const Industries = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Industries
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Built for
              <span className="text-primary"> Every Business</span>
            </h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {industries.map((industry, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5, scale: 1.05 }}
                className="text-center p-6 rounded-2xl border hover:shadow-lg hover:border-primary/30 transition-all cursor-default"
              >
                <span className="text-4xl">{industry.emoji}</span>
                <p className="font-semibold text-sm mt-3">{industry.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {industry.description}
                </p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Industries;