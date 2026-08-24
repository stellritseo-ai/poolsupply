import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { submitContactFormDb } from "@/lib/api/emails.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  ArrowRight,
  Wrench,
  ShoppingBag,
  Truck,
  RotateCcw,
  Users,
  MessageSquare,
  Zap,
  ChevronRight,
  Building2,
  Star,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Pool Supply Wholesalers | Wholesale Pool Equipment Distributor" },
      {
        name: "description",
        content:
          "Contact our wholesale desk for commercial pricing, dealer account activation, same-day freight, or certified technical support. Response guaranteed within 2 business hours.",
      },
      { property: "og:title", content: "Contact Pool Supply Wholesalers Desk" },
      {
        property: "og:description",
        content:
          "Direct support for pool contractors, builders, and service companies. Call (615) 477-0407 or email sales@poolsupplywholesalers.com.",
      },
    ],
  }),
  component: ContactPage,
});

const DEPARTMENTS = [
  {
    val: "dealer",
    label: "Open Commercial Account",
    icon: Users,
    desc: "Register for wholesale trade pricing & contractor terms",
  },
  {
    val: "support",
    label: "Hydraulic Tech Support",
    icon: Wrench,
    desc: "Pump sizing, heater BTUs & total head calculations",
  },
  {
    val: "sales",
    label: "Volume Bids & Quotes",
    icon: ShoppingBag,
    desc: "Commercial job bids, package quotes & volume pricing",
  },
  {
    val: "logistics",
    label: "Freight & Logistics",
    icon: Truck,
    desc: "Live order tracking, freight routing & dispatch status",
  },
  {
    val: "rma",
    label: "Warranty & Returns",
    icon: RotateCcw,
    desc: "Manufacturer warranty registrations and RMA labels",
  },
  {
    val: "general",
    label: "General Inquiry",
    icon: MessageSquare,
    desc: "Account questions and general trade inquiries",
  },
];

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    title: "Direct Trade Hotline",
    value: "(615) 477-0407",
    sub: "Dedicated trade desk — instant pro routing",
    href: "tel:6154770407",
  },
  {
    icon: Mail,
    title: "Wholesale Sales Desk",
    value: "sales@poolsupplywholesalers.com",
    sub: "Send job specs, blueprints, or PO requests",
    href: "mailto:sales@poolsupplywholesalers.com",
  },
  {
    icon: Clock,
    title: "Support Desk Hours",
    value: "Mon – Fri, 8:00 AM – 6:00 PM EST",
    sub: "Same-day freight cutoff at 2:00 PM EST",
    href: null,
  },
  {
    icon: MapPin,
    title: "Central Logistics Hub",
    value: "412 Ezell Pike, Nashville, TN 37217",
    sub: "Will-call dock pickup available upon request",
    href: "https://maps.google.com/?q=412+Ezell+Pike+Nashville+TN+37217",
  },
];

const RESPONSE_STATS = [
  { value: "< 2 hrs", label: "Response SLA" },
  { value: "99.2%", label: "First-Call Resolution" },
  { value: "Mon–Fri", label: "Dedicated Desk" },
  { value: "4 Hubs", label: "Nationwide Support" },
];

