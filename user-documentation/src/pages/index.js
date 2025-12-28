import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              Legal Practice Management Made Simple
            </Heading>
            <p className="hero__subtitle">
              Streamline your property law workflows with LawFlow. Manage matters, track tasks,
              handle documents, and collaborate seamlessly - all in one powerful platform.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--primary button--lg"
                to="https://app.lawflow.app">
                Start Free Trial 🚀
              </Link>
              <Link
                className="button button--secondary button--lg"
                to="/docs/getting-started">
                View Documentation 📖
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src="/img/lawflow-dashboard-preview.png"
              alt="LawFlow Dashboard Preview"
              className={styles.dashboardImage}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

function SocialProof() {
  return (
    <section className={styles.socialProof}>
      <div className="container">
        <div className="text--center">
          <p className={styles.socialProofText}>
            Trusted by <strong>500+</strong> legal professionals across <strong>50+</strong> law firms
          </p>
          <div className={styles.logos}>
            {/* Placeholder for client logos */}
            <div className={styles.logoPlaceholder}>🏢 Law Firm A</div>
            <div className={styles.logoPlaceholder}>⚖️ Law Firm B</div>
            <div className={styles.logoPlaceholder}>📋 Law Firm C</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className={styles.pricing}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Simple, Transparent Pricing</Heading>
          <p>Choose the plan that fits your practice</p>
        </div>
        <div className="row">
          <div className="col col--4">
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Starter</h3>
                <div className={styles.price}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>29</span>
                  <span className={styles.period}>/month</span>
                </div>
                <p>Perfect for solo practitioners</p>
              </div>
              <ul className={styles.features}>
                <li>Up to 50 matters</li>
                <li>5 team members</li>
                <li>Basic document management</li>
                <li>Email support</li>
                <li>Mobile app access</li>
              </ul>
              <button className="button button--outline button--block">Start Free Trial</button>
            </div>
          </div>
          <div className="col col--4">
            <div className={`${styles.pricingCard} ${styles.popular}`}>
              <div className={styles.popularBadge}>Most Popular</div>
              <div className={styles.pricingHeader}>
                <h3>Professional</h3>
                <div className={styles.price}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>79</span>
                  <span className={styles.period}>/month</span>
                </div>
                <p>Ideal for growing firms</p>
              </div>
              <ul className={styles.features}>
                <li>Unlimited matters</li>
                <li>25 team members</li>
                <li>Advanced document management</li>
                <li>Calendar integration</li>
                <li>Priority support</li>
                <li>API access</li>
              </ul>
              <button className="button button--primary button--block">Start Free Trial</button>
            </div>
          </div>
          <div className="col col--4">
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Enterprise</h3>
                <div className={styles.price}>
                  <span className={styles.currency}>$</span>
                  <span className={styles.amount}>199</span>
                  <span className={styles.period}>/month</span>
                </div>
                <p>For large legal practices</p>
              </div>
              <ul className={styles.features}>
                <li>Everything in Professional</li>
                <li>Unlimited team members</li>
                <li>Custom integrations</li>
                <li>Dedicated account manager</li>
                <li>Advanced security</li>
                <li>On-premise deployment</li>
              </ul>
              <button className="button button--outline button--block">Contact Sales</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2">Ready to Transform Your Legal Practice?</Heading>
          <p>Join hundreds of legal professionals who trust LawFlow to streamline their workflows.</p>
          <div className={styles.ctaButtons}>
            <Link
              className="button button--primary button--lg"
              to="https://app.lawflow.app">
              Start Your Free Trial
            </Link>
            <Link
              className="button button--secondary button--lg"
              to="/docs/getting-started">
              View Documentation
            </Link>
          </div>
          <p className={styles.ctaNote}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="LawFlow - Legal Practice Management Made Simple"
      description="Streamline your property law workflows with LawFlow. Manage matters, track tasks, handle documents, and collaborate seamlessly.">
      <HomepageHeader />
      <SocialProof />
      <main>
        <HomepageFeatures />
        <PricingSection />
        <CTASection />
      </main>
    </Layout>
  );
}
