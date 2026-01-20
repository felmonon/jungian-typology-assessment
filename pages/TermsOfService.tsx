import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, CreditCard, User, Scale, Shield, ArrowLeft } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
          <FileText className="w-8 h-8 text-jung-accent" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-jung-dark mb-4">
          Terms of Service
        </h1>
        <p className="text-stone-500 text-sm">
          Last updated: January 12, 2026
        </p>
      </header>

      <div className="prose prose-stone prose-lg max-w-none">
        <p className="text-lg text-stone-600 leading-relaxed mb-8">
          Welcome to Jungian Typology Assessment. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully before using our assessment.
        </p>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Service Description</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              Jungian Typology Assessment is an online psychological self-assessment tool based on Carl Jung's theory of psychological types. Our service provides:
            </p>
            <ul className="mt-3 space-y-2">
              <li>A comprehensive questionnaire measuring the eight Jungian function-attitudes</li>
              <li>Personalized results and analysis of your psychological profile</li>
              <li>Educational content about Jungian typology and individuation</li>
              <li>The ability to save, view, and share your assessment results</li>
            </ul>
          </div>
        </section>

        <section className="mb-12 bg-amber-50 rounded-lg p-6 border border-amber-100">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0 text-amber-700 mt-1" />
            <div>
              <h2 className="text-xl font-serif font-bold text-amber-900 mb-4">Important Disclaimer</h2>
              <div className="text-amber-800 space-y-3">
                <p className="font-semibold">
                  This assessment is for educational and self-exploration purposes only.
                </p>
                <p>
                  The Jungian Typology Assessment is NOT:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Medical or psychological diagnosis</li>
                  <li>Professional therapeutic advice</li>
                  <li>A substitute for consultation with a licensed mental health professional</li>
                  <li>A clinical or diagnostic instrument</li>
                </ul>
                <p>
                  Results are based on self-reporting and reflect your conscious self-perception at the time of assessment. They should be viewed as a tool for reflection and self-awareness, not as a definitive characterization of your personality.
                </p>
                <p>
                  If you are experiencing psychological distress, please seek help from a qualified mental health professional.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Payment Terms</h2>
          </div>
          
          <div className="space-y-4 pl-14">
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Pricing</h3>
              <p className="text-stone-600 text-sm m-0">
                Premium access to full assessment results is available for a one-time payment of <strong>$10 USD</strong>. This is a non-recurring charge that provides lifetime access to your detailed results.
              </p>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Refund Policy</h3>
              <p className="text-stone-600 text-sm m-0">
                We offer a <strong>30-day refund policy</strong>. If you are not satisfied with your assessment results, you may request a full refund within 30 days of purchase. To request a refund, please contact us with your order details.
              </p>
            </div>
            
            <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
              <h3 className="font-semibold text-jung-dark mb-2">Payment Processing</h3>
              <p className="text-stone-600 text-sm m-0">
                All payments are processed securely through Stripe. By making a purchase, you agree to Stripe's terms of service. We do not store your credit card information.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <User className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Account Responsibilities</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>When using our service, you agree to:</p>
            <ul className="mt-3 space-y-2">
              <li>Provide accurate information during registration and assessment</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account access with others</li>
              <li>Not attempt to manipulate or game the assessment</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Not use the service to harm, harass, or deceive others</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Intellectual Property</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              All content on this website, including but not limited to assessment questions, scoring methodology, result interpretations, educational materials, graphics, and design elements, is the intellectual property of Jungian Typology Assessment and is protected by copyright law.
            </p>
            <p className="mt-3">
              You may not:
            </p>
            <ul className="mt-2 space-y-2">
              <li>Copy, reproduce, or distribute our assessment content</li>
              <li>Create derivative works based on our methodology</li>
              <li>Use our content for commercial purposes without permission</li>
              <li>Reverse engineer our scoring algorithms</li>
            </ul>
            <p className="mt-3">
              You retain ownership of your personal assessment responses and may share your individual results as you see fit.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Limitation of Liability</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              To the maximum extent permitted by law:
            </p>
            <ul className="mt-3 space-y-2">
              <li>The service is provided "as is" without warranties of any kind, express or implied</li>
              <li>We do not warrant that the service will be uninterrupted, error-free, or secure</li>
              <li>We are not liable for any decisions made based on your assessment results</li>
              <li>We are not responsible for any psychological or emotional effects resulting from taking the assessment</li>
              <li>Our total liability shall not exceed the amount you paid for the service</li>
            </ul>
            <p className="mt-4">
              You acknowledge that personality assessments are inherently limited and should not be the sole basis for important life decisions.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark m-0">Changes to Terms</h2>
          </div>
          
          <div className="pl-14 text-stone-600">
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or through our website. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        <section className="mb-12 bg-stone-100 rounded-lg p-6 border border-stone-200">
          <h2 className="text-xl font-serif font-bold text-jung-dark mb-4">Contact Us</h2>
          <p className="text-stone-600 m-0">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-jung-primary font-medium mt-3 m-0">
            [Contact Email Placeholder]
          </p>
        </section>

        <section className="text-center pt-8 border-t border-stone-200">
          <p className="text-stone-500 text-sm">
            By using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="mt-6">
            <Link 
              to="/privacy" 
              className="text-jung-primary hover:text-jung-accent transition-colors font-medium"
            >
              View Privacy Policy →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
