import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { PRICING } from '../data/pricing';

export const TermsOfService: React.FC = () => {
  return (
    <div className="editorial-container pb-12 md:pb-16">
      <header className="page-head">
        <Link to="/" className="page-back">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>
        <h1 className="page-title">Terms of Service</h1>
        <p className="page-meta">Last updated: May 18, 2026</p>
      </header>

      <div className="max-w-3xl">
        <p className="text-lg text-jung-secondary leading-relaxed mb-10">
          Welcome to TypeJung. By accessing or using our service, you agree to be bound by these Terms of Service. Please read them carefully before using the assessment.
        </p>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Service Description</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              TypeJung is an online psychological self-assessment tool based on Carl Jung's theory of psychological types. Our service provides:
            </p>
            <ul className="mt-3 space-y-2">
              <li>A comprehensive questionnaire measuring the eight Jungian function-attitudes</li>
              <li>Personalized educational results and self-reflection analysis</li>
              <li>Educational content about Jungian typology and individuation</li>
              <li>The ability to save, view, and share your assessment results</li>
            </ul>
          </div>
        </section>

        <section className="mb-12 bg-jung-surface p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 flex-shrink-0 text-jung-dark mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-jung-dark mb-4">Important Disclaimer</h2>
              <div className="text-jung-secondary space-y-3">
                <p className="font-semibold text-jung-dark">
                  This assessment is for educational and self-exploration purposes only.
                </p>
                <p>
                  TypeJung is NOT:
                </p>
                <ul className="list-diamond">
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
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Payment Terms</h2>
          </div>

          <div className="space-y-2">
            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Pricing</h3>
              <p className="text-jung-secondary m-0">
                Premium access is available as one-time CAD payments: <strong className="text-jung-dark">{PRICING.insight.price}</strong> for Insight or <strong className="text-jung-dark">{PRICING.mastery.price}</strong> for Mastery. These are non-recurring charges that provide ongoing access to the tier you purchase.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Refund Policy</h3>
              <p className="text-jung-secondary m-0">
                We offer a <strong className="text-jung-dark">7-day money-back guarantee</strong>. If you are not satisfied with your paid TypeJung report, you may request a full refund within 7 days of purchase. To request a refund, please contact us with your order details.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Payment Processing</h3>
              <p className="text-jung-secondary m-0">
                All payments are processed securely through Stripe. By making a purchase, you agree to Stripe's terms of service. We do not store your credit card information.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Account Responsibilities</h2>
          </div>

          <div className="text-jung-secondary">
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
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Intellectual Property</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              All content on this website, including but not limited to assessment questions, scoring methodology, result interpretations, educational materials, graphics, and design elements, is the intellectual property of TypeJung and is protected by copyright law.
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
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Limitation of Liability</h2>
          </div>

          <div className="text-jung-secondary">
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
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Changes to Terms</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or through our website. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </div>
        </section>

        <section className="mb-12 bg-jung-surface p-6">
          <h2 className="text-xl font-semibold text-jung-dark mb-4">Contact Us</h2>
          <p className="text-jung-secondary m-0">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <p className="text-jung-dark font-semibold mt-3 m-0">
            support@typejung.com
          </p>
        </section>

        <section className="pt-8">
          <p className="text-jung-muted text-sm">
            By using our service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="mt-6">
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center font-medium text-jung-accent-text underline underline-offset-2"
            >
              View Privacy Policy →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
