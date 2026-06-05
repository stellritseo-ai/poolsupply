import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Categories } from "@/components/site/Categories";
import { Brands } from "@/components/site/Brands";
import { BestSellers } from "@/components/site/BestSellers";
import { WhyUs } from "@/components/site/WhyUs";
import { Finder } from "@/components/site/Finder";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";
import { ContactUs } from "@/components/site/ContactUs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pool Supply Wholesalers — Premium Pool Equipment at Wholesale Prices" },
      { name: "description", content: "Wholesale pool pumps, heaters, filters, cleaners, lights and automation from Pentair, Hayward, Jandy, Raypak and more. Trusted by 5,000+ pool professionals." },
      { property: "og:title", content: "Pool Supply Wholesalers — Premium Pool Equipment Wholesale" },
      { property: "og:description", content: "Wholesale pool equipment from the industry's leading brands. Fast shipping, expert support, professional pricing." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Categories />
        <Brands />
        <BestSellers />
        <WhyUs />
        <Finder />
        <Testimonials />
        <ContactUs />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
