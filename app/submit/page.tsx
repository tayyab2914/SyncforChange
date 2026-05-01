import EventSubmitForm from "@/components/submit/EventSubmitForm";
import Image from "next/image";

export default function SubmitPage() {
  return (
    <main className="pt-24 md:pt-32 pb-20 px-4 md:px-6 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="mb-10 md:mb-16 space-y-3 md:space-y-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter text-on-surface leading-tight">
          Share your <br />
          <span className="text-primary italic">community&apos;s pulse.</span>
        </h1>
        <p className="text-stone-500 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
          Add your story to the Living Journal. Submissions are curated and
          reviewed before publishing to maintain the quality of our collective
          narrative.
        </p>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Form — 7 cols */}
        <div className="lg:col-span-7">
          <EventSubmitForm />
        </div>

        {/* Sidebar — 5 cols */}
        <aside className="lg:col-span-5 space-y-10 lg:sticky lg:top-32">
          {/* Guidelines card */}
          <div className="bg-surface-container-low rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h3 className="text-2xl font-bold tracking-tight">
                Submission Guidelines
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    verified_user
                  </span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Community Centered
                    </p>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">
                      Events must have a clear nonprofit or community-building
                      purpose.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-secondary mt-0.5">
                    schedule
                  </span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Timeline Integrity
                    </p>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">
                      Submit at least 7 days before the event start date.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-4">
                  <span className="material-symbols-outlined text-tertiary mt-0.5">
                    palette
                  </span>
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      Visual Quality
                    </p>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">
                      High-resolution flyers or photos help increase engagement
                      by 40%.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="h-48 rounded-2xl overflow-hidden mt-8 relative">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhd8EpiVrIlVcbWm35y8NLfon1PeUXqmgiSWGW4SAbUzhIxpSReA9UAya5WHDhhjD9Fl6OvVLzlt5x06wR3kwJH15JY5gAAJ5B_NqoeQWXYh8-d27sU6I2At2Yohd6TnbcDIJXHc6uIj1erg1mqkDyVmMWlOUUSqGW0mxSuYO5BFGoOe0CKezXEmIQ44Wg761ax_79zanOXVLXQS4n2eEQ1RjKolkCuFtCafOf5psjHC51GexpfDeNTMIX4CJ4H06ZSGNmgbzSZ6M"
                alt="Community gathering"
                fill
                className="object-cover grayscale opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
            </div>
          </div>

          {/* Latest spotlight card */}
          <div className="p-8 border-l-4 border-primary bg-surface-container-lowest shadow-sm rounded-r-3xl">
            <span className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-primary mb-3 block">
              Latest Spotlight
            </span>
            <h4 className="font-bold text-lg leading-tight mb-2">
              The Urban Harvest Festival
            </h4>
            <p className="text-sm text-stone-500 leading-relaxed">
              Last month, the East Side community came together to celebrate
              their first vertical farm harvest. Your event could be the next
              highlight.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
