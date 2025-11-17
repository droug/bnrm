import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FaqSectionProps {
  section: any;
  language: 'fr' | 'ar';
}

export function FaqSection({ section, language }: FaqSectionProps) {
  const title = language === 'ar' ? section.title_ar || section.title_fr : section.title_fr;
  const { faqs = [] } = section.props || {};

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq: any, index: number) => {
            const question = language === 'ar' ? faq.question_ar || faq.question : faq.question;
            const answer = language === 'ar' ? faq.answer_ar || faq.answer : faq.answer;
            
            return (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-6">
                <AccordionTrigger className="text-left font-semibold">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </section>
  );
}
