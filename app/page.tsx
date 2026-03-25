import Link from 'next/link';

const trustItems = [
  {
    title: 'Licensed Contractor',
    description: 'California licensed plumbing and construction support',
  },
  {
    title: 'Insured Service',
    description: 'Professional coordination and service communication',
  },
  {
    title: 'Local Service Support',
    description: 'Serving Greater Los Angeles properties',
  },
  {
    title: 'Multilingual Support',
    description: 'English / 中文 / 粵語 / 台山話',
  },
  {
    title: 'Practical Recommendations',
    description: 'Clear next steps based on the actual issue',
  },
];

const serviceCards = [
  {
    title: 'Water Heater Services',
    description: 'Installation, replacement, and related plumbing support.',
  },
  {
    title: 'Leak Detection & Repair',
    description: 'Help with visible leaks, hidden plumbing concerns, and repair recommendations.',
  },
  {
    title: 'Drain Cleaning & Unclogging',
    description: 'Support for clogged drains and drainage issues with clear follow-up guidance.',
  },
  {
    title: 'Gas Line Repair & Installation',
    description: 'Gas line related service support, repairs, testing coordination, and installation work.',
  },
  {
    title: 'Repipe Services',
    description: 'Water line replacement and repipe support for long-term plumbing improvement.',
  },
  {
    title: 'Remodel Plumbing',
    description: 'Plumbing work for kitchen, bathroom, and renovation-related projects.',
  },
];

const steps = [
  {
    title: 'Tell Us What You Need',
    description: 'Call us or send a service request online.',
  },
  {
    title: 'We Review the Request',
    description: 'We look at the issue details and prepare the next step.',
  },
  {
    title: 'We Follow Up',
    description: 'Our team contacts you to discuss service details and scheduling.',
  },
];

const whyItems = [
  'Licensed and insured',
  'Fast response and clear next steps',
  'Honest recommendations based on actual needs',
  'Multilingual communication',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-12">
        <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:gap-10 md:p-10">
          <div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Licensed Plumbing & Construction Services for Los Angeles Properties
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Water heater, leak repair, drain, gas line, repipe, and remodel plumbing services with clear
              communication and responsive local support.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {['Licensed', 'Insured', 'Fast Response', 'Multilingual'].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {badge}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request-service"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Request Service
              </Link>
              <a
                href="tel:6265037777"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Call 626-503-7777
              </a>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Serving Greater Los Angeles area homeowners, businesses, and property owners.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-white to-slate-200 p-5">
            <div className="h-full rounded-xl bg-slate-900/95 p-6 text-slate-100">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">Local Service Focus</p>
              <h2 className="mt-3 text-2xl font-semibold">Professional Plumbing Support</h2>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Clean, practical service for water heater work, leak repair, drain issues, gas line support, and
                remodel plumbing needs.
              </p>
              <div className="mt-6 space-y-2 rounded-xl border border-white/20 bg-white/5 p-4 text-sm">
                <p>• Water heater installation and replacement</p>
                <p>• Drain and leak issue support</p>
                <p>• Repipe and remodel plumbing coordination</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Licensed. Responsive. Clear. Local.</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            {trustItems.map((item) => (
              <article key={item.title} className="border-l-2 border-slate-200 pl-4">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold tracking-tight">Core Services</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <article key={service.title} className="flex min-h-44 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">How to Get Started</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <article key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">Step {index + 1}</p>
                <h3 className="mt-2 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid md:grid-cols-2 md:gap-10 md:p-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Why Homeowners and Property Owners Choose KCW</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              We focus on clear communication, practical solutions, and a professional customer experience from the
              first contact to the next step.
            </p>
          </div>
          <ul className="mt-5 space-y-3 md:mt-0">
            {whyItems.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Serving Greater Los Angeles Area</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            We provide plumbing and construction service support for customers across the Greater Los Angeles area and
            nearby communities.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Not sure if your property is within our service area? Contact us and we&apos;ll help confirm the next step.
          </p>
        </section>

        <section className="mt-10 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 to-slate-900 px-6 py-10 text-white shadow-lg md:px-10">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Need Plumbing or Construction Help?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Call us now or send a service request online. Tell us what&apos;s happening and our team will review your
            request as soon as possible.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href="tel:6265037777"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Call 626-503-7777
            </a>
            <Link
              href="/request-service"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Request Service
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-100">If your issue is urgent, calling us directly is the fastest option.</p>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-2 px-5 py-8 text-sm text-slate-600 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
          <p className="font-semibold text-slate-900">KCW Construction & Plumbing Inc.</p>
          <p>License #1129463</p>
          <a href="tel:6265037777" className="hover:text-blue-700">
            626-503-7777
          </a>
          <Link href="/request-service" className="hover:text-blue-700">
            kcwplumbingla.com / request service
          </Link>
          <p>English / 中文 / 粵語 / 台山話</p>
          <p>© {new Date().getFullYear()} KCW Construction & Plumbing Inc.</p>
        </div>
      </footer>
    </main>
  );
}
