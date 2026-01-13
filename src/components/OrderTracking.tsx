import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  weight: number;
  price: number;
  delivery_type: 'home' | 'pickup';
  status: string;
  created_at: string;
  qr_code?: string;
}

type OrderStatus = 'processing' | 'courier' | 'transit' | 'ready' | 'delivered';

const statusLabels: Record<OrderStatus, string> = {
  processing: 'В обработке',
  courier: 'У курьера',
  transit: 'В доставке',
  ready: 'Готов к получению',
  delivered: 'Выдан'
};

const statusColors: Record<OrderStatus, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  courier: 'bg-blue-100 text-blue-800',
  transit: 'bg-purple-100 text-purple-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-800'
};

const OrderTracking = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const searchOrder = async () => {
    if (!searchQuery.trim()) {
      toast.error('Введите номер заказа для поиска');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://functions.poehali.dev/4460be83-87c8-4715-bfcb-94d474d9b10f?order_number=${searchQuery}`);
      const data = await response.json();

      if (response.ok && data) {
        setFoundOrder(data);
        toast.success('Заказ найден!');
      } else {
        toast.error('Заказ не найден');
        setFoundOrder(null);
      }
    } catch (error) {
      toast.error('Ошибка поиска заказа');
      setFoundOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      toast.success('Скриншот загружен! Введите номер заказа из него.');
    }
  };

  return (
    <div className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Icon name="Search" size={32} className="text-primary" />
          </div>
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Отследить заказ
          </h2>
          <p className="text-muted-foreground text-lg">
            Введите номер заказа или загрузите QR-код/скриншот
          </p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Package" size={24} className="text-primary" />
              Поиск заказа
            </CardTitle>
            <CardDescription>Найдите информацию о своей посылке</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Номер заказа</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="BB-001"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                    className="text-lg"
                  />
                  <Button onClick={searchOrder} disabled={loading} className="px-6">
                    {loading ? (
                      <Icon name="Loader" size={20} className="animate-spin" />
                    ) : (
                      <Icon name="Search" size={20} />
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-muted-foreground">или</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">Загрузить QR-код или скриншот</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="qr-upload"
                  />
                  <label htmlFor="qr-upload" className="cursor-pointer">
                    <Icon name="Upload" size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {imageFile ? `Загружено: ${imageFile.name}` : 'Нажмите для загрузки изображения'}
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {foundOrder && (
              <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-primary mb-1">
                        Заказ {foundOrder.order_number}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(foundOrder.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                    <Badge className={statusColors[foundOrder.status as OrderStatus]}>
                      {statusLabels[foundOrder.status as OrderStatus]}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Получатель</div>
                      <div className="font-semibold">{foundOrder.recipient_name}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Телефон</div>
                      <div className="font-semibold">{foundOrder.recipient_phone}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Вес</div>
                      <div className="font-semibold">{foundOrder.weight} кг</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Стоимость</div>
                      <div className="font-semibold text-primary text-lg">{foundOrder.price}₽</div>
                    </div>
                  </div>

                  {foundOrder.qr_code && (
                    <div className="mt-4 p-4 bg-white rounded-lg border-2">
                      <div className="flex items-center gap-4">
                        <img src={foundOrder.qr_code} alt="QR Code" className="w-24 h-24" />
                        <div className="flex-1">
                          <div className="font-semibold mb-1">QR-код для получения</div>
                          <div className="text-sm text-muted-foreground">
                            Покажите этот код при получении посылки
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
