import { Navbar } from "@/components/navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Privacy Policy - Galatea.AI',
  description: 'Privacy Policy for Galatea.AI',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-gray-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                Galatea.AI ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our AI companion platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-200">2.1 Information You Provide</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Account information (email address, display name, profile picture)</li>
                <li>User preferences and settings</li>
                <li>Messages and conversations with AI companions</li>
                <li>Profile information and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-4 text-gray-200">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Usage data and interaction patterns</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">3. How We Use Your Information</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Personalize your AI companion experience</li>
                <li>Process transactions and manage your account</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">4. Data Storage and Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or 
                electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">5. Data Sharing and Disclosure</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations or respond to legal requests</li>
                <li>To protect our rights, privacy, safety, or property</li>
                <li>With service providers who assist us in operating our platform (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">6. AI and Machine Learning</h2>
              <p className="text-gray-300 leading-relaxed">
                We use artificial intelligence and machine learning to provide personalized companion experiences. Your interactions 
                with AI companions may be used to improve our AI models and services. We take measures to anonymize and aggregate 
                data used for training purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you 
                do not accept cookies, you may not be able to use some portions of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">8. Your Rights and Choices</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 ml-4">
                <li>Access and receive a copy of your personal data</li>
                <li>Rectify inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict processing of your data</li>
                <li>Data portability (receive your data in a structured format)</li>
                <li>Withdraw consent at any time</li>
                <li>Delete your account at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">9. Children's Privacy</h2>
              <p className="text-gray-300 leading-relaxed">
                Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information 
                from children. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">10. International Data Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your state, province, country, 
                or other governmental jurisdiction where data protection laws may differ. By using our service, you consent to the 
                transfer of your information to these facilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy 
                Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically 
                for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-teal-400">12. Contact Us</h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us through 
                our support channels or at the contact information provided on our website.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

