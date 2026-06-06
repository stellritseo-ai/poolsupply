import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Pool Supply Wholesalers" },
      { name: "description", content: "Contact our technical support, sales, or logistics desk. Authorized wholesale support for registered pool builders and technicians." }
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [subject, setSubject] = useState("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !msg.trim()) return;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-16 mb-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Dealer Support</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight leading-none">Contact Our Desk</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Get in touch with technical hydraulic advising, check order delivery status, or finalize your trade account registration.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
            {/* Contact Form */}
            <div className="bg-white rounded-[2rem] border border-border p-8 shadow-[var(--shadow-soft)]">
              <AnimatePresence mode="wait">
                {!sent ? (
                  <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-5"
                  >
                    <h2 className="text-xl font-bold tracking-tight text-foreground">Send Message</h2>
                    
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Subject Department</span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: "support", label: "Technical Support" },
                          { val: "sales", label: "Dealer Sales" },
                          { val: "logistics", label: "Shipping/Logistics" },
                          { val: "rma", label: "Return RMA Request" },
                        ].map((d) => (
                          <button
                            key={d.val}
                            type="button"
                            onClick={() => setSubject(d.val)}
                            className={`py-3 rounded-xl border text-xs font-bold transition-all active:scale-[0.98] ${
                              subject === d.val
                                ? "bg-gradient-ocean border-primary text-white font-extrabold"
                                : "bg-surface border-border hover:bg-muted text-foreground/75"
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Your Name</span>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Business / Dealer Name (optional)</span>
                        <input
                          type="text"
                          value={business}
                          onChange={(e) => setBusiness(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Phone Number (optional)</span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1.5">Your Message Details</span>
                      <textarea
                        required
                        rows={6}
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        placeholder="Detail your request..."
                        className="w-full p-4 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition resize-none"
                      />
                    </label>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-full bg-gradient-ocean text-white font-semibold flex items-center justify-center gap-1.5 shadow-[var(--shadow-float)] hover:opacity-95 transition-all duration-300 active:scale-[0.99]"
                    >
                      <Send className="size-4" /> Send Message
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12 space-y-4"
                  >
                    <CheckCircle className="size-16 text-emerald-500 mx-auto animate-bounce" />
                    <h2 className="text-2xl font-black text-foreground">Message Sent Successfully!</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Thank you for contacting Pool Supply Wholesalers. One of our technical advisors or account managers will reach out to you within 2 business hours.
                    </p>
                    <button
                      onClick={() => {
                        setName("");
                        setEmail("");
                        setBusiness("");
                        setPhone("");
                        setMsg("");
                        setSent(false);
                      }}
                      className="px-6 py-2.5 rounded-full border border-border hover:bg-surface text-xs font-semibold"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Contact info */}
            <div className="space-y-6 lg:sticky lg:top-28">
              {[
                {
                  icon: Phone,
                  title: "Direct Support Hotline",
                  val: "1-800-555-POOL (7665)",
                  desc: "Dedicated support line for registered trade accounts."
                },
                {
                  icon: Mail,
                  title: "Email Channels",
                  val: "dealers@poolsupplywholesale.com",
                  desc: "Send blueprints, specifications sheets, or order documents."
                },
                {
                  icon: Clock,
                  title: "Service Hours",
                  val: "Mon - Fri, 8:00 AM - 6:00 PM EST",
                  desc: "Same-day shipment cutoff at 2:00 PM EST."
                },
                {
                  icon: MapPin,
                  title: "Main Logistics Hub",
                  val: "600 Ocean Parkway, Suite A\nNashville, TN 37211",
                  desc: "Will-call pickup coordinates available upon request."
                }
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="p-6 rounded-3xl bg-surface border border-border/70 flex gap-4">
                    <div className="size-10 rounded-xl bg-white border border-border text-[oklch(0.50_0.14_232)] grid place-items-center shrink-0 shadow-sm">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{c.title}</h3>
                      <div className="font-bold text-sm text-foreground mt-1 whitespace-pre-line leading-relaxed">{c.val}</div>
                      <p className="text-[11px] text-muted-foreground/80 mt-1">{c.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
