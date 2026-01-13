import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order_position: number;
}

interface PickupPoint {
  id: number;
  name: string;
  address: string;
}

interface DeliveryPoint {
  id: number;
  name: string;
  address: string;
  city: string;
}

interface Settings {
  company_name: string;
  support_phone: string;
  support_email: string;
  tariff_standard: string;
  tariff_optimal: string;
  chat_phone: string;
  chat_telegram: string;
  chat_whatsapp: string;
}

interface OrderStatus {
  id: number;
  status_key: string;
  status_label: string;
  status_color: string;
  order_position: number;
}

const API_URLS = {
  pickupPoints: 'https://functions.poehali.dev/d6c2dc90-e5ad-4acd-96f2-7d33568364cb',
  deliveryPoints: 'https://functions.poehali.dev/d6c2dc90-e5ad-4acd-96f2-7d33568364cb?action=delivery',
  settings: 'https://functions.poehali.dev/1ce5a0f2-5d25-4bbe-b1d8-fbb89ed635fd',
  faq: 'https://functions.poehali.dev/1ce5a0f2-5d25-4bbe-b1d8-fbb89ed635fd?resource=faq',
  statuses: 'https://functions.poehali.dev/1ce5a0f2-5d25-4bbe-b1d8-fbb89ed635fd?resource=statuses'
};

