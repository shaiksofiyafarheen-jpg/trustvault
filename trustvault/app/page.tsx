
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <h1 className="text-2xl font-bold text-cyan-400">
          TrustVault
        </h1>

        <div className="flex gap-6 items-center">
          <a href="#features" className="text-gray-300">
            Features
          </a>
          <a href="#about" className="text-gray-300">
            About
          </a>
          <button className="rounded-lg bg-cyan-400 px-5 py-2 font-semibold text-slate-950">
            Get Started
          </button>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-8 py-24 md:grid-cols-2">
        <div>
          <p className="mb-5 font-semibold tracking-widest text-cyan-400">
            SECURITY · PRIVACY · TRUST
          </p>

          <h2 className="text-5xl font-bold leading-tight md:text-6xl">
            Your Digital World,
            <span className="text-cyan-400">
              {" "}Safely Secured.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-lg leading-8 text-gray-400">
            TrustVault helps you protect what matters with a
            smarter, simpler, and more secure digital experience.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#features"
              className="rounded-lg bg-cyan-400 px-6 py-3 font-bold text-slate-950"
            >
              Explore Features →
            </a>

            <a
              href="#about"
              className="rounded-lg border border-white/20 px-6 py-3"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-400/20 bg-slate-900 p-10 text-center shadow-2xl shadow-cyan-950">
          <div className="text-7xl">🔐</div>
          <h3 className="mt-6 text-3xl font-bold">
            Your Trust. Your Vault.
          </h3>
          <p className="mt-4 text-gray-400">
            A safer space for your digital life.
          </p>

          <div className="mt-8 rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="text-sm text-gray-400">
              Security status
            </p>
            <p className="mt-2 font-semibold text-cyan-400">
              Privacy-first experience
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="px-8 py-16">
        <h2 className="text-center text-3xl font-bold">
          Built Around Your Trust
        </h2>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              icon: "🛡️",
              title: "Security First",
              text: "Designed with protection and privacy in mind.",
            },
            {
              icon: "🔒",
              title: "Privacy Focused",
              text: "Keep your digital experience private and controlled.",
            },
            {
              icon: "⚡",
              title: "Simple Experience",
              text: "A clean, modern interface that's easy to use.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-slate-900 p-7"
            >
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="mt-5 text-xl font-bold">
                {feature.title}
              </h3>
              <p className="mt-3 leading-7 text-gray-400">
                {feature.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="px-8 py-16 text-center">
        <h2 className="text-3xl font-bold">About TrustVault</h2>
        <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-400">
          Our goal is to make digital security easier to understand
          and accessible through a simple, trustworthy experience.
        </p>
      </section>

      <footer className="border-t border-white/10 px-8 py-6 text-center text-sm text-gray-500">
        © 2026 TrustVault. All rights reserved.
      </footer>
    </main>
  );
}
