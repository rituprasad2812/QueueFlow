import { motion } from "framer-motion";
import FadeIn from "./FadeIn";
import {
    QrCode,
    Clock,
    Bell,
    BarChart3,
    Monitor,
    Users,
    Smartphone,
    Shield,
} from "lucide-react";

const features = [
    {
        icon: QrCode,
        title: "QR Code Check-in",
        description:
            "Customers scan a QR code to join the queue instantly. No app download needed.",
        color: "bg-blue-500",
    },
    {
        icon: Clock,
        title: "Real-time Tracking",
        description:
            "Live position updates powered by WebSockets. Customers always know where they stand.",
        color: "bg-purple-500",
    },
    {
        icon: Bell,
        title: "Smart Notifications",
        description:
            "Automatic alerts when turn is near. No more missed turns or anxious waiting.",
        color: "bg-green-500",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description:
            "Peak hours, average wait times, and weekly trends. Data-driven decisions.",
        color: "bg-orange-500",
    },
    {
        icon: Monitor,
        title: "Multi-Counter Support",
        description:
            "Multiple service counters with individual staff assignment and tracking.",
        color: "bg-red-500",
    },
    {
        icon: Users,
        title: "Staff Management",
        description:
            "Create staff accounts, assign to counters. Each sees only their queue.",
        color: "bg-indigo-500",
    },
    {
        icon: Smartphone,
        title: "Mobile Friendly",
        description:
            "Fully responsive. Works perfectly on any device, anywhere.",
        color: "bg-pink-500",
    },
    {
        icon: Shield,
        title: "No-Show Handling",
        description:
            "Automatic skip after timeout. Queue keeps moving even if someone doesn't show.",
        color: "bg-teal-500",
    },
];

const Features = () => {
    return (
        <section id="features" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
                {/* Section Header */}
                <FadeIn>
                    <div className="text-center mb-16">
                        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                            Features
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-2">
                            Everything You Need to
                            <span className="text-primary"> Eliminate Lines</span>
                        </h2>
                        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                            A complete queue management solution built for clinics, salons,
                            banks, and any service-based business.
                        </p>
                    </div>
                </FadeIn>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <FadeIn key={index} delay={index * 0.1} direction="up">
                            <motion.div
                                whileHover={{ y: -5, scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                                className="p-6 rounded-2xl border bg-white hover:shadow-lg transition-shadow cursor-default h-full flex flex-col"
                            >
                                <div
                                    className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 flex-shrink-0`}
                                >
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                                    {feature.description}
                                </p>
                            </motion.div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;