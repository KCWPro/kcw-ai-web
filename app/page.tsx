import Link from 'next/link';

const trustItems = [
  {
    title: 'Licensed Contractor',
    description: 'California licensed support',
  },
  {
    title: 'Insured Service',
    description: 'Professional coordination',
  },
  {
    title: 'Local Coverage',
    description: 'Greater Los Angeles area',
  },
  {
    title: 'Multilingual Support',
    description: 'English / 中文 / 粵語 / 台山話',
  },
  {
    title: 'Practical Recommendations',
    description: 'Clear next steps',
  },
];

const serviceCards = [
  {
    title: 'Water Heater',
    description: 'Installation, replacement, and related plumbing support.',
  },
  {
    title: 'Leak Repair',
    description: 'Help with visible leaks and hidden plumbing concerns.',
  },
  {
    title: 'Drain Services',
    description: 'Support for clogged drains and drainage issues.',
  },
  {
    title: 'Gas Line Work',
    description: 'Repair, testing coordination, and installation support.',
  },
  {
    title: 'Repipe Services',
    description: 'Water line replacement and long-term plumbing improvement.',
  },
  {
    title: 'Remodel Plumbing',
    description: 'Plumbing support for kitchen, bathroom, and renovation work.',
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
  'Clear communication',
  'Fast response and next steps',
  'Multilingual support',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6 md:py-8">
        <header className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-base font-semibold tracking-tight sm:text-lg">KCW Construction & Plumbing Inc.</p>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Licensed Plumbing & Construction Services
                <span className="ml-2 text-slate-400">专业持牌管道与建筑服务</span>
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <p className="text-xs text-slate-500">English | 中文</p>
              <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-700">
                <a href="#services" className="hover:text-blue-700">
                  Services
                </a>
                <Link href="/request-service" className="hover:text-blue-700">
                  Request Service
                </Link>
                <a href="tel:6265037777" className="hover:text-blue-700">
                  Call Now
                </a>
              </nav>
              <a href="tel:6265037777" className="text-base font-semibold text-blue-700 hover:text-blue-800 sm:text-lg">
                626-503-7777
              </a>
            </div>
          </div>
        </header>

        <section className="mt-5 grid gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:mt-6 md:grid-cols-2 md:gap-10 md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Licensed • Insured • Local Service • Multilingual
            </p>
            <p className="mt-2 text-xs text-slate-500">持牌 · 保险齐全 · 本地服务 · 多语言沟通</p>

            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Plumbing & Construction Help You Can Count On
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Water heater, leak repair, drain, gas line, repipe, and remodel plumbing services for Greater Los
              Angeles properties.
            </p>
            <p className="mt-2 text-xs text-slate-500 sm:text-sm">提供热水器、漏水维修、下水道、煤气管、全屋换管及装修管道服务</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/request-service"
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Request Service 提交申请
              </Link>
              <a
                href="tel:6265037777"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Call Now 立即致电
              </a>
            </div>

            <p className="mt-4 text-base font-semibold text-slate-900">626-503-7777</p>
            <p className="mt-2 text-sm text-slate-600">
              Tell us what&apos;s happening and our team will follow up as soon as possible.
            </p>
            <p className="mt-1 text-xs text-slate-500">告诉我们您的情况，我们会尽快跟进。</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-200 via-slate-100 to-white p-4 sm:p-5">
            <div className="h-full min-h-64 rounded-xl bg-slate-900/90 p-5 text-slate-100 sm:min-h-72">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Greater Los Angeles</p>
              <h2 className="mt-3 text-2xl font-semibold">Professional On-Site Service</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-200">
                Reliable plumbing and construction support with clean communication and practical recommendations.
              </p>
            </div>
            <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow">
              <p className="font-semibold text-slate-900">Fast Response</p>
              <p className="text-slate-600">Clear Next Steps</p>
              <p className="text-slate-600">Request Service Online</p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight">Licensed. Responsive. Clear. Local.</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {trustItems.map((item) => (
              <article key={item.title} className="border-l-2 border-slate-200 pl-3">
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="mt-8">
          <h2 className="text-2xl font-semibold tracking-tight">Core Services</h2>
          <p className="mt-1 text-sm text-slate-500">核心服务</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((service) => (
              <article
                key={service.title}
                className="flex min-h-40 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="text-2xl font-semibold tracking-tight">How It Works</h2>
          <p className="mt-1 text-sm text-slate-500">服务流程 · 联系咨询 → 我们查看需求 → 尽快与您跟进</p>
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

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid md:grid-cols-2 md:gap-10 md:p-7">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Why Customers Choose KCW</h2>
            <p className="mt-1 text-sm text-slate-500">为什么客户选择 KCW</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              We focus on clear communication, practical solutions, and a professional customer experience from the
              first contact to the next step.
            </p>
            <p className="mt-2 text-sm text-slate-500">我们重视清晰沟通、务实建议与专业服务体验。</p>
          </div>
          <ul className="mt-5 grid gap-3 md:mt-0">
            {whyItems.map((item) => (
              <li key={item} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-slate-900 to-blue-900 px-5 py-8 text-white shadow-lg sm:px-6 md:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Need Plumbing or Construction Help?</h2>
          <p className="mt-1 text-sm text-blue-100">需要管道或建筑服务帮助？</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
            Call us now or send a service request online. We&apos;ll review your request and follow up as soon as
            possible.
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
              Request Service 提交申请
            </Link>
          </div>
          <p className="mt-4 text-sm text-blue-100">If your issue is urgent, calling us directly is the fastest option.</p>
          <p className="mt-1 text-xs text-blue-200">如情况紧急，直接致电会更快。</p>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-2 px-4 py-8 text-sm text-slate-600 sm:px-6">
          <p className="font-semibold text-slate-900">KCW Construction & Plumbing Inc.</p>
          <p>Licensed Plumbing & Construction Services</p>
          <p>专业持牌管道与建筑服务</p>
          <p>
            Phone:{' '}
            <a href="tel:6265037777" className="hover:text-blue-700">
              626-503-7777
            </a>
          </p>
          <p>
            Service Request:{' '}
            <Link href="/request-service" className="hover:text-blue-700">
              /request-service
            </Link>
          </p>
          <p>Languages: English / 中文 / 粵語 / 台山話</p>
          <p>© {new Date().getFullYear()} KCW Construction & Plumbing Inc.</p>
        </div>
      </footer>
    </main>
  );
}
