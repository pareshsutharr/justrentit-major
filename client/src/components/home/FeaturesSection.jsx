import React from 'react';
import { FiShield, FiClock, FiCreditCard, FiMapPin } from 'react-icons/fi';

const features = [
  {
    title: 'Verified Trust',
    description: 'Every member is identity-verified to ensure a secure and reliable rental community.',
    icon: <FiShield className="w-6 h-6 text-indigo-600" />
  },
  {
    title: 'Smart Booking',
    description: 'Real-time availability and instant confirmation. Rent what you need in seconds.',
    icon: <FiClock className="w-6 h-6 text-indigo-600" />
  },
  {
    title: 'Protected Payments',
    description: 'Secure transactions with money-back guarantee. Pay only for what you experience.',
    icon: <FiCreditCard className="w-6 h-6 text-indigo-600" />
  },
  {
    title: 'Eco-Friendly',
    description: 'Reduce waste and save money by renting instead of buying. Better for you, and the planet.',
    icon: <FiMapPin className="w-6 h-6 text-indigo-600" />
  }
];

const FeaturesSection = () => {
  return (
    <div className="bg-slate-50 py-24 sm:py-32 border-y border-slate-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-20">
          <h2 className="text-sm font-bold tracking-widest text-indigo-600 uppercase mb-3">The Experience</h2>
          <p className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-6">
            Renting made <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">effortless.</span>
          </p>
          <p className="text-lg leading-8 text-slate-600">
            We've distilled the rental process into its most pure form. No paperwork, no hassle—just the gear you love.
          </p>
        </div>
        <div className="mx-auto max-w-none">
          <dl className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="group flex flex-col bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <dt className="flex flex-col gap-y-6">
                  <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {React.cloneElement(feature.icon, { className: 'w-7 h-7 transition-colors group-hover:text-white' })}
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">{feature.title}</span>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-relaxed text-slate-500">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;

