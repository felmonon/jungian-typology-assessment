import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CreditCard, Mail, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="editorial-container pb-12 md:pb-16">
      <header className="page-head">
        <Link to="/" className="page-back">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Home
        </Link>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="page-meta">Last updated: October 14, 2026</p>
      </header>

      <div className="max-w-3xl">
        <p className="text-lg text-jung-secondary leading-relaxed mb-10">
          At TypeJung, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our assessment service.
        </p>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Information We Collect</h2>
          </div>

          <div className="space-y-2">
            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Account Information</h3>
              <p className="text-jung-secondary m-0">
                When you create an account, we collect your email address and basic profile information provided through email sign-in, Google OAuth, or Apple sign-in when enabled. This can include your name and profile picture if available.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Assessment Responses</h3>
              <p className="text-jung-secondary m-0">
                We store your responses to the typology assessment questions and the calculated results. This data is used to generate your personalized educational results and is linked to your account.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">Payment Information</h3>
              <p className="text-jung-secondary m-0">
                When you purchase one-time CAD premium access, payment processing is handled by Stripe. We do not store your credit card details. We receive confirmation of successful payment and your purchase status.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">How We Use Your Information</h2>
          </div>

          <ul className="space-y-3 text-jung-secondary">
            <li><strong className="text-jung-dark">Account Management:</strong> To create and maintain your user account, authenticate your identity, and provide access to your assessment history.</li>
            <li><strong className="text-jung-dark">Assessment Delivery:</strong> To process your assessment responses, calculate your typology scores, and generate your personalized results.</li>
            <li><strong className="text-jung-dark">Email Communications:</strong> To send you requested discount codes, assessment result follow-ups, purchase confirmations, and important account notifications via Resend.</li>
            <li><strong className="text-jung-dark">Service Improvement:</strong> To analyze usage patterns and improve our assessment methodology and user experience.</li>
          </ul>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Third-Party Services</h2>
          </div>

          <div className="space-y-2">
            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2">OpenRouter and Microsoft Azure (AI Interpretations)</h3>
              <p className="text-jung-secondary m-0">
                To generate AI interpretations and coach responses, we send your assessment scores, function-stack map, and any coach messages to OpenAI’s GPT-4.1 Mini model hosted on Microsoft Azure through OpenRouter. We do not include account email addresses or payment details in these prompts. Coach messages can contain personal information you choose to enter. We request only provider endpoints with zero data retention and no training on prompts; requests fail rather than route to an endpoint that does not meet these settings. These services may process data outside Canada. OpenRouter retains operational metadata such as token counts and costs. See <a href="https://openrouter.ai/privacy" target="_blank" rel="noopener noreferrer" className="text-jung-accent-text underline underline-offset-2">OpenRouter’s privacy policy</a> and <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer" className="text-jung-accent-text underline underline-offset-2">Microsoft’s privacy statement</a>.
              </p>
            </div>
            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-jung-muted" />
                Stripe (Payment Processing)
              </h3>
              <p className="text-jung-secondary m-0">
                We use Stripe to process payments securely. Stripe's privacy policy governs the collection and use of your payment information. Visit <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-jung-accent-text underline underline-offset-2">stripe.com/privacy</a> for details.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-jung-muted" />
                Google and Apple (Authentication)
              </h3>
              <p className="text-jung-secondary m-0">
                We use OAuth providers for secure authentication. When you sign in with Google or Apple, we receive your verified email and basic profile information the provider makes available. The provider's privacy policy applies to data collected during authentication.
              </p>
            </div>

            <div className="bg-jung-surface p-5">
              <h3 className="font-semibold text-jung-dark mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-jung-muted" />
                Resend (Email Delivery)
              </h3>
              <p className="text-jung-secondary m-0">
                We use Resend to deliver email reports and notifications. Resend processes your email address solely for the purpose of sending communications on our behalf.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Cookies</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              We use essential session cookies to maintain your authentication state and provide a seamless experience. Account sessions expire after 30 days or when you sign out. These cookies are necessary for the service to function and cannot be disabled.
            </p>
            <p className="mt-3">
              We also use privacy-minded analytics to understand aggregate product usage. We do not use advertising cookies or ad personalization signals.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Data Retention & Deletion</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              We retain your account information and assessment data for as long as your account is active. You may request deletion of your account and all associated data at any time through your profile settings or by contacting us.
            </p>
            <p className="mt-3">
              Logging out clears TypeJung's local assessment result, premium cache, lifecycle email markers, and in-progress assessment data from that browser. Account deletion removes your personal information, saved assessment data, and purchase-access records from our active databases. Some data may be retained in backup systems for a limited period and for legal compliance purposes.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold tracking-tight text-jung-dark m-0">Data Security</h2>
          </div>

          <div className="text-jung-secondary">
            <p>
              We use established platform security controls to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encrypted connections, managed database protections, secure authentication practices, and periodic review of access and configuration.
            </p>
          </div>
        </section>

        <section className="mb-12 bg-jung-surface p-6">
          <h2 className="text-xl font-semibold text-jung-dark mb-4">Contact Us</h2>
          <p className="text-jung-secondary m-0">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
          </p>
          <p className="text-jung-dark font-semibold mt-3 m-0">
            support@typejung.com
          </p>
        </section>

        <section className="pt-8">
          <p className="text-jung-muted text-sm">
            By using our service, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <div className="mt-6">
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center font-medium text-jung-accent-text underline underline-offset-2"
            >
              View Terms of Service →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
