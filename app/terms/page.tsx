import { Navbar } from "@/components/navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Terms of Service - Galatea.AI',
  description: 'Terms of Service for Galatea.AI',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Galatea.AI, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. Description of Service</h2>
              <p className="text-gray-300 leading-relaxed">
                Galatea.AI is an AI companion platform that connects users with AI-powered companions for meaningful conversations, 
                emotional support, and confidence building. Our service uses artificial intelligence to create personalized companion 
                experiences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. User Accounts</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To use certain features of our service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. User Conduct</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You agree not to use the service to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the service or its systems</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. AI Companions</h2>
              <p className="text-gray-300 leading-relaxed">
                Our AI companions are powered by artificial intelligence and are designed for entertainment, companionship, and support. 
                They are not intended to replace professional medical, legal, or financial advice. Interactions with AI companions are 
                for entertainment purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">6. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content, features, and functionality of the service, including but not limited to text, graphics, logos, icons, 
                images, and software, are the exclusive property of Galatea.AI and are protected by international copyright, trademark, 
                and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">7. Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Your use of the service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our 
                practices regarding the collection and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">8. Limitation of Liability</h2>
              <p className="text-gray-300 leading-relaxed">
                To the fullest extent permitted by law, Galatea.AI shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
                or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">9. Termination</h2>
              <p className="text-gray-300 leading-relaxed">
                We may terminate or suspend your account and access to the service immediately, without prior notice or liability, 
                for any reason, including if you breach the Terms of Service. Upon termination, your right to use the service will 
                cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">10. Changes to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the 
                new Terms of Service on this page and updating the "Last updated" date. Your continued use of the service after 
                such modifications constitutes acceptance of the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">11. Contact Information</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

