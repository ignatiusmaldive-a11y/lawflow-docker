import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Matter Management',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Organize cases, track progress, and manage deadlines with comprehensive
        matter management tools designed specifically for property law.
      </>
    ),
  },
  {
    title: 'Task Automation',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        Streamline workflows with automated task creation, visual kanban boards,
        and intelligent deadline tracking to keep your team on track.
      </>
    ),
  },
  {
    title: 'Document Management',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Secure file storage with version control, collaboration tools, and
        integrated document templates for efficient legal document handling.
      </>
    ),
  },
];

const AdditionalFeatures = [
  {
    title: 'Calendar Integration',
    description: 'Sync with Google Calendar for seamless appointment management and scheduling.',
    icon: '📅',
  },
  {
    title: 'Client Portal',
    description: 'Secure client communication and document sharing with dedicated client portals.',
    icon: '👥',
  },
  {
    title: 'Reporting & Analytics',
    description: 'Comprehensive analytics and reporting tools to track performance and productivity.',
    icon: '📊',
  },
  {
    title: 'Mobile Access',
    description: 'Access your matters and tasks on-the-go with our responsive mobile interface.',
    icon: '📱',
  },
  {
    title: 'API Integration',
    description: 'Connect with external services and automate workflows through our REST API.',
    icon: '🔌',
  },
  {
    title: 'Security & Compliance',
    description: 'Enterprise-grade security with GDPR compliance and data encryption.',
    icon: '🔒',
  },
];

function Feature({Svg, title, description}) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function AdditionalFeaturesGrid() {
  return (
    <div className="row">
      {AdditionalFeatures.map((feature, idx) => (
        <div key={idx} className="col col--4 margin-bottom--lg">
          <div className="text--center">
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <h2>Everything You Need for Modern Legal Practice</h2>
          <p>LawFlow combines powerful features with an intuitive interface</p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        <div className="margin-top--xl">
          <AdditionalFeaturesGrid />
        </div>
      </div>
    </section>
  );
}
