import React from 'react';
import { Card } from '../components/ui';
import { Calendar, User, ArrowRight, Shield } from 'lucide-react';

const POSTS = [
  {
    title: "AI & Clinical Intelligence: The Future of Pediatric Diagnosis in 2025",
    excerpt: "Artificial intelligence is no longer science fiction. Research from early 2025 shows AI-enhanced monitoring can identify pediatric respiratory issues with 94% accuracy via smartphone audio.",
    date: "April 2025",
    author: "Clinical Operations",
    category: "Future of Health"
  },
  {
    title: "Telemedicine Trends for 2025: Why Modern Parents Choose Virtual Care",
    excerpt: "New research indicates over 90% of parents prefer hybrid care models. Discover how immediate access to pediatric specialists is reducing household stress and improving clinical outcomes.",
    date: "April 2025",
    author: "Cedexx Clinical Team",
    category: "Research-Backed Care"
  },
  {
    title: "The Financial Impact: How Virtual Visits Save Families Hundreds Annually",
    excerpt: "Urgent care wait times aren't just frustrating; they're expensive. Learn how one membership eliminates co-pays and hidden fees while providing military-grade security.",
    date: "March 2025",
    author: "Business Operations",
    category: "Healthcare Economics"
  },
  {
    title: "Managing Pediatric Chronic Conditions via Digital Platforms",
    excerpt: "From asthma to developmental monitoring, virtual check-ins are proving highly effective for consistent monitoring without disrupting your child's school or home routine.",
    date: "February 2025",
    author: "Pediatric Specialists",
    category: "Wellness Insights"
  },
  {
    title: "Healthy Living Tips: Staying Hydrated in the Miami Heat",
    excerpt: "As we move into the warmer months, staying hydrated is about more than just drinking water. Learn the signs of heat exhaustion and when to connect with a physician.",
    date: "January 2025",
    author: "Cedexx Wellness Team",
    category: "Healthy Living"
  },
  {
    title: "Telemedicine: A Parent's Guide to 24/7 Care",
    excerpt: "How to maximize your digital consults for pediatric needs. Prepare for your first appointment and get the most out of your membership.",
    date: "December 2024",
    author: "Clinical Operations",
    category: "User Guides"
  }
];

export function Blog() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-[#050249] selection:text-white">
      <section className="bg-[#050249] text-white py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full -top-24 -left-24 h-64 w-64" />
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h1 className="text-3xl md:text-5xl font-black mb-10 leading-[1.1] tracking-tighter italic uppercase underline decoration-[#23d9b0] decoration-8 underline-offset-8">Health Blog</h1>
          <p className="text-base md:text-xl text-blue-100/80 font-medium leading-relaxed max-w-2xl mx-auto italic">
            Professional healthcare research, monthly wellness tips, and industry insights for the modern era.
          </p>
        </div>
      </section>

      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {POSTS.map((post, idx) => (
              <Card key={idx} className="p-0 overflow-hidden bg-white border-none shadow-2xl rounded-[3rem] group">
                <div className="p-12">
                   <div className="flex items-center gap-4 mb-8">
                      <span className="bg-blue-50 text-blue-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">{post.category}</span>
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{post.date}</span>
                   </div>
                   <h2 className="text-3xl font-black text-[#050249] mb-6 leading-tight group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">{post.title}</h2>
                   <p className="text-slate-500 font-medium leading-relaxed mb-10 text-lg">
                      {post.excerpt}
                   </p>
                   <div className="flex items-center justify-between pt-10 border-t border-slate-50">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                            <User className="h-5 w-5" />
                         </div>
                         <span className="text-sm font-black text-[#050249] uppercase tracking-widest">{post.author}</span>
                      </div>
                      <button title="Read full post" className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-[#050249] group-hover:text-white transition-all shadow-sm">
                         <ArrowRight className="h-6 w-6" />
                      </button>
                   </div>
                </div>
                
                {/* Embedded Disclaimer for Blog */}
                <div className="bg-slate-900 p-6 flex items-center gap-4 border-t border-white/5">
                   <Shield className="h-4 w-4 text-blue-400 opacity-50" />
                   <p className="text-[10px] text-blue-200/40 uppercase tracking-widest font-black italic uppercase">
                     Legal Disclaimer: CEDEXX provides a digital platform connecting users to healthcare. We do not provide medical care directly.
                   </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-32 max-w-4xl mx-auto p-12 bg-white/50 backdrop-blur-md rounded-[3rem] border border-slate-100 text-center">
             <h3 className="text-2xl font-black text-[#050249] mb-6 uppercase italic">Important Notice</h3>
             <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto italic">
                Articles on this blog are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
             </p>
          </div>
        </div>
      </section>

      {/* Global Newsletter Strip */}
      <section className="py-32 bg-[#050249] text-white">
        <div className="container mx-auto px-6 text-center">
           <h2 className="text-4xl md:text-7xl font-black mb-10 tracking-tighter italic uppercase">Stay Informed.</h2>
           <p className="text-xl text-blue-200/80 mb-12 max-w-xl mx-auto font-medium">Join our mailing list for monthly wellness tips delivered to your inbox.</p>
           <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input type="email" placeholder="Email address" className="flex-1 bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              <button className="bg-white text-[#050249] font-black px-9 py-3 rounded-2xl hover:scale-105 transition-all shadow-2xl text-sm">Subscribe</button>
           </form>
        </div>
      </section>
    </div>
  );
}