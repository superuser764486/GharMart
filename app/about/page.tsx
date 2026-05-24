import Header from '@/components/Header';
import { Leaf, Users, TrendingUp, Heart } from 'lucide-react';

export const metadata = {
  title: 'About GharMart - Our Mission & Story',
  description: 'Learn about GharMart, how we connect communities with local businesses, and our mission to support neighborhood commerce.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">About GharMart</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connecting communities with local businesses, one neighborhood at a time. Discover the story behind GharMart.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                GharMart exists to empower local businesses and strengthen communities. We believe that shopping locally isn&apos;t just about transactions—it&apos;s about building relationships, supporting neighbors, and keeping wealth within our communities.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                By creating a seamless platform that connects customers with nearby shops, we&apos;re making it easier than ever to discover quality products from businesses you can trust.
              </p>
              <p className="text-gray-600 text-lg">
                Our goal is to become the go-to marketplace for hyperlocal commerce across India, transforming how people shop and how local businesses thrive.
              </p>
            </div>
            <div className="bg-blue-100 rounded-lg p-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">Supporting Local</h3>
                <p className="text-gray-600">
                  Every purchase on GharMart directly supports local families and neighborhood businesses, creating sustainable economic growth from the ground up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Community */}
            <div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-blue-600">
              <Users className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community First</h3>
              <p className="text-gray-600">
                We prioritize community well-being over profit, building a platform that benefits everyone involved.
              </p>
            </div>

            {/* Sustainability */}
            <div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-green-600">
              <Leaf className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sustainability</h3>
              <p className="text-gray-600">
                By promoting local shopping, we reduce carbon footprints and support sustainable business practices.
              </p>
            </div>

            {/* Growth */}
            <div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-purple-600">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Growth & Innovation</h3>
              <p className="text-gray-600">
                We continuously improve our platform to help businesses grow and serve customers better.
              </p>
            </div>

            {/* Trust */}
            <div className="bg-white rounded-lg p-8 shadow-md border-t-4 border-red-600">
              <Heart className="w-12 h-12 text-red-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trust & Transparency</h3>
              <p className="text-gray-600">
                We build trust through transparency, honest practices, and consistent delivery of quality service.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Our Story</h2>
            <div className="space-y-6 text-gray-600 text-lg">
              <p>
                GharMart was founded on a simple observation: India&apos;s local businesses had amazing products but lacked a modern platform to reach customers. Meanwhile, customers wanted to support local but found it inconvenient to discover and access neighborhood shops.
              </p>
              <p>
                We saw an opportunity to bridge this gap. By combining hyperlocal geography with modern e-commerce technology, we could create a win-win situation for everyone—customers get convenience and quality, businesses get visibility and sales, and communities get stronger.
              </p>
              <p>
                Today, GharMart connects thousands of shops with millions of customers across India. But we&apos;re just getting started. Our vision is to become the backbone of local commerce, enabling every neighborhood shop to compete with larger retailers and giving every customer the power to support their communities.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Rajesh Kumar',
                role: 'Founder & CEO',
                bio: 'Serial entrepreneur with 10+ years in e-commerce and local commerce.',
              },
              {
                name: 'Priya Sharma',
                role: 'CTO & Co-founder',
                bio: 'Tech leader focused on building scalable platforms for underserved markets.',
              },
              {
                name: 'Amit Patel',
                role: 'VP Operations',
                bio: 'Operations expert with deep experience in supply chain and logistics.',
              },
            ].map((member) => (
              <div key={member.name} className="bg-white rounded-lg p-8 shadow-md text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Join the Local Commerce Revolution</h2>
            <p className="text-blue-100 text-lg mb-8">
              Whether you&apos;re a customer discovering local shops or a business looking to reach your community, GharMart is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/products" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Shop Now
              </a>
              <a href="/contact" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-600">
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
