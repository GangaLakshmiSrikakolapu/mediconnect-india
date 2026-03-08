import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Heart, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const Insurance = () => {
  const { t } = useLanguage();

  const sections = [
    { icon: Shield, title: t.insurance.types, desc: t.insurance.typesDesc, items: [t.insurance.individualHealth, t.insurance.familyFloater, t.insurance.groupHealth, t.insurance.criticalIllness, t.insurance.seniorCitizen] },
    { icon: Heart, title: t.insurance.coverage, desc: t.insurance.coverageDesc },
    { icon: CheckCircle, title: t.insurance.benefits, desc: t.insurance.benefitsDesc },
    { icon: FileText, title: t.insurance.eligibility, desc: t.insurance.eligibilityDesc },
    { icon: FileText, title: t.insurance.claimProcess, desc: t.insurance.claimProcessDesc },
  ];

  const faqs = [
    { q: 'What is health insurance?', a: 'Health insurance is a type of insurance that covers medical expenses incurred by the insured. It can cover hospitalization, surgeries, daycare procedures, and more.' },
    { q: 'How to choose the right plan?', a: 'Consider your age, family size, medical history, coverage amount, network hospitals, and premium affordability when choosing a health insurance plan.' },
    { q: 'What is cashless treatment?', a: 'Cashless treatment means you can get treated at a network hospital without paying upfront. The insurance company settles the bill directly with the hospital.' },
    { q: 'Can I port my insurance?', a: 'Yes, IRDAI allows portability of health insurance policies. You can switch insurers while retaining benefits like waiting period credits.' },
    { q: 'What is a no-claim bonus?', a: 'A no-claim bonus is a reward for not making claims during a policy year. Your sum insured increases by 5-50% for each claim-free year.' },
  ];

  return (
    <div className="container py-8 md:py-12 max-w-4xl animate-fade-in">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-center mb-2">{t.insurance.title}</h1>
      <p className="text-center text-muted-foreground mb-10">Comprehensive guide to health insurance in India</p>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2.5">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription className="mt-1">{section.desc}</CardDescription>
                </div>
              </div>
            </CardHeader>
            {section.items && (
              <CardContent>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{t.insurance.faqs}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-left text-sm">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Insurance;
