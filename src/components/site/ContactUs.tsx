import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Clock,
  ShieldCheck,
  User,
  HelpCircle,
  Building2,
  Headphones,
} from "lucide-react";
import { submitContactFormDb } from "@/lib/api/emails.functions";

export function ContactUs() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim() || "Website Visitor";
      const res = await submitContactFormDb({
        data: {
          name,
          email: email.trim(),
          subject,
          message: message.trim(),
        },
      });

      if (res.success) {
        setSent(true);
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
      } else {
        setErrorMsg(res.error || "Failed to send message.");
      }
    } catch (err: any) {
      setErrorMsg("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-[50px] bg-gradient-to-b from-white via-surface to-white relative overflow-hidden font-sans border-y border-slate-200/60">
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-800 text-[11px] font-extrabold uppercase tracking-widest shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600" />
            </span>
            Direct Wholesale Support
          </span>

          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-slate-900 tracking-tight leading-tight">
            Let's Build Something Great Together
          </h2>

          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
            Need immediate assistance with commercial bids, equipment sizing, or pallet dispatch? Our master technicians and trade reps respond within hours.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-3"
          >
            {/* Headquarters Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-400/50 transition-all duration-200 flex items-center gap-3.5 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/80 text-cyan-700 grid place-items-center group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0 shadow-2xs">
                <MapPin className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-slate-400">Corporate & Fulfillment</span>
                  <span className="text-[9.5px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/60">
                    Nashville Hub
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Headquarters</h3>
                <p className="text-[11px] text-slate-500 leading-tight">
                  412 Ezell Pike, Nashville, TN 37217
                </p>
              </div>
            </div>

            {/* Phone Support Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-400/50 transition-all duration-200 flex items-center gap-3.5 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/80 text-cyan-700 grid place-items-center group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0 shadow-2xs">
                <Phone className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-slate-400">Contractor Direct Line</span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Support
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Call Our Technicians</h3>
                <a
                  href="tel:6154770407"
                  className="inline-block text-xs sm:text-[13px] font-black text-cyan-700 hover:text-cyan-800 hover:underline"
                >
                  (615) 477-0407 <span className="text-[10px] text-slate-400 font-normal ml-1">Mon–Fri 8am-6pm EST</span>
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-400/50 transition-all duration-200 flex items-center gap-3.5 group">
              <div className="size-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/80 text-cyan-700 grid place-items-center group-hover:bg-cyan-600 group-hover:text-white transition-all shrink-0 shadow-2xs">
                <Mail className="size-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[9.5px] uppercase font-extrabold tracking-widest text-slate-400">Electronic Helpdesk</span>
                  <span className="text-[9.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    &lt; 30m Response
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">Email Sales & Specs</h3>
                <a
                  href="mailto:sales@poolsupplywholesalers.com"
                  className="inline-block text-[11px] sm:text-xs font-black text-cyan-700 hover:text-cyan-800 hover:underline truncate max-w-full"
                >
                  sales@poolsupplywholesalers.com
                </a>
              </div>
            </div>

            {/* Google Map Card */}
            <div className="relative w-full h-[220px] sm:h-[260px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.520448259695!2d-86.69468902381284!3d36.08055617246101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88646e0fa8014881%3A0xc3c5f590cc32ef8a!2s412%20Ezell%20Pike%2C%20Nashville%2C%20TN%2037217!5e0!3m2!1sen!2sus!4v1717616110992!5m2!1sen!2sus"
                className="absolute inset-0 w-full h-full border-0 contrast-[1.02]"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>

          {/* Right Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 bg-white rounded-[2rem] p-5 sm:p-8 border border-slate-200/90 shadow-md relative overflow-hidden"
          >
            {/* Subtle Ambient Glow */}
            <div className="absolute top-0 right-0 size-64 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Send Us a Direct Message</h3>
                <p className="text-xs text-slate-400 mt-0.5">Fill out your inquiry and a dedicated pool tech will respond promptly.</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                <ShieldCheck className="size-3 text-emerald-600" /> SSL Secured
              </span>
            </div>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-[2rem] p-8 text-center space-y-4">
                <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
                <h4 className="text-xl font-black text-slate-900">Message Received!</h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Pool Supply Wholesalers. A support ticket has been created and assigned to one of our product specialists.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-cyan-600 transition cursor-pointer shadow-md"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {errorMsg && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <User className="size-3.5 text-cyan-600" />
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                      placeholder="John"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <User className="size-3.5 text-cyan-600" />
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Mail className="size-3.5 text-cyan-600" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-400"
                    placeholder="john@contractorpools.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <HelpCircle className="size-3.5 text-cyan-600" />
                    Subject
                  </label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all cursor-pointer"
                  >
                    <option>General Inquiry</option>
                    <option>Order Support & Tracking</option>
                    <option>Wholesale Trade Account</option>
                    <option>Equipment Sizing & Spec Assistance</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="size-3.5 text-cyan-600" />
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-50/80 rounded-xl p-4 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-none placeholder:text-slate-400"
                    placeholder="Provide details about equipment, model numbers, or project specifications..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 sm:py-4 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin text-cyan-400" /> Submitting Request...
                    </>
                  ) : (
                    <>
                      <Send className="size-4" /> Send Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
