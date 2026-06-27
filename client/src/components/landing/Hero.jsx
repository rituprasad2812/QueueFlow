import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import AnimatedText from "./AnimatedText";
import { ArrowRight, Zap, QrCode, Clock } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        {/* Floating Circles */}
        <motion.div
          className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ bottom: "10%", right: "10%" }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-blue-300/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ top: "50%", left: "50%" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8"
        >
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium">
            Smart Queue Management for Modern Businesses
          </span>
        </motion.div>

        {/* Title */}
        <AnimatedText
          text="Stop Making Your Customers Wait In Lines"
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-lg md:text-xl text-blue-100 mt-6 max-w-2xl mx-auto"
        >
          Virtual queues, real-time tracking, QR check-in, and smart analytics.
          Everything your business needs to deliver an exceptional waiting experience.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Button
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              document.getElementById("features").scrollIntoView({
                behavior: "smooth",
              });
            }}
            className="border-white/30 text-blue-700 hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
          >
            See How It Works
          </Button>
        </motion.div>

        {/* Mini Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-8 mt-16"
        >
          <MiniFeature icon={QrCode} text="QR Check-in" />
          <MiniFeature icon={Clock} text="Real-time Tracking" />
          <MiniFeature icon={Zap} text="Instant Notifications" />
        </motion.div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

const MiniFeature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 text-blue-100">
    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export default Hero;