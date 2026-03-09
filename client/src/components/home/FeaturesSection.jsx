import React from 'react';
import { FiShield, FiClock, FiCreditCard, FiMapPin } from 'react-icons/fi';

const features = [
  {
    title: 'Verified Users',
    description: 'Every user goes through a strict identity verification process to ensure a safe community.',
    icon: <FiShield className="w-6 h-6 text-primary" />
  },
  {
    title: 'Instant Booking',
    description: 'Book items instantly without waiting for approvals. Start using what you need right away.',
    icon: <FiClock className="w-6 h-6 text-primary" />
  },
  {
    title: 'Secure Payments',
    description: 'Payments are held securely and only released when the item is safely returned.',
    icon: <FiCreditCard className="w-6 h-6 text-primary" />
  },
  {
    title: 'Local Discovery',
    description: 'Find amazing items right in your neighborhood. Less travel time, more doing.',
    icon: <FiMapPin className="w-6 h-6 text-primary" />
  }
];

const FeaturesSection = () => {
  return (
    <div className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">Why choose us</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to rent with confidence
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            We've built a platform that takes the friction out of renting. From secure payments to verified users, we handle the hard parts so you can focus on your projects.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-primary/10">
                     {feature.icon}
                  </div>
                  {feature.title}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
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

