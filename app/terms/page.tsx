import Header from '@/components/Header';

export const metadata = {
  title: 'Terms & Conditions - GharMart',
  description: 'Read the terms and conditions for using the GharMart platform.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-blue-100">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
            {/* Acceptance of Terms */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using GharMart (&quot;the Platform&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </div>

            {/* Use License */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software) on GharMart for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Modifying or copying the materials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Using the materials for any commercial purpose or for any public display</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Attempting to decompile or reverse engineer any software contained</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Removing any copyright or other proprietary notations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Transferring the materials to another person or &quot;mirroring&quot; the materials</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Using automated tools or bots to access or scrape content</span>
                </li>
              </ul>
            </div>

            {/* User Accounts */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-600">
                When you create an account on GharMart, you agree to:
              </p>
              <ul className="mt-3 space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Provide accurate, complete, and current information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Maintain the confidentiality of your password</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Be responsible for all activities under your account</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Notify us immediately of unauthorized access</span>
                </li>
              </ul>
            </div>

            {/* Product Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Product Information and Pricing</h2>
              <p className="text-gray-600 mb-3">
                All product descriptions, images, prices, and availability are subject to change without notice. We make reasonable efforts to ensure accuracy but do not guarantee that all product information is accurate, complete, or error-free.
              </p>
              <p className="text-gray-600">
                Prices are subject to change without notice. We reserve the right to limit quantities and refuse any order.
              </p>
            </div>

            {/* Orders and Payment */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Orders and Payment</h2>
              <p className="text-gray-600 mb-3">
                When you place an order, you are making an offer to purchase products. We reserve the right to accept or decline any order.
              </p>
              <div className="space-y-3 text-gray-600">
                <p>
                  <strong>Payment:</strong> Payment must be made at the time of order. We accept all major credit cards, debit cards, UPI, mobile wallets, and cash on delivery.
                </p>
                <p>
                  <strong>Security:</strong> We use industry-standard encryption and secure payment gateways. We are not responsible for unauthorized access due to your disclosure of login credentials.
                </p>
              </div>
            </div>

            {/* Shipping and Delivery */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Shipping and Delivery</h2>
              <p className="text-gray-600 mb-3">
                Delivery times are estimates only and not guaranteed. We are not responsible for delays caused by courier services, weather, or other external factors. Risk of loss passes to you upon delivery to the address provided.
              </p>
              <p className="text-gray-600">
                You are responsible for providing accurate delivery information. Orders cannot be changed once placed.
              </p>
            </div>

            {/* Returns and Refunds */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Returns and Refunds</h2>
              <p className="text-gray-600 mb-3">
                Most items can be returned within 7 days of delivery in original condition with original packaging. Refunds will be processed within 5-7 business days of receiving the returned item.
              </p>
              <p className="text-gray-600">
                Some items including perishables, custom orders, and clearance items are non-returnable. Please check item-specific return policies at checkout.
              </p>
            </div>

            {/* User Conduct */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. User Conduct</h2>
              <p className="text-gray-600 mb-3">
                You agree not to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Harass, threaten, or defame any person</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Post misleading or false information</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Infringe on intellectual property rights</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Violate any applicable laws or regulations</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Post spam, malware, or malicious code</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>Engage in fraudulent or deceptive practices</span>
                </li>
              </ul>
            </div>

            {/* Reviews and Ratings */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Reviews and Ratings</h2>
              <p className="text-gray-600 mb-3">
                You grant GharMart a worldwide, royalty-free, non-exclusive license to use, reproduce, and display reviews you submit. You represent that you have the right to grant this license and that your review is accurate, original, and doesn&apos;t violate anyone&apos;s rights.
              </p>
              <p className="text-gray-600">
                We reserve the right to remove reviews that are false, defamatory, offensive, or violate these terms.
              </p>
            </div>

            {/* Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Intellectual Property Rights</h2>
              <p className="text-gray-600">
                The Platform and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video and audio) are owned by GharMart, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            {/* Disclaimer */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Disclaimer</h2>
              <p className="text-gray-600">
                The materials on GharMart are provided &quot;as is&quot;. GharMart makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Limitation of Liability</h2>
              <p className="text-gray-600">
                In no event shall GharMart or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GharMart, even if GharMart or a GharMart authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications</h2>
              <p className="text-gray-600">
                GharMart may revise these terms of service for its Platform at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </div>

            {/* Termination */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Termination</h2>
              <p className="text-gray-600">
                GharMart reserves the right to terminate your account and access to the Platform at any time, for any reason, with or without cause or notice.
              </p>
            </div>

            {/* Governing Law */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law</h2>
              <p className="text-gray-600">
                These terms and conditions are governed by and construed in accordance with the laws of India, and you irrevocably submit to the exclusive jurisdiction of the courts in Bangalore.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-gray-50 border border-gray-200 p-6 rounded">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Questions?</h2>
              <p className="text-gray-600">
                If you have questions about these Terms & Conditions, please contact us at support@gharmart.com.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
