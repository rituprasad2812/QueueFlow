import { motion } from "framer-motion";
import FadeIn from "./FadeIn";
import CountUp from "./CountUp";

const steps = [
  {
    number: "01",
    title: "Business Registers",
    description:
      "Sign up, create your business profile, set up queues and counters in minutes.",
    emoji: "🏢",
  },
  {
    number: "02",
    title: "Share QR Code",
    description:
      "Print the QR code and display it at your reception. That's your queue entry point.",
    emoji: "📱",
  },
  {
    number: "03",
    title: "Customers Join",
    description:
      "Customers scan the QR, enter their name, and get a token number. No app needed.",
    emoji: "🎫",
  },
  {
    number: "04",
    title: "Staff Manages",
    description:
      "Staff clicks 'Call Next' when ready. Customers get notified in real-time.",
    emoji: "👨‍⚕️",
  },
];

const stats = [
  { value: 50, suffix: "%", label: "Less Wait Time" },
  { value: 10, suffix: "k+", label: "Tokens Managed" },
  { value: 99, suffix: "%", label: "Uptime" },
  { value: 4.9, suffix: "/5", label: "User Rating" },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              How It Works
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Up and Running in
              <span className="text-primary"> 4 Simple Steps</span>
            </h2>
          </div>
        </FadeIn>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={index * 0.15} direction="up">
              <div className="text-center">
                {/* Emoji */}
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  className="text-5xl mb-4"
                >
                  {step.emoji}
                </motion.div>

                {/* Step Number */}
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  STEP {step.number}
                </span>

                {/* Title */}
                <h3 className="font-bold text-lg mt-3 mb-2">{step.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (between steps on desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                </div>
              )}
            </FadeIn>
          ))}
        </div>

        {/* Stats */}
        <FadeIn>
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="text-center text-white"
                >
                  <p className="text-3xl md:text-4xl font-bold">
                    <CountUp
                      end={stat.value}
                      suffix={stat.suffix}
                      duration={2}
                    />
                  </p>
                  <p className="text-sm text-blue-200 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HowItWorks;