function ContactPage() {
  const [subject, setSubject] = useState("dealer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDept = DEPARTMENTS.find((d) => d.val === subject) || DEPARTMENTS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;
    setIsSubmitting(true);
    try {
      const activeDeptObj = DEPARTMENTS.find((d) => d.val === subject);
      const res = await submitContactFormDb({
        data: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          subject: activeDeptObj ? activeDeptObj.label : "Dealer Inquiry",
          message: `${business ? `[Business: ${business.trim()}]\n` : ""}${msg.trim()}`,
        },
      });
      if (res.success) {
        setSent(true);
        toast.success("Your message has been dispatched to the wholesale desk!");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("There was an issue sending your message. Please try calling us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setBusiness("");
    setPhone("");
    setMsg("");
    setSubject("dealer");
    setSent(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1">
        {/* ─── LUXURY HERO SECTION ─── */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-[#040d1a] text-white border-b border-cyan-500/10">
          {/* Background Hero Image */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-65"
            style={{ backgroundImage: "url('/about-hero.png')" }}
          />

          {/* Deep Gradient Overlays for High Legibility */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#040d1a]/80 via-[#040d1a]/60 to-background" />
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#040d1a]/80 via-transparent to-[#040d1a]/80" />

          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-[1]" />

          <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg"
              >
                <Zap className="size-3.5 text-cyan-400" />
                Wholesale Trade Support Desk · 2-Hour Response SLA
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white"
              >
                Speak With a Certified{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
                  Pool Equipment Specialist
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
              >
                Direct assistance for commercial pool builders, service companies, and municipality facilities. Connect directly with licensed CPO technicians and account managers.
              </motion.p>
            </div>
          </div>
        </section>

        {/* ─── LIVE RESPONSE STATS ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {RESPONSE_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-cyan-500/30 hover:shadow-md transition-all text-center flex flex-col justify-center items-center group"
                >
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[11px] font-extrabold text-slate-500 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 4 CONTACT CHANNELS ─── */}
        <section className="py-[50px] bg-slate-50/70 border-t border-slate-200/80">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {CONTACT_CHANNELS.map((ch, i) => {
                const Icon = ch.icon;
                const card = (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-cyan-500/40 hover:shadow-md transition-all flex flex-col justify-between group h-full cursor-pointer"
                  >
                    <div>
                      <div className="size-10 rounded-xl bg-cyan-500/10 text-cyan-700 border border-cyan-500/20 grid place-items-center mb-3 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                        {ch.title}
                      </div>
                      <div className="font-extrabold text-sm text-slate-900 leading-snug group-hover:text-cyan-700 transition-colors">
                        {ch.value}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium">
                        {ch.sub}
                      </div>
                    </div>

                    {ch.href && (
                      <div className="flex items-center gap-1 text-xs font-black text-cyan-700 mt-4 pt-3 border-t border-slate-100">
                        <span>Direct Action</span>
                        <ChevronRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </motion.div>
                );

                return ch.href ? (
                  <a
                    key={ch.title}
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={ch.title}>{card}</div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── MAIN CONTACT FORM + LOGISTICS SIDEBAR ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Contact Form Panel */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Send a Message to the Wholesale Desk
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                    Fill out the form below — all inquiries receive a direct response from a live trade specialist within 2 business hours.
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {!sent ? (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {/* Department Selector */}
                      <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2">
                          Select Topic or Department
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {DEPARTMENTS.map((dept) => {
                            const Icon = dept.icon;
                            const active = subject === dept.val;
                            return (
                              <button
                                key={dept.val}
                                type="button"
                                onClick={() => setSubject(dept.val)}
                                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${active
                                  ? "bg-cyan-50 border-cyan-500 text-cyan-950 font-extrabold shadow-2xs"
                                  : "bg-slate-50/60 border-slate-200/80 text-slate-600 hover:bg-slate-100 font-bold"
                                  }`}
                              >
                                <Icon className={`size-4 shrink-0 ${active ? "text-cyan-600" : "text-slate-400"}`} />
                                <span className="text-[11px] truncate leading-tight">{dept.label}</span>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-cyan-700 font-semibold mt-2">
                          • {activeDept.desc}
                        </p>
                      </div>

                      {/* Name & Company */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Your Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Marcus Vance"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Business / Contractor Name
                          </label>
                          <input
                            type="text"
                            value={business}
                            onChange={(e) => setBusiness(e.target.value)}
                            placeholder="e.g. Apex Pool Builders"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="marcus@company.com"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                            Direct Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="(615) 000-0000"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                          Message & Equipment Specifications <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={msg}
                          onChange={(e) => setMsg(e.target.value)}
                          placeholder="Describe your equipment sizing question, requested SKU quantities, or project details..."
                          className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-black text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            <span>Dispatching to Trade Desk...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-4" />
                            <span>Dispatch Message to Wholesale Desk</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="sent"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-8 text-center space-y-4 bg-cyan-50/50 rounded-2xl border border-cyan-200"
                    >
                      <div className="size-16 rounded-full bg-cyan-600 text-white grid place-items-center mx-auto shadow-lg">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Message Successfully Dispatched</h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                        Thank you, <strong>{name}</strong>. A wholesale specialist from our{" "}
                        <strong>{activeDept.label}</strong> department will contact you at{" "}
                        <strong>{email}</strong> within 2 business hours.
                      </p>
                      <button
                        onClick={resetForm}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        Send Another Inquiry
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Hub & Map Showcase */}
              <div className="lg:col-span-5 space-y-5">
                {/* Embedded Map Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-cyan-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Nashville Central Hub
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
                      Active Facility
                    </span>
                  </div>

                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[220px] sm:h-[260px] w-full">
                    <iframe
                      title="Pool Supply Wholesalers Nashville HQ"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.275811776918!2d-86.69176372346766!3d36.12328570560249!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88646f88998d3b87%3A0xc3b838c6d1d4d168!2s412%20Ezell%20Pike%2C%20Nashville%2C%20TN%2037217!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full grayscale-[0.1] contrast-[1.05]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                    <span>412 Ezell Pike, Nashville, TN 37217</span>
                    <a
                      href="https://maps.google.com/?q=412+Ezell+Pike+Nashville+TN+37217"
                      target="_blank"
                      rel="noreferrer"
                      className="font-extrabold text-cyan-700 hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Directions</span>
                      <ChevronRight className="size-3" />
                    </a>
                  </div>
                </div>

                {/* 4 Distribution Hubs List */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                    <Truck className="size-4 text-cyan-600" />
                    <span>4 Regional Distribution Hubs</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { city: "Nashville, TN", role: "Central HQ Hub", lead: "1-Day Regional Lead" },
                      { city: "Los Angeles, CA", role: "West Coast Hub", lead: "1-2 Day Transit" },
                      { city: "Dallas, TX", role: "Southwest Hub", lead: "1-2 Day Transit" },
                      { city: "Orlando, FL", role: "Southeast Hub", lead: "1-Day Transit" },
                    ].map((hub) => (
                      <div
                        key={hub.city}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs"
                      >
                        <div>
                          <div className="font-extrabold text-slate-900">{hub.city}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{hub.role}</div>
                        </div>
                        <span className="text-[10px] font-black text-cyan-800 bg-cyan-100/60 px-2 py-0.5 rounded-md">
                          {hub.lead}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── TRADE CTA BANNER ─── */}
        <section className="py-[50px] bg-background">
          <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-[#061220] via-[#091f38] to-[#040d1a] border border-cyan-500/20 p-6 sm:p-12 text-white shadow-[0_25px_70px_-20px_rgba(0,109,171,0.35)] text-center"
            >
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-widest shadow-lg">
                  <Sparkles className="size-3.5" />
                  Ready to Start?
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                  Open a Commercial Dealer Account Today
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Instant trade registration with zero account setup fees. Unlock wholesale trade pricing on over 8,000+ factory SKUs.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <a
                    href="tel:6154770407"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(6,182,212,0.35)] hover:scale-105 transition-all duration-200 cursor-pointer"
                  >
                    <Phone className="size-4" />
                    <span>Call (615) 477-0407</span>
                  </a>

                  <Link
                    to="/shop/$category"
                    params={{ category: "all" }}
                    search={{ q: "" }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold text-xs sm:text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span>Browse 8,000+ SKUs</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
