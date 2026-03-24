import Link from 'next/link';

const trustCards = [
  {
    title: 'Licensed Contractor',
    description:
      'California licensed plumbing and construction service support for residential and commercial needs.',
  },
  {
    title: 'Insured Service',
    description:
      'Work handled with professionalism, clear communication, and proper job coordination.',
  },
  {
    title: 'Greater Los Angeles Service Area',
    description:
      'Serving nearby homeowners, property owners, and businesses across the Los Angeles area.',
  },
  {
    title: 'Multilingual Communication',
    description: 'English, Mandarin, Cantonese, and Taishanese support available.',
  },
  {
    title: 'Honest Recommendations',
    description:
      'Clear explanations and practical options based on the actual issue.',
  },
  {
    title: 'Responsive Support',
    description:
      'We aim to review requests promptly and help you understand the next step.',
  },
];

const serviceCards = [
  {
    title: 'Water Heater Services',
    description:
      'Installation, replacement, and related plumbing work for residential and light commercial properties.',
  },
  {
    title: 'Leak Detection & Repair',
    description:
      'Help with visible leaks, hidden plumbing concerns, and practical repair recommendations.',
  },
  {
    title: 'Drain Cleaning & Unclogging',
    description:
      'Support for clogged drains and drainage issues with clear follow-up recommendations.',
  },
  {
    title: 'Gas Line Repair & Installation',
    description:
      'Gas line related service support, repairs, testing coordination, and installation work as needed.',
  },
  {
    title: 'Repipe Services',
    description:
      'Water line replacement and repipe support for homes needing long-term plumbing improvement.',
  },
  {
    title: 'Remodel Plumbing',
    description:
      'Plumbing work for kitchen, bathroom, and renovation-related projects.',
  },
];

const chooseUsItems = [
  'Licensed and insured',
  'Fast response and clear next steps',
  'Honest recommendations based on actual needs',
  'Multilingual communication',
  'Reliable support for plumbing and construction work',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 md:py-12">
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-5 py-10 text-white shadow-xl sm:px-8 md:px-12 md:py-16">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-100">
            KCW Construction & Plumbing Inc.
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Trusted Plumbing Help in Greater Los Angeles
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-blue-100 sm:text-base md:text-lg">
            Licensed and insured support for water heaters, leaks, drains, gas lines, repipes, and remodel plumbing.
          </p>
          <p className="mt-4 text-sm font-medium text-slate-200">
            Licensed • Insured • Fast Response • English / 中文 / 粵語 / 台山話
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="tel:6265037777"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
            >
              Call 626-503-7777
            </a>
            <Link
              href="/request-service"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Request Service Online
            </Link>
          </div>

          <p className="mt-4 max-w-2xl text-sm text-blue-100">
            Call now for urgent issues, or submit the Request Service form in about 1-2 minutes.
          </p>

          <div className="mt-6 max-w-3xl rounded-xl border border-amber-300/50 bg-amber-200/10 px-4 py-3 text-xs text-amber-100 sm:text-sm">
            <p className="font-semibold uppercase tracking-wide text-amber-200">Controlled Internal Beta Notice</p>
            <p className="mt-1">
              Our internal workflow platform remains in controlled Beta. Customer service requests are actively
              reviewed by our team.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Why Customers Trust KCW</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Core Services</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <article key={service.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
                <Link href="/request-service" className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                  Request Service →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Why Homeowners and Property Owners Choose KCW</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            We focus on clear communication, practical solutions, and a professional customer experience from the
            first contact to the next step.
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            {chooseUsItems.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Serving Greater Los Angeles Area</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            We provide plumbing and construction service support for customers across the Greater Los Angeles area and
            nearby communities.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            If you are unsure whether your property is within our service area, contact us and we&apos;ll help confirm the
            next step.
          </p>
        </section>

        <section className="mt-12 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 to-slate-900 px-6 py-10 text-white shadow-xl md:px-10 md:py-12">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Need Plumbing or Construction Help?</h2>
          <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
            Call us now or send a Request Service form online. We review every request and follow up as soon as
            possible.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="tel:6265037777"
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Call 626-503-7777
            </a>
            <Link
              href="/request-service"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/45 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Request Service Online
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
            Request Service
          </Link>
          <p>English / 中文 / 粵語 / 台山話</p>
          <p>© {new Date().getFullYear()} KCW Construction & Plumbing Inc.</p>
        </div>
      </footer>
    </main>
  );
}
