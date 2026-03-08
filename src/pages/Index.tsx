import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Search, Heart, Shield, Activity, Clock, Users, Building2, Star,
  Stethoscope, Brain, Bone, Baby, Eye, Syringe, HeartPulse,
  Microscope, Pill, Ambulance, CheckCircle, ArrowRight, Sparkles,
  MapPin, Calendar, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const heroTexts = [
  "Book Appointments Instantly",
  "Find Hospitals Near You",
  "Compare by Budget & Specialty",
  "AI-Powered Health Recommendations",
];

const specialties = [
  { name: "Cardiology", icon: HeartPulse, count: 2400 },
  { name: "Orthopedics", icon: Bone, count: 1800 },
  { name: "Neurology", icon: Brain, count: 1200 },
  { name: "Pediatrics", icon: Baby, count: 3100 },
  { name: "Ophthalmology", icon: Eye, count: 900 },
  { name: "Dermatology", icon: Syringe, count: 1500 },
  { name: "General Medicine", icon: Stethoscope, count: 4200 },
  { name: "Diagnostics", icon: Microscope, count: 2000 },
  { name: "Pharmacy", icon: Pill, count: 5000 },
  { name: "Emergency Care", icon: Ambulance, count: 800 },
  { name: "ENT", icon: Activity, count: 1100 },
  { name: "Dental", icon: Shield, count: 2800 },
];

const stats = [
  { value: "10,000+", label: "Hospitals", icon: Building2 },
  { value: "50+", label: "Cities", icon: MapPin },
  { value: "2M+", label: "Patients", icon: Users },
  { value: "98%", label: "Satisfaction", icon: Star },
];

const steps = [
  { title: "Search Hospital", desc: "Find hospitals by city, specialty, or doctor name", icon: Search },
  { title: "Book Appointment", desc: "Choose your doctor, date & time slot instantly", icon: Calendar },
  { title: "Get Confirmed", desc: "Receive instant confirmation with token number", icon: CheckCircle },
];

const testimonials = [
  { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "MediConnect made it so easy to find a cardiologist near me. Booked in 2 minutes!", avatar: "PS" },
  { name: "Rajesh Kumar", city: "Delhi", rating: 5, text: "The token system is brilliant. No more waiting in long queues at the hospital.", avatar: "RK" },
  { name: "Ananya Reddy", city: "Hyderabad", rating: 4, text: "Found the perfect pediatrician for my child. The doctor profiles are very detailed.", avatar: "AR" },
];

const AnimatedCounter = ({ value }: { value: string }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);
  return <span className={`transition-all duration-700 ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>{value}</span>;
};

const TypingEffect = () => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = heroTexts[index];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length === current.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setIndex((i) => (i + 1) % heroTexts.length);
        }
      }
    }, isDeleting ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return (
    <span className="text-accent-foreground">
      {text}<span className="animate-pulse">|</span>
    </span>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4">
              India's First Complete<br />Hospital Network
            </h1>
            <div className="text-xl md:text-2xl font-medium mb-8 h-8 text-white/90">
              <TypingEffect />
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-card rounded-2xl p-3 md:p-4 card-shadow-lg max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary">
                  <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input placeholder="City or Location" className="bg-transparent text-foreground w-full outline-none text-sm" />
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary">
                  <Stethoscope className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input placeholder="Specialty" className="bg-transparent text-foreground w-full outline-none text-sm" />
                </div>
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-secondary">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input type="date" className="bg-transparent text-foreground w-full outline-none text-sm" />
                </div>
                <Link to="/find-hospital">
                  <Button size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl px-8">
                    <Search className="h-5 w-5 mr-2" />Search
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-3xl md:text-4xl font-heading font-extrabold text-primary">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Book an appointment in 3 simple steps</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="text-center h-full card-shadow hover:card-shadow-lg transition-shadow border-0">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <span className="inline-block text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full mb-3">Step {i + 1}</span>
                    <h3 className="font-heading text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Specialties */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Featured Specialties</h2>
            <p className="text-muted-foreground text-lg">Find the right specialist for your needs</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {specialties.map((spec, i) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to="/find-hospital">
                  <Card className="h-full text-center cursor-pointer hover:border-primary/30 hover:card-shadow-lg transition-all border-0 card-shadow">
                    <CardContent className="pt-6 pb-4 px-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <spec.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h4 className="font-heading text-sm font-semibold mb-1">{spec.name}</h4>
                      <p className="text-xs text-muted-foreground">{spec.count.toLocaleString()} hospitals</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MediConnect */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">Why MediConnect?</h2>
            <p className="text-muted-foreground text-lg">India's most trusted healthcare platform</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "All Hospitals in One Place", desc: "Access 10,000+ verified hospitals across India from one platform" },
              { icon: Sparkles, title: "AI Smart Recommendations", desc: "Get personalized hospital suggestions based on your health profile" },
              { icon: Clock, title: "Instant Confirmation", desc: "Book appointments and get instant token numbers with wait times" },
              { icon: Shield, title: "Insurance Integration", desc: "Seamless insurance verification and cashless claim processing" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-0 card-shadow hover:card-shadow-lg transition-all">
                  <CardContent className="pt-8 pb-6 px-6">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="font-heading text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">What Patients Say</h2>
            <p className="text-muted-foreground text-lg">Trusted by millions across India</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card className="h-full border-0 card-shadow">
                  <CardContent className="pt-6 pb-6 px-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">"{t.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.city}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* For Hospitals CTA */}
      <section className="py-20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full">FOR HOSPITALS</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mt-4 mb-6">Grow Your Hospital with MediConnect</h2>
              <div className="space-y-4">
                {[
                  "Free Registration & Onboarding",
                  "Custom Hospital Dashboard",
                  "Smart Appointment Management",
                  "Analytics & Performance Reports",
                  "Patient Communication Tools",
                  "Insurance Partner Integration",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success shrink-0" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link to="/hospital-request">
                <Button size="lg" className="mt-8 rounded-full px-8">
                  Register Your Hospital Free <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8">
                <Card className="card-shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm">Hospital Dashboard</p>
                        <p className="text-xs text-muted-foreground">Real-time analytics</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Today", value: "24" },
                        { label: "Confirmed", value: "18" },
                        { label: "Revenue", value: "₹12K" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-3 rounded-xl bg-secondary">
                          <p className="font-heading font-bold text-lg">{s.value}</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-hero text-primary-foreground py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-7 w-7 fill-current" />
                <span className="font-heading text-xl font-bold">MEDICONNECT</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                India's most trusted healthcare platform connecting patients, hospitals, and insurance services.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Platform</h4>
              <div className="space-y-2 text-sm text-white/70">
                <Link to="/find-hospital" className="block hover:text-white transition-colors">Find Hospitals</Link>
                <Link to="/insurance" className="block hover:text-white transition-colors">Insurance Info</Link>
                <Link to="/doctor/login" className="block hover:text-white transition-colors">Doctor Portal</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">For Hospitals</h4>
              <div className="space-y-2 text-sm text-white/70">
                <Link to="/hospital-request" className="block hover:text-white transition-colors">Register Hospital</Link>
                <Link to="/admin/login" className="block hover:text-white transition-colors">Admin Portal</Link>
              </div>
            </div>
            <div>
              <h4 className="font-heading font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-XXX-XXXX</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Mumbai, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-10 pt-6 text-center text-sm text-white/50">
            © 2026 MediConnect India. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
