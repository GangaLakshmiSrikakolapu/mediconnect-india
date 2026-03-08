import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Shield, Heart, FileText, CheckCircle, HelpCircle } from 'lucide-react';

const sections = [
  { icon: Shield, title: 'Types of Health Insurance', desc: 'Understanding different health insurance plans available in India', items: ['Individual Health Insurance', 'Family Floater Plans', 'Group Health Insurance', 'Critical Illness Coverage', 'Senior Citizen Plans'] },
  { icon: Heart, title: 'What\'s Covered', desc: 'Hospitalization, pre/post care, daycare procedures, ambulance charges, and more.' },
  { icon: CheckCircle, title: 'Key Benefits', desc: 'Cashless treatment at 10,000+ network hospitals, tax benefits under Sec 80D, no-claim bonus, and free health checkups.' },
  { icon: FileText, title: 'Eligibility', desc: 'Most plans available for ages 18-65. Family floater covers spouse, children, and parents. Pre-existing conditions covered after waiting period.' },
  { icon: FileText, title: 'How to Claim', desc: 'Cashless: Show your health card at a network hospital. Reimbursement: Pay and submit bills within 30 days for reimbursement.' },
];

const faqs = [
  { q: 'What is health insurance?', a: 'Health insurance covers medical expenses incurred by the insured including hospitalization, surgeries, daycare procedures, and more.' },
  { q: 'How to choose the right plan?', a: 'Consider your age, family size, medical history, coverage amount, network hospitals, and premium affordability.' },
  { q: 'What is cashless treatment?', a: 'Cashless treatment means you can get treated at a network hospital without paying upfront. The insurer settles the bill directly.' },
  { q: 'Can I port my insurance?', a: 'Yes, IRDAI allows portability. You can switch insurers while retaining waiting period credits.' },
  { q: 'What is a no-claim bonus?', a: 'A reward for not making claims during a policy year. Your sum insured increases by 5-50% for each claim-free year.' },
];

const Insurance = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/30">
      <div className="container py-8 md:py-12 max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Health Insurance Guide</h1>
          <p className="text-muted-foreground text-lg">Comprehensive guide to health insurance in India</p>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <Card key={i} className="border-0 card-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
                        <CheckCircle className="h-4 w-4 text-accent shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              )}
            </Card>
          ))}

          <Card className="border-0 card-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">FAQs</CardTitle>
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
    </div>
  );
};

export default Insurance;
