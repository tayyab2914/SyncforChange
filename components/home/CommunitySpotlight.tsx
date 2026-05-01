const FOOD_DRIVE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCdG5bBavTG1iWXoVk_gk7phR1-cUXcYirFuj2eH7cQEMeesK-TbiKfnsiZYfzakIMliS_sWUY8eWuhlgwV0SukzDimc6yXcQ17xGdP5KULekAmxCFuc4bqA31L9CQ189fGynWrW054anOoNDzRRBB3uEEJ5fFyKpRWdiyMY6FUvvS5BrIYUiqoxrMM22jugXeZEiPvDBlpCyPNcMRPNmFzTGF7flqAh6AQ7_qgQYxQ8IAzPCDd2xqsaq5_f1xq4NxX9g_4yQp7PzY";

const MENTOR_AVATAR_A =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDIRaiuZqA3b4FzYs9lhNwmyJNH_W1ZGmHuz51cvKkMGfshcLVdZs9gMn_E_f19bpfm1nvtIcSku3Ln60lPBEULOm0NgCNO1hJ-GuST5EBu9YOolMV6d1vaQ8DWqe7FY9BgkWR4y2DaLCBmfEZDL9D_4zu_40UC_qH-OboKBj-YqUQBBXebBXy7g3lW4gGoF54eZYW3SDBPza2_xOxYmc6lcapn3duhhJh2bZBS2cW2AVNWm_8fDb37iSwTpwzHMi2qjPfW2ULPc3I";

const MENTOR_AVATAR_B =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABs_0WdawJ1J0nH5WzflmNzHuZPxJOrOg7mBOdbb_GlTn2kSKR8xraMonuPhFzT_XENYKZ2-DJHIG_EUalK4UktFFwrcqihexjOz1Ey7NfKfvZpEo-3M1oWbGeiANSsdwlaRB7f2kFGhOxhJDSVdfj0ohHLwusZqxc_9angguwJTE7eyJ53ophx0IICfo2FnOKXgheymA5qVXAIQ5C5VuJ0KbJyQP6pTP10KmS4MzbrHIu9VdLatq6pvw08yrMo2wi91uqcStaL0g";

export default function CommunitySpotlight() {
  return (
    <section className="mt-20">
      <h3 className="text-2xl font-bold mb-10 text-on-surface">
        Community Spotlight
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <FeaturedCard />
        <SecondaryCard />
      </div>
    </section>
  );
}

function FeaturedCard() {
  return (
    <div className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-stone-900 h-[400px]">
      <img
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        src={FOOD_DRIVE_IMAGE}
        alt="Volunteer handing a hot meal to a community member"
      />
      <div className="absolute bottom-0 left-0 p-10 w-full bg-gradient-to-t from-stone-900/90 to-transparent">
        <span className="inline-block px-4 py-1 bg-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
          Urgent Need
        </span>
        <h4 className="text-3xl font-bold text-white mb-2">
          Winter Food Drive 2024
        </h4>
        <p className="text-stone-300 mb-6 max-w-md">
          Help us prepare 500 meals for families in the downtown core. No
          experience necessary.
        </p>
        <div className="flex gap-4">
          <button className="bg-white text-stone-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-secondary hover:text-white transition-colors">
            Volunteer Now
          </button>
          <button className="text-white flex items-center gap-2 font-bold text-sm">
            Details{" "}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SecondaryCard() {
  return (
    <div className="md:col-span-4 bg-surface-container-low rounded-[2.5rem] p-8 flex flex-col justify-between">
      <div>
        <span className="material-symbols-outlined text-4xl text-primary mb-6 block">
          psychology
        </span>
        <h4 className="text-xl font-bold text-on-surface mb-2">
          Youth Mentorship Workshop
        </h4>
        <p className="text-sm text-stone-500 leading-relaxed">
          Join professional mentors for an evening of career guidance and
          storytelling.
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-stone-200 flex justify-between items-center">
        <div className="flex -space-x-3">
          <MentorAvatar src={MENTOR_AVATAR_A} alt="Mentor" />
          <MentorAvatar src={MENTOR_AVATAR_B} alt="Mentor" />
          <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
            +12
          </div>
        </div>
        <span className="text-xs font-bold text-primary">Oct 12th</span>
      </div>
    </div>
  );
}

function MentorAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-8 h-8 rounded-full border-2 border-white bg-stone-200 overflow-hidden">
      <img className="w-full h-full object-cover" src={src} alt={alt} />
    </div>
  );
}
