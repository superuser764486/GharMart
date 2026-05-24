import Header from '@/components/Header';
import { Check, Zap, Crown, Truck } from 'lucide-react';

export const metadata = {
  title: 'Pricing & Membership Plans - GharMart',
  description: 'Explore GharMart membership plans and shipping benefits. Choose the plan that works best for you.',
};

export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      icon: Truck,
      price: 'Free',
      description: 'Perfect for occasional shoppers',
      features: [
        'Access to all products',
        'Standard delivery (2-3 days)',
        'Delivery charges apply',
        'Product reviews & ratings',
        'Customer support',
        'Secure payments',
      ],
      cta: 'Start Shopping',
      ctaHref: '/products',
    },
    {
      name: 'Prime',
      icon: Zap,
      price: '₹99',
      period: '/month',
      description: 'Great for regular shoppers',
      features: [
        'Everything in Basic',
        'Free delivery on eligible orders',
        'Express delivery (1-2 days)',
        'Early access to deals',
        'Exclusive member discounts',
        'Priority customer support',
        'Extended return window (10 days)',
      ],
      cta: 'Subscribe Now',
      ctaHref: '#subscribe',
      popular: true,
    },
    {
      name: 'Prime Plus',
      icon: Crown,
      price: '₹999',
      period: '/year',
      description: 'Best value for heavy users',
      features: [
        'Everything in Prime',
        'Free delivery on all orders',
        'Super express delivery (same day)',
        'Extra 5% discount on all orders',
        'Exclusive member-only sales',
        'VIP customer support (24/7)',
        'Extended return window (15 days)',
        'Birthday bonus credits',
      ],
      cta: 'Subscribe Now',
      ctaHref: '#subscribe',
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Choose the plan that fits your shopping habits and unlock exclusive benefits.
            </p>
          </div>
        </section>

        {/* Pricing Plans */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`rounded-lg shadow-md overflow-hidden transition transform hover:scale-105 ${
                    plan.popular ? 'ring-2 ring-blue-600 md:scale-105' : 'bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-blue-600 text-white py-2 text-center font-semibold text-sm">
                      Most Popular
                    </div>
                  )}
                  <div className={`p-8 ${plan.popular ? 'bg-blue-50' : 'bg-white'}`}>
                    {/* Header */}
                    <Icon className={`w-8 h-8 mb-4 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && <span className="text-gray-600 text-sm">{plan.period}</span>}
                    </div>

                    {/* CTA Button */}
                    <a
                      href={plan.ctaHref}
                      className={`block w-full py-3 rounded-lg font-semibold text-center mb-8 transition ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {plan.cta}
                    </a>

                    {/* Features */}
                    <div className="space-y-4">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Comparison Table */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Detailed Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-900">Basic</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Prime</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">Prime Plus</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Access to Products', basic: true, prime: true, plus: true },
                  { feature: 'Standard Delivery', basic: true, prime: true, plus: true },
                  { feature: 'Express Delivery', basic: false, prime: true, plus: true },
                  { feature: 'Same-Day Delivery', basic: false, prime: false, plus: true },
                  { feature: 'Free Delivery', basic: false, prime: 'Eligible', plus: 'All Orders' },
                  { feature: 'Early Access to Deals', basic: false, prime: true, plus: true },
                  { feature: 'Member Discounts', basic: false, prime: '5%', plus: '5-10%' },
                  { feature: 'Return Window', basic: '7 days', prime: '10 days', plus: '15 days' },
                  { feature: 'Customer Support', basic: 'Standard', prime: 'Priority', plus: '24/7 VIP' },
                  { feature: 'Birthday Bonus', basic: false, prime: false, plus: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-gray-600 text-sm">{row.basic}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.prime === 'boolean' ? (
                        row.prime ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-gray-600 text-sm">{row.prime}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.plus === 'boolean' ? (
                        row.plus ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-gray-600 text-sm">{row.plus}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white border-t py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Common Questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Can I change my membership plan anytime?',
                  a: 'Yes, you can upgrade or downgrade your plan anytime. Changes take effect immediately.',
                },
                {
                  q: 'Do I need a subscription to use GharMart?',
                  a: 'No! You can shop for free with our Basic plan. Premium memberships are optional.',
                },
                {
                  q: 'How does the free delivery work for Prime members?',
                  a: 'Prime members get free delivery on eligible orders above ₹500 for 1-2 day delivery and all orders for same-day delivery (Prime Plus).',
                },
                {
                  q: 'What if I\'m not satisfied with my subscription?',
                  a: 'You can cancel anytime without penalties. No questions asked.',
                },
                {
                  q: 'Do student discounts apply?',
                  a: 'We offer 20% off Prime subscriptions for verified students. Contact support with your student ID.',
                },
                {
                  q: 'How do I claim my birthday bonus?',
                  a: 'Prime Plus members automatically receive ₹500 bonus credits during their birthday month.',
                },
              ].map((faq, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-blue-100 text-lg mb-8">
              Join thousands of happy GharMart customers enjoying better shopping with our membership plans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Start Free
              </a>
              <a href="/auth/signup" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-600">
                Sign Up Now
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
