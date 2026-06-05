import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send } from "lucide-react";

export function ContactUs() {
  return (
    <section id="contact" className="py-[60px] bg-surface relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-ocean opacity-5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Contact Us</span>
          <h2 className="mt-3 text-3xl md:text-[40px] font-extrabold tracking-tight">
            Let's build something great.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Have a question about an order, need technical support, or want to inquire about volume pricing? Our team is ready to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-start">
          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            <div className="py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5">
              <div className="size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Headquarters</h3>
                <p className="text-muted-foreground leading-relaxed">
                  412 Ezell Pike Nashville, TN 37217<br />
                  United States
                </p>
              </div>
            </div>

            <div className="py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5">
              <div className="size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform">
                <Phone className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Call Us</h3>
                <p className="text-muted-foreground mb-1">Mon-Fri, 8am to 6pm EST</p>
                <a href="tel:2398772927" className="text-[oklch(0.50_0.14_232)] font-semibold hover:underline">
                  (239) 877-2927
                </a>
              </div>
            </div>

            <div className="py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5">
              <div className="size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform">
                <Mail className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground mb-2">Email</h3>
                <p className="text-muted-foreground mb-1">We'll respond within 24 hours.</p>
                <a href="mailto:jetspeedsocial@gmail.com" className="text-[oklch(0.50_0.14_232)] font-semibold hover:underline break-all">
                  jetspeedsocial@gmail.com
                </a>
              </div>
            </div>

            <div className="relative w-full h-[250px] sm:h-[300px] rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-soft)] bg-white group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.520448259695!2d-86.69468902381284!3d36.08055617246101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88646e0fa8014881%3A0xc3c5f590cc32ef8a!2s412%20Ezell%20Pike%2C%20Nashville%2C%20TN%2037217!5e0!3m2!1sen!2sus!4v1717616110992!5m2!1sen!2sus"
                className="absolute inset-0 w-full h-full border-0 grayscale-[0.8] contrast-[1.05]"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-border shadow-[var(--shadow-float)]"
          >
            <h3 className="text-2xl font-extrabold tracking-tight mb-8">Send us a message</h3>
            <form className="grid gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label htmlFor="firstName" className="text-sm font-semibold text-foreground/90">First Name</label>
                  <input type="text" id="firstName" className="w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all" placeholder="John" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-foreground/90">Last Name</label>
                  <input type="text" id="lastName" className="w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all" placeholder="Doe" />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground/90">Email Address</label>
                <input type="email" id="email" className="w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all" placeholder="john@example.com" />
              </div>

              <div className="grid gap-2">
                <label htmlFor="subject" className="text-sm font-semibold text-foreground/90">Subject</label>
                <select id="subject" className="w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all appearance-none cursor-pointer">
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Wholesale Pricing</option>
                  <option>Technical Assistance</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-semibold text-foreground/90">Message</label>
                <textarea id="message" rows={5} className="w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all resize-none" placeholder="How can we help you?"></textarea>
              </div>

              <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-ocean text-white font-bold text-lg hover:shadow-[0_20px_40px_-15px_oklch(0.50_0.14_232/0.5)] transition-all hover:-translate-y-0.5">
                <Send className="size-5" /> Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
