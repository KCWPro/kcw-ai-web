const trustItems = [
  { label: "License", value: "#1129463" },
  { label: "Phone", value: "626-503-7777", href: "tel:6265037777" },
  { label: "Email", value: "kcwpro7777@gmail.com", href: "mailto:kcwpro7777@gmail.com" },
  { label: "Service Area", value: "Greater Los Angeles" },
];

const services = [
  {
    title: "Plumbing Repairs",
    description:
      "Fast diagnosis and reliable repair for leaks, fixtures, and everyday plumbing issues.",
  },
  {
    title: "Water Line Installation",
    description:
      "Safe, code-conscious installation and replacement for residential and light commercial water lines.",
  },
  {
    title: "Drain Cleaning",
    description:
      "Targeted clearing and preventive maintenance to restore flow and reduce recurring clogs.",
  },
  {
    title: "Water Heater Installation",
    description:
      "Professional tank and tankless water heater installation with proper setup and testing.",
  },
  {
    title: "Gas Line Work",
    description:
      "Careful gas line installation and repair performed with licensed, safety-first discipline.",
  },
  {
    title: "Remodeling / Construction",
    description:
      "Integrated construction and plumbing support for renovation projects from rough-in to finish.",
  },
];

const advantages = [
  {
    icon: "🛡️",
    title: "Licensed & Professional",
    text: "California licensed team with disciplined, review-first execution.",
  },
  {
    icon: "⚡",
    title: "Fast Response",
    text: "Prompt scheduling and clear communication to keep your project moving.",
  },
  {
    icon: "🌐",
    title: "Bilingual Communication",
    text: "English / 中文 service for smooth coordination from start to finish.",
  },
  {
    icon: "📍",
    title: "Trusted Local Service",
    text: "Focused on Greater Los Angeles with practical local experience.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-8 md:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-14 text-white shadow-2xl md:px-12 md:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-1 text-xs font-semibold tracking-wide text-blue-100">
              Professional Plumbing & Construction · Southern California
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              KCW Construction & Plumbing Inc.
            </h1>

            <p className="mt-5 text-lg text-blue-100 md:text-xl">
              Licensed Plumbing & Construction Service
            </p>
            <p className="mt-1 text-base text-slate-200">
              Bilingual Service (English / 中文)
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="tel:6265037777"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100"
              >
                Call Now
              </a>
              <a
                href="tel:6265037777"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Get Free Quote
              </a>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Company Trust
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => (
              <article
                key={item.label}
                className="flex min-h-[118px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block text-lg font-semibold leading-snug text-slate-900 break-keep whitespace-nowrap hover:text-blue-700"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-lg font-semibold leading-snug text-slate-900 break-keep">
                    {item.value}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Services
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="flex h-full min-h-[188px] flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-px hover:shadow"
              >
                <h3 className="text-lg font-semibold leading-snug text-slate-900">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Why Choose KCW
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {advantages.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex items-start gap-3 text-left">
                  <span className="mt-0.5 text-2xl" aria-hidden>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug text-slate-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-900 to-slate-900 px-6 py-10 text-white shadow-xl md:px-10 md:py-12">
          <h2 className="text-3xl font-semibold tracking-tight">
            Ready to start your project?
          </h2>
          <p className="mt-3 max-w-2xl text-base text-blue-100 md:text-lg">
            Call KCW today for fast, licensed service in Greater Los Angeles.
          </p>
          <a
            href="tel:6265037777"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Call Now
          </a>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-8 gap-y-2 px-6 py-8 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-5 lg:items-center">
          <p className="font-semibold text-slate-900">
            KCW Construction & Plumbing Inc.
          </p>
          <p>开诚建筑管道工程公司</p>
          <p>License #1129463</p>
          <a href="tel:6265037777" className="whitespace-nowrap hover:text-blue-700">
            626-503-7777
          </a>
          <a
            href="mailto:kcwpro7777@gmail.com"
            className="break-keep whitespace-nowrap hover:text-blue-700"
          >
            kcwpro7777@gmail.com
          </a>
        </div>
      </footer>
    </main>
  );
}
