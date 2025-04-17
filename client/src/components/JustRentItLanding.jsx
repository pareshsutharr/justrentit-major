import { motion, useScroll, useCycle, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaLeaf, FaShieldAlt, FaWallet, FaRocket, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { FiChevronRight, FiSmartphone, FiSearch, FiHeart } from "react-icons/fi";

const JustRentItLanding = () => {
  const [isOpen, toggleOpen] = useCycle(false, true);
  const { scrollYProgress } = useScroll();
  const [ref, inView] = useInView({ threshold: 0.2 });

  const features = [
    { icon: <FaLeaf />, title: "Eco-Friendly", desc: "Sustainable rental ecosystem" },
    { icon: <FaShieldAlt />, title: "Secure", desc: "End-to-end encrypted transactions" },
    { icon: <FaWallet />, title: "Flexible Payments", desc: "Multiple payment options" },
    { icon: <FaRocket />, title: "Fast", desc: "Instant rental processing" },
  ];

  const steps = [
    { icon: <FiSearch />, title: "1. Find", desc: "Search millions of listings" },
    { icon: <FiHeart />, title: "2. Choose", desc: "Select your perfect item" },
    { icon: <FiSmartphone />, title: "3. Rent", desc: "Book with one click" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Floating Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm"
      >
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2">
            <span className="text-2xl font-bold text-purple-600">Just Rent It</span>
          </motion.div>
          
          <div className="hidden md:flex gap-8">
            {['Home', 'Explore', 'How It Works', 'Testimonials'].map((item) => (
              <motion.a
                key={item}
                whileHover={{ scale: 1.05, color: "#4F46E5" }}
                className="text-gray-600 cursor-pointer"
              >
                {item}
              </motion.a>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="md:w-1/2 mb-12 md:mb-0"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Rent Anything,<br/>
              <span className="text-purple-600">Anytime, Anywhere</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join the peer-to-peer rental revolution. List your items or find what you need in minutes.
            </p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg"
              >
                Get Started
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg"
              >
                How It Works
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 bg-purple-200 rounded-3xl transform rotate-6"
              />
              <img
                src="/phone-mockup.png"
                alt="App Preview"
                className="relative z-10 w-full rounded-3xl shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            className="text-4xl font-bold text-center mb-16"
          >
            Why Choose Us?
          </motion.h2>
          
          <div className="grid md:grid-cols-4 gap-8" ref={ref}>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.2 }}
                className="p-8 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-purple-600 text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            Simple 3-Step Process
          </motion.h2>
          
          <div className="flex flex-col md:flex-row justify-center gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="flex-1 p-8 bg-white rounded-xl shadow-lg"
              >
                <div className="text-purple-600 text-4xl mb-4">{step.icon}</div>
                <h3 className="text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4">Just Rent It</h3>
              <p className="text-gray-400">Making rentals simple, safe, and sustainable.</p>
            </div>
            
            <div className="flex-1">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <motion.a whileHover={{ y: -2 }}><FaInstagram size={24} /></motion.a>
                <motion.a whileHover={{ y: -2 }}><FaTwitter size={24} /></motion.a>
                <motion.a whileHover={{ y: -2 }}><FaLinkedin size={24} /></motion.a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default JustRentItLanding;