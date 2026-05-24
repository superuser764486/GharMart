import Header from '@/components/Header';

export const metadata = {
  title: 'Privacy Policy - GharMart',
  description: 'Read our comprehensive privacy policy and learn how we protect your data.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-blue-100">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to GharMart (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains our data practices and your rights regarding your personal information.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Account Information</h3>
                  <p className="text-gray-600">
                    Name, email address, phone number, password, and profile picture when you create an account.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address Information</h3>
                  <p className="text-gray-600">
                    Delivery and billing addresses, including street address, city, state, and postal code.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-gray-600">
                    Payment method details are processed securely through our payment gateway partners. We do not store full credit card numbers.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
                  <p className="text-gray-600">
                    Details about products purchased, order status, delivery preferences, and transaction history.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Communication Data</h3>
                  <p className="text-gray-600">
                    Messages, reviews, ratings, and feedback you share on our platform or with customer support.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
                  <p className="text-gray-600">
                    Browser type, IP address, pages visited, time spent on pages, and referring URLs. Collected via cookies and similar technologies.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Process and fulfill orders, payments, and deliveries</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Provide customer support and respond to inquiries</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Send transactional emails (order confirmations, shipping updates)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Send promotional communications with your consent</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Improve our services through analytics and research</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Personalize your experience and recommend products</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Detect and prevent fraud and security issues</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Comply with legal obligations</span>
                </li>
              </ul>
            </div>

            {/* Data Sharing */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing Your Information</h2>
              <p className="text-gray-600 mb-4">
                We only share your information in the following circumstances:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <strong>With Sellers:</strong> Order and delivery information necessary to fulfill your purchase.
                </li>
                <li>
                  <strong>With Payment Processors:</strong> Payment information for secure transaction processing.
                </li>
                <li>
                  <strong>With Delivery Partners:</strong> Address and contact information for order delivery.
                </li>
                <li>
                  <strong>With Service Providers:</strong> Analytics, email, hosting, and customer support providers who sign data protection agreements.
                </li>
                <li>
                  <strong>Legal Requirements:</strong> If required by law, court order, or government request.
                </li>
                <li>
                  <strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets.
                </li>
              </ul>
            </div>

            {/* Your Rights */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Access your personal information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Correct inaccurate or incomplete information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Delete your account and associated data</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Opt-out of marketing communications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Request a copy of your data in portable format</span>
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                To exercise these rights, contact us at support@gharmart.com.
              </p>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
              <p className="text-gray-600">
                We use industry-standard security measures including:
              </p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>SSL/TLS encryption for data in transit</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Bcryptjs password hashing</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Secure database with access controls</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Regular security audits and monitoring</span>
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                While we implement strong security measures, no system is 100% secure. Please use a strong password and protect your account credentials.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-600">
                We use cookies and similar technologies to enhance your experience. You can control cookie settings in your browser. Disabling cookies may limit some functionality on our platform.
              </p>
            </div>

            {/* Third-Party Links */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
              <p className="text-gray-600">
                Our platform may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before sharing information.
              </p>
            </div>

            {/* Children */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-600">
                GharMart is not intended for children under 13. We do not knowingly collect information from children. If we become aware of such collection, we will delete it immediately.
              </p>
            </div>

            {/* Changes */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of material changes via email or prominent notice on our platform. Your continued use of GharMart constitutes acceptance of the updated policy.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
              <h2 className="text-xl font-bold text-gray-900 mb-2">11. Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="mt-4 text-gray-600">
                <p><strong>Email:</strong> privacy@gharmart.com</p>
                <p><strong>Address:</strong> GharMart HQ, Bangalore, India</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
