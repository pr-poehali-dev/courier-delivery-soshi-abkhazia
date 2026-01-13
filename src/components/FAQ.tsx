import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order_position: number;
}

const FAQ = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/1ce5a0f2-5d25-4bbe-b1d8-fbb89ed635fd?resource=faq');
      const data = await response.json();
      setFaqItems(data);
    } catch (error) {
      console.error('Ошибка загрузки FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Icon name="HelpCircle" size={32} className="text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-3">Часто задаваемые вопросы</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ответы на самые популярные вопросы о доставке
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="text-2xl">Всё, что нужно знать о доставке</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader" size={32} className="animate-spin text-primary" />
              </div>
            ) : faqItems.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-4">
                {faqItems.map((item, index) => (
                  <AccordionItem 
                    key={item.id} 
                    value={`item-${item.id}`}
                    className="border-2 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-bold">{index + 1}</span>
                        </div>
                        <span className="font-semibold text-lg">{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <div className="pl-12 text-muted-foreground leading-relaxed">
                        {item.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12">
                <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">FAQ пока не добавлены</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary to-blue-900 text-white border-0">
            <CardContent className="py-8">
              <Icon name="MessageCircle" size={40} className="mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Не нашли ответ?</h3>
              <p className="mb-6 opacity-90">Наша служба поддержки всегда готова помочь</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+79181234567" 
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  <Icon name="Phone" size={20} />
                  +7 918 123 45 67
                </a>
                <a 
                  href="https://t.me/beribox_support" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-colors"
                >
                  <Icon name="Send" size={20} />
                  Telegram
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
