import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Database, CreditCard, Mail, Cookie, Trash2, ExternalLink, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-jung-primary hover:text-jung-accent transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <header className="mb-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-jung-accent/10 mb-4">
          <Shield className="w-8 h-8 text-jung-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-jung-dark mb-4">
          Privacy Policy
        </h1>
        <p className="text-stone-500 text-sm">
          Last updated: January 12, 2026
        </p>
      </header>

      <div className="prose prose-stone prose-lg max-w-none">
        <p className="text-lg text-stone-600 leading-relaxed mb-8">
          At Jungian Typology Assessment, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our assessment service.
        </p>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Information We Collect</h2>
          </div>
          
          <div className="space-y-4 pl-14">
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Account Information</h3>
              <p className="text-stone-600 text-sm m-0">
                When you create an account, we collect your email address and basic profile information provided through Google OAuth authentication. This includes your name and profile picture if available.
              </p>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Assessment Responses</h3>
              <p className="text-stone-600 text-sm m-0">
                We store your responses to the typology assessment questions and the calculated results. This data is used to generate your personalized psychological profile and is linked to your account.
              </p>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Payment Information</h3>
              <p className="text-stone-600 text-sm m-0">
                When you purchase premium access, payment processing is handled by Stripe. We do not store your credit card details. We receive confirmation of successful payment and your purchase status.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">How We Use Your Information</h2>
          </div>
          
          <ul className="pl-14 space-y-3 text-stone-600">
            <li><strong>Account Management:</strong> To create and maintain your user account, authenticate your identity, and provide access to your assessment history.</li>
            <li><strong>Assessment Delivery:</strong> To process your assessment responses, calculate your typology scores, and generate your personalized results.</li>
            <li><strong>Email Communications:</strong> To send you your assessment results report, purchase confirmations, and important account notifications via Resend.</li>
            <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our assessment methodology and user experience.</li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <ExternalLink className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Third-Party Services</h2>
          </div>
          
          <div className="space-y-4 pl-14">
            <div className="bg-white rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-stone-500" />
                Stripe (Payment Processing)
              </h3>
              <p className="text-stone-600 text-sm m-0">
                We use Stripe to process payments securely. Stripe's privacy policy governs the collection and use of your payment information. Visit <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-jung-primary hover:text-jung-accent">stripe.com/privacy</a> for details.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-stone-500" />
                Google (Authentication)
              </h3>
              <p className="text-stone-600 text-sm m-0">
                We use Google OAuth for secure authentication. When you sign in with Google, we receive your email and basic profile information. Google's privacy policy applies to data collected during authentication.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-stone-500" />
                Resend (Email Delivery)
              </h3>
              <p className="text-stone-600 text-sm m-0">
                We use Resend to deliver email reports and notifications. Resend processes your email address solely for the purpose of sending communications on our behalf.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Cookies</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              We use essential session cookies to maintain your authentication state and provide a seamless experience. These cookies are necessary for the service to function and cannot be disabled.
            </p>
            <p className="mt-3">
              We do not use advertising or tracking cookies. Our cookies are strictly functional and expire when you end your session or after a reasonable period of inactivity.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Data Retention & Deletion</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              We retain your account information and assessment data for as long as your account is active. You may request deletion of your account and all associated data at any time through your profile settings or by contacting us.
            </p>
            <p className="mt-3">
              Upon account deletion, we will remove your personal information and assessment data from our active databases. Some data may be retained in backup systems for a limited period and for legal compliance purposes.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Data Security</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, secure authentication practices, and regular security assessments.
            </p>
          </div>
        </section>

        <section className="mb-12 bg-amber-50 rounded-lg p-6 border border-amber-100">
          <h2 className="text-xl font-serif font-bold text-amber-900 mb-4">Contact Us</h2>
          <p className="text-amber-800 m-0">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
          </p>
          <p className="text-amber-900 font-medium mt-3 m-0">
            [Contact Email Placeholder]
          </p>
        </section>

        <section className="text-center pt-8 border-t border-stone-200">
          <p className="text-stone-500 text-sm">
            By using our service, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <div className="mt-6">
            <Link 
              to="/terms" 
              className="text-jung-primary hover:text-jung-accent transition-colors font-medium"
            >
              View Terms of Service →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
