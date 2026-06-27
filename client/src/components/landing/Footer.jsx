import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">QueueFlow</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="/login" className="hover:text-white transition-colors">
              Login
            </a>
            <a href="/register" className="hover:text-white transition-colors">
              Get Started
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © 2024 QueueFlow. Built with ❤️
          </p>
        </div>

        {/* Tech Stack */}
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Built with React • Node.js • MongoDB • Socket.io • Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;