const AdminPanel = () => {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [orderStatuses, setOrderStatuses] = useState<OrderStatus[]>([]);
  const [settings, setSettings] = useState<Settings>({
    company_name: '',
    support_phone: '',
    support_email: '',
    tariff_standard: '',
    tariff_optimal: '',
    chat_phone: '',
    chat_telegram: '',
    chat_whatsapp: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [faqRes, pickupRes, deliveryRes, settingsRes, statusesRes] = await Promise.all([
        fetch(API_URLS.faq),
        fetch(API_URLS.pickupPoints),
        fetch(API_URLS.deliveryPoints),
        fetch(API_URLS.settings),
        fetch(API_URLS.statuses)
      ]);

      setFaqItems(await faqRes.json());
      setPickupPoints(await pickupRes.json());
      setDeliveryPoints(await deliveryRes.json());
      setSettings(await settingsRes.json());
      setOrderStatuses(await statusesRes.json());
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch(API_URLS.settings, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      toast.success('Настройки сохранены');
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    }
  };

  const handleAddFAQ = async (question: string, answer: string) => {
    try {
      await fetch(API_URLS.faq, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, order_position: faqItems.length + 1 })
      });
      fetchAll();
      toast.success('Вопрос добавлен');
    } catch (error) {
      toast.error('Ошибка добавления вопроса');
    }
  };

  const handleDeleteFAQ = async (id: number) => {
    try {
      await fetch(API_URLS.faq, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAll();
      toast.success('Вопрос удалён');
    } catch (error) {
      toast.error('Ошибка удаления вопроса');
    }
  };

  const handleAddPickupPoint = async (name: string, address: string) => {
    try {
      await fetch(API_URLS.pickupPoints, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address })
      });
      fetchAll();
      toast.success('Пункт забора добавлен');
    } catch (error) {
      toast.error('Ошибка добавления пункта');
    }
  };

  const handleAddDeliveryPoint = async (name: string, address: string, city: string) => {
    try {
      await fetch(API_URLS.deliveryPoints, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, city })
      });
      fetchAll();
      toast.success('Пункт выдачи добавлен');
    } catch (error) {
      toast.error('Ошибка добавления пункта');
    }
  };

  const handleDeletePickupPoint = async (id: number) => {
    try {
      await fetch(API_URLS.pickupPoints, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAll();
      toast.success('Пункт забора удалён');
    } catch (error) {
      toast.error('Ошибка удаления пункта');
    }
  };

  const handleDeleteDeliveryPoint = async (id: number) => {
    try {
      await fetch(API_URLS.deliveryPoints, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAll();
      toast.success('Пункт выдачи удалён');
    } catch (error) {
      toast.error('Ошибка удаления пункта');
    }
  };

  const handleAddStatus = async (statusKey: string, statusLabel: string, statusColor: string) => {
    try {
      await fetch(API_URLS.statuses, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_key: statusKey, 
          status_label: statusLabel, 
          status_color: statusColor,
          order_position: orderStatuses.length + 1
        })
      });
      fetchAll();
      toast.success('Статус добавлен');
    } catch (error) {
      toast.error('Ошибка добавления статуса');
    }
  };

  const handleDeleteStatus = async (id: number) => {
    try {
      await fetch(API_URLS.statuses, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchAll();
      toast.success('Статус удалён');
    } catch (error) {
      toast.error('Ошибка удаления статуса');
    }
  };

  return (
    <div className="py-8">
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="statuses">Статусы</TabsTrigger>
          <TabsTrigger value="pickup">Пункты забора</TabsTrigger>
          <TabsTrigger value="delivery">Пункты выдачи</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки сайта</CardTitle>
              <CardDescription>Управление основными параметрами</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Название компании</Label>
                  <Input 
                    value={settings.company_name}
                    onChange={(e) => setSettings({...settings, company_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email поддержки</Label>
                  <Input 
                    value={settings.support_email}
                    onChange={(e) => setSettings({...settings, support_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон поддержки</Label>
                  <Input 
                    value={settings.support_phone}
                    onChange={(e) => setSettings({...settings, support_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Телефон чата</Label>
                  <Input 
                    value={settings.chat_phone}
                    onChange={(e) => setSettings({...settings, chat_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telegram чата</Label>
                  <Input 
                    value={settings.chat_telegram}
                    onChange={(e) => setSettings({...settings, chat_telegram: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp чата</Label>
                  <Input 
                    value={settings.chat_whatsapp}
                    onChange={(e) => setSettings({...settings, chat_whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Тарифы доставки</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Стандарт (до 10 кг), ₽/кг</Label>
                    <Input 
                      type="number"
                      value={settings.tariff_standard}
                      onChange={(e) => setSettings({...settings, tariff_standard: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Оптимальный (от 10 кг), ₽/кг</Label>
                    <Input 
                      type="number"
                      value={settings.tariff_optimal}
                      onChange={(e) => setSettings({...settings, tariff_optimal: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить настройки
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Управление FAQ</CardTitle>
                  <CardDescription>Вопросы и ответы для клиентов</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить вопрос
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый вопрос FAQ</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Вопрос</Label>
                        <Input id="faq-question" placeholder="Как быстро доставляете?" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ответ</Label>
                        <Textarea id="faq-answer" placeholder="Минимальный срок доставки..." rows={4} />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const question = (document.getElementById('faq-question') as HTMLInputElement).value;
                        const answer = (document.getElementById('faq-answer') as HTMLTextAreaElement).value;
                        if (question && answer) {
                          handleAddFAQ(question, answer);
                        }
                      }}>
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 border-2 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{item.question}</div>
                    <div className="text-sm text-muted-foreground">{item.answer}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteFAQ(item.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statuses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Статусы заказов</CardTitle>
                  <CardDescription>Управление статусами доставки</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить статус
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый статус</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Ключ статуса (латиница)</Label>
                        <Input id="status-key" placeholder="waiting_payment" />
                      </div>
                      <div className="space-y-2">
                        <Label>Название статуса</Label>
                        <Input id="status-label" placeholder="Ожидает оплаты" />
                      </div>
                      <div className="space-y-2">
                        <Label>Цвет (Tailwind класс)</Label>
                        <Input id="status-color" placeholder="bg-orange-100 text-orange-800" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const key = (document.getElementById('status-key') as HTMLInputElement).value;
                        const label = (document.getElementById('status-label') as HTMLInputElement).value;
                        const color = (document.getElementById('status-color') as HTMLInputElement).value;
                        if (key && label && color) {
                          handleAddStatus(key, label, color);
                        }
                      }}>
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderStatuses.map((status) => (
                <div key={status.id} className="flex items-center justify-between p-4 border-2 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded-full text-sm ${status.status_color}`}>
                      {status.status_label}
                    </div>
                    <code className="text-xs text-muted-foreground">{status.status_key}</code>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteStatus(status.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pickup">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Пункты забора (Сочи)</CardTitle>
                  <CardDescription>Откуда забираем посылки</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить пункт
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый пункт забора</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input id="pickup-name" placeholder="Озон" />
                      </div>
                      <div className="space-y-2">
                        <Label>Адрес</Label>
                        <Input id="pickup-address" placeholder="Сочи, ул. Навагинская, 12" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const name = (document.getElementById('pickup-name') as HTMLInputElement).value;
                        const address = (document.getElementById('pickup-address') as HTMLInputElement).value;
                        if (name && address) {
                          handleAddPickupPoint(name, address);
                        }
                      }}>
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {pickupPoints.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-4 border-2 rounded-lg">
                  <div>
                    <div className="font-semibold">{point.name}</div>
                    <div className="text-sm text-muted-foreground">{point.address}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeletePickupPoint(point.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Пункты выдачи (Абхазия)</CardTitle>
                  <CardDescription>Где клиенты получают посылки</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить пункт
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый пункт выдачи</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input id="delivery-name" placeholder="Бери Бокс - Сухум" />
                      </div>
                      <div className="space-y-2">
                        <Label>Город</Label>
                        <Input id="delivery-city" placeholder="Сухум" />
                      </div>
                      <div className="space-y-2">
                        <Label>Адрес</Label>
                        <Input id="delivery-address" placeholder="ул. Ленина, 15" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const name = (document.getElementById('delivery-name') as HTMLInputElement).value;
                        const city = (document.getElementById('delivery-city') as HTMLInputElement).value;
                        const address = (document.getElementById('delivery-address') as HTMLInputElement).value;
                        if (name && city && address) {
                          handleAddDeliveryPoint(name, address, city);
                        }
                      }}>
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveryPoints.map((point) => (
                <div key={point.id} className="flex items-center justify-between p-4 border-2 rounded-lg">
                  <div>
                    <div className="font-semibold">{point.name}</div>
                    <div className="text-sm text-muted-foreground">{point.city}, {point.address}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteDeliveryPoint(point.id)}
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;