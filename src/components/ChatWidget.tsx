import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl z-50 bg-gradient-to-r from-primary to-blue-900 hover:scale-110 transition-transform"
        size="icon"
      >
        {isOpen ? (
          <Icon name="X" size={24} />
        ) : (
          <Icon name="MessageCircle" size={24} />
        )}
      </Button>

      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 shadow-2xl z-50 animate-scale-in border-2">
          <CardHeader className="bg-gradient-to-r from-primary to-blue-900 text-white">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Headphones" size={20} />
              Служба поддержки
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Выберите удобный способ связи:
            </p>

            <a
              href="tel:+79181234567"
              className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="Phone" size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Позвонить</div>
                <div className="text-sm text-muted-foreground">+7 918 123 45 67</div>
              </div>
            </a>

            <a
              href="https://t.me/berrybox_support"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="Send" size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold">Telegram</div>
                <div className="text-sm text-muted-foreground">@berrybox_support</div>
              </div>
            </a>

            <a
              href="https://wa.me/79181234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="MessageSquare" size={20} className="text-green-600" />
              </div>
              <div>
                <div className="font-semibold">WhatsApp</div>
                <div className="text-sm text-muted-foreground">Написать</div>
              </div>
            </a>

            <a
              href="mailto:info@berrybox.ru"
              className="flex items-center gap-3 p-4 border-2 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Icon name="Mail" size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div className="text-sm text-muted-foreground">info@berrybox.ru</div>
              </div>
            </a>

            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              Ежедневно с 9:00 до 21:00
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;