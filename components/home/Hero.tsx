const BG_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCa3-w2unuI9oYnx7BFIa8ZFuwDHUw8_QoJsoNDXRnphJrsNSS7aMHdBPghuavQXLxhjNFQL-6i9iPkjpXS5XhbW5LC7JIZHstPQGMJCUSWhMcEj-SZ4H0AJAGzRImtZ5fTl3vzg6tNwx2rmr0UWkf2f_eGvUFTsJUHwRe7xVWL8CMdcrNC7fwTlXcITnXvKtMWlVMGoD1e7IAe4q3czqkV9ei0SbhM0PknwPC8exofoVpvB0P4gVlcZufI9LZ_uziDWpiKdjCJp-g";

export default function Hero() {
  return (
    <section className="mb-12">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-surface-container-low p-12 lg:p-20 flex flex-col items-center text-center">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
          aria-hidden="true"
        />
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tighter text-on-surface mb-6 relative z-10">
          Discover &amp; Support Community
          <br className="hidden lg:block" /> Events Near You.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed relative z-10">
          Connecting passionate people with the organizations that matter. Find
          your next opportunity to give back, learn, and grow together.
        </p>
      </div>
    </section>
  );
}
