import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import Calculator from '@/components/Calculator';
import FAQ from '@/components/FAQ';
import ChatWidget from '@/components/ChatWidget';
import AdminPanel from '@/components/AdminPanel';
import OrderTracking from '@/components/OrderTracking';

type OrderStatus = 'processing' | 'courier' | 'transit' | 'ready' | 'delivered';

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

interface Order {
  id: string;
  order_number: string;
  recipient_name: string;
  recipient_phone: string;
  delivery_address: string;
  weight: number;
  price: number;
  delivery_type: 'home' | 'pickup';
  status: OrderStatus;
  created_at: string;
  pickup_point_id?: number;
  delivery_point_id?: number;
  qr_code?: string;
}

const API_URLS = {
  orders: 'https://functions.poehali.dev/4460be83-87c8-4715-bfcb-94d474d9b10f',
  pickupPoints: 'https://functions.poehali.dev/d6c2dc90-e5ad-4acd-96f2-7d33568364cb',
  deliveryPoints: 'https://functions.poehali.dev/d6c2dc90-e5ad-4acd-96f2-7d33568364cb?action=delivery',
  qrCode: 'https://functions.poehali.dev/d6c2dc90-e5ad-4acd-96f2-7d33568364cb?action=qr',
  auth: 'https://functions.poehali.dev/91156237-3de5-42c1-a37d-6a01b6d78467',
  settings: 'https://functions.poehali.dev/1ce5a0f2-5d25-4bbe-b1d8-fbb89ed635fd'
};

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: number, email: string, name: string, is_admin: boolean} | null>(null);
  const [trackingSearch, setTrackingSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'home' | 'tariffs' | 'tracking' | 'cabinet' | 'about' | 'contacts' | 'admin'>('home');
  const [orders, setOrders] = useState<Order[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [calcWeight, setCalcWeight] = useState('');

  const [orderForm, setOrderForm] = useState({
    recipient_name: '',
    recipient_phone: '',
    delivery_address: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    delivery_type: 'home' as 'home' | 'pickup',
    pickup_point_id: '',
    delivery_point_id: '',
    comment: ''
  });

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

  const calculatePrice = (weight: number) => {
    if (weight < 10) return weight * 120;
    return weight * 100;
  };

  useEffect(() => {
    fetchPickupPoints();
    fetchDeliveryPoints();
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const fetchPickupPoints = async () => {
    try {
      const response = await fetch(API_URLS.pickupPoints);
      const data = await response.json();
      setPickupPoints(data);
    } catch (error) {
      console.error('Ошибка загрузки пунктов забора:', error);
    }
  };

  const fetchDeliveryPoints = async () => {
    try {
      const response = await fetch(API_URLS.deliveryPoints);
      const data = await response.json();
      setDeliveryPoints(data);
    } catch (error) {
      console.error('Ошибка загрузки пунктов выдачи:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const url = currentUser && !isAdmin 
        ? `${API_URLS.orders}?user_id=${currentUser.id}` 
        : API_URLS.orders;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    }
  };

  const generateQRCode = async (orderNumber: string) => {
    try {
      const response = await fetch(API_URLS.qrCode, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber })
      });
      const data = await response.json();
      return data.qr_code;
    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error);
      return null;
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setIsAdmin(data.user.is_admin);
        setActiveSection(data.user.is_admin ? 'admin' : 'cabinet');
        toast.success(data.user.is_admin ? 'Добро пожаловать в админ-панель!' : 'Вы успешно вошли в систему');
        fetchOrders();
      } else {
        toast.error(data.error || 'Ошибка входа');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentUser(null);
    setActiveSection('home');
    toast.success('Вы вышли из системы');
  };

  const handleRegister = async (name: string, email: string, phone: string, password: string) => {
    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, phone, password })
      });
      const data = await response.json();
      
      if (response.ok && data.user) {
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setIsAdmin(data.user.is_admin);
        setActiveSection('cabinet');
        toast.success('Регистрация успешна!');
        fetchOrders();
      } else {
        toast.error(data.error || 'Ошибка регистрации');
      }
    } catch (error) {
      toast.error('Ошибка подключения к серверу');
    }
  };

  const handleCreateOrder = async () => {
    if (!currentUser) {
      toast.error('Войдите в систему для оформления заказа');
      return;
    }

    if (!orderForm.recipient_name || !orderForm.recipient_phone || !orderForm.weight) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    if (orderForm.delivery_type === 'pickup' && !orderForm.delivery_point_id) {
      toast.error('Выберите пункт выдачи в Абхазии');
      return;
    }

    try {
      const response = await fetch(API_URLS.orders, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          user_id: currentUser.id,
          weight: Number(orderForm.weight),
          length: orderForm.length ? Number(orderForm.length) : null,
          width: orderForm.width ? Number(orderForm.width) : null,
          height: orderForm.height ? Number(orderForm.height) : null,
          pickup_point_id: orderForm.pickup_point_id ? Number(orderForm.pickup_point_id) : null,
          delivery_point_id: orderForm.delivery_point_id ? Number(orderForm.delivery_point_id) : null
        })
      });

      const newOrder = await response.json();
      
      const qrCode = await generateQRCode(newOrder.order_number);
      newOrder.qr_code = qrCode;

      setOrders([newOrder, ...orders]);
      setOrderForm({
        recipient_name: '',
        recipient_phone: '',
        delivery_address: '',
        weight: '',
        length: '',
        width: '',
        height: '',
        delivery_type: 'home',
        pickup_point_id: '',
        delivery_point_id: '',
        comment: ''
      });
      
      toast.success(`Заказ ${newOrder.order_number} успешно создан!`);
      
      if (qrCode) {
        const qrWindow = window.open('', '_blank');
        if (qrWindow) {
          qrWindow.document.write(`
            <html>
              <head><title>QR-код заказа ${newOrder.order_number}</title></head>
              <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif;">
                <h2>QR-код для заказа ${newOrder.order_number}</h2>
                <img src="${qrCode}" alt="QR Code" style="max-width: 400px;" />
                <p>Покажите этот QR-код при получении посылки</p>
                <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; font-size: 16px; cursor: pointer;">Распечатать</button>
              </body>
            </html>
          `);
        }
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      toast.error('Не удалось создать заказ');
    }
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('home')}>
            <Icon name="Package" size={32} className="text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Berrybox</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveSection('home')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'home' ? 'text-primary' : 'text-gray-600'}`}>
              Главная
            </button>
            <button onClick={() => setActiveSection('tariffs')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'tariffs' ? 'text-primary' : 'text-gray-600'}`}>
              Тарифы
            </button>
            <button onClick={() => setActiveSection('tracking')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'tracking' ? 'text-primary' : 'text-gray-600'}`}>
              Отслеживание
            </button>
            {isLoggedIn && (
              <button onClick={() => setActiveSection('cabinet')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'cabinet' ? 'text-primary' : 'text-gray-600'}`}>
                Личный кабинет
              </button>
            )}
            <button onClick={() => setActiveSection('about')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'about' ? 'text-primary' : 'text-gray-600'}`}>
              О нас
            </button>
            <button onClick={() => setActiveSection('contacts')} className={`text-sm font-medium transition-colors hover:text-primary ${activeSection === 'contacts' ? 'text-primary' : 'text-gray-600'}`}>
              Контакты
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => setActiveSection('admin')}>
                    <Icon name="Settings" size={16} className="mr-2" />
                    Админ-панель
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выход
                </Button>
              </>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Войти
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Вход в систему</DialogTitle>
                    <DialogDescription>Войдите в личный кабинет или зарегистрируйтесь</DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="login">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Вход</TabsTrigger>
                      <TabsTrigger value="register">Регистрация</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input id="login-email" type="email" placeholder="your@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <Input id="login-password" type="password" placeholder="••••••••" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const email = (document.getElementById('login-email') as HTMLInputElement).value;
                        const password = (document.getElementById('login-password') as HTMLInputElement).value;
                        handleLogin(email, password);
                      }}>
                        Войти
                      </Button>

                    </TabsContent>
                    <TabsContent value="register" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input id="register-name" type="text" placeholder="Иван Иванов" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input id="register-email" type="email" placeholder="your@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input id="register-phone" type="tel" placeholder="+7 918 123 45 67" />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <Input id="register-password" type="password" placeholder="••••••••" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const name = (document.querySelector('#register-name') as HTMLInputElement).value;
                        const email = (document.querySelector('#register-email') as HTMLInputElement).value;
                        const phone = (document.querySelector('#register-phone') as HTMLInputElement).value;
                        const password = (document.querySelector('#register-password') as HTMLInputElement).value;
                        handleRegister(name, email, phone, password);
                      }}>
                        Зарегистрироваться
                      </Button>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  const renderHome = () => (
    <div className="pt-20">
      <section className="relative bg-gradient-to-br from-primary via-secondary to-purple-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              🍓 Доставка из Сочи в Абхазию от 1 дня
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Берём посылки из любых пунктов и доставляем свежими как ягодки
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg" onClick={() => setActiveSection('tracking')}>
                <Icon name="Package" size={20} className="mr-2" />
                Оформить заказ
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Calculator />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Откуда забираем посылки</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {pickupPoints.map((service) => (
              <Card key={service.id} className="border-2 hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="font-semibold text-center mb-2">{service.name}</div>
                  <div className="text-xs text-muted-foreground text-center">{service.address}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderTariffs = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Тарифы доставки</h2>
        <p className="text-center text-muted-foreground mb-12 text-lg">Прозрачные цены без скрытых комиссий</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Стандарт</CardTitle>
              <CardDescription>Для посылок до 10 кг</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">120₽</div>
              <div className="text-muted-foreground mb-6">за килограмм</div>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Доставка от 1 дня</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Отслеживание груза</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Доставка на дом или в ПВЗ</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent hover:shadow-xl transition-all relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-accent">Выгодно</Badge>
            </div>
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package2" size={32} className="text-accent" />
              </div>
              <CardTitle className="text-2xl">Оптимальный</CardTitle>
              <CardDescription>Для посылок от 10 кг</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-5xl font-bold text-accent mb-2">100₽</div>
              <div className="text-muted-foreground mb-6">за килограмм</div>
              <ul className="space-y-3 text-left">
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Доставка от 1 дня</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Отслеживание груза</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Доставка на дом или в ПВЗ</span>
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="Check" size={20} className="text-green-600" />
                  <span>Приоритетная обработка</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="pt-20">
      <OrderTracking />
      <div className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Оформление заказа</h2>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Создать новую доставку</CardTitle>
            <CardDescription>Заполните данные для оформления заказа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Откуда забрать посылку *</Label>
              <Select 
                value={orderForm.pickup_point_id}
                onValueChange={(value) => setOrderForm({...orderForm, pickup_point_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пункт забора в Сочи" />
                </SelectTrigger>
                <SelectContent>
                  {pickupPoints.map((point) => (
                    <SelectItem key={point.id} value={String(point.id)}>
                      {point.name} - {point.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Имя получателя *</Label>
              <Input 
                placeholder="Иван Иванов" 
                value={orderForm.recipient_name}
                onChange={(e) => setOrderForm({...orderForm, recipient_name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Номер телефона *</Label>
              <Input 
                type="tel" 
                placeholder="+7 918 123 45 67"
                value={orderForm.recipient_phone}
                onChange={(e) => setOrderForm({...orderForm, recipient_phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Вес посылки (кг) *</Label>
              <Input 
                type="number" 
                placeholder="5"
                value={orderForm.weight}
                onChange={(e) => setOrderForm({...orderForm, weight: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon name="Box" size={16} />
                Габариты (см)
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Input 
                    type="number" 
                    placeholder="Длина"
                    value={orderForm.length || ''}
                    onChange={(e) => setOrderForm({...orderForm, length: e.target.value})}
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="Ширина"
                    value={orderForm.width || ''}
                    onChange={(e) => setOrderForm({...orderForm, width: e.target.value})}
                  />
                </div>
                <div>
                  <Input 
                    type="number" 
                    placeholder="Высота"
                    value={orderForm.height || ''}
                    onChange={(e) => setOrderForm({...orderForm, height: e.target.value})}
                  />
                </div>
              </div>
              {orderForm.weight && (
                <p className="text-sm text-muted-foreground mt-2">
                  Стоимость: <span className="font-semibold text-primary">{calculatePrice(Number(orderForm.weight))}₽</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Способ получения *</Label>
              <RadioGroup value={orderForm.delivery_type} onValueChange={(value: 'home' | 'pickup') => setOrderForm({...orderForm, delivery_type: value})}>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="home" id="home" />
                  <Label htmlFor="home" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Icon name="Home" size={20} />
                    <div>
                      <div className="font-medium">Доставка на дом</div>
                      <div className="text-sm text-muted-foreground">Курьер доставит по указанному адресу</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Icon name="MapPin" size={20} />
                    <div>
                      <div className="font-medium">Пункт выдачи</div>
                      <div className="text-sm text-muted-foreground">Заберёте сами из ближайшего ПВЗ</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {orderForm.delivery_type === 'home' ? (
              <div className="space-y-2">
                <Label>Адрес доставки *</Label>
                <Input 
                  placeholder="Сухум, ул. Ленина, 15"
                  value={orderForm.delivery_address}
                  onChange={(e) => setOrderForm({...orderForm, delivery_address: e.target.value})}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Пункт выдачи в Абхазии *</Label>
                <Select 
                  value={orderForm.delivery_point_id}
                  onValueChange={(value) => setOrderForm({...orderForm, delivery_point_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите пункт выдачи" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPoints.map((point) => (
                      <SelectItem key={point.id} value={String(point.id)}>
                        {point.city} - {point.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Комментарий</Label>
              <Textarea 
                placeholder="Дополнительные пожелания..."
                value={orderForm.comment}
                onChange={(e) => setOrderForm({...orderForm, comment: e.target.value})}
              />
            </div>

            <Button className="w-full" size="lg" onClick={handleCreateOrder}>
              <Icon name="Send" size={20} className="mr-2" />
              Оформить заказ
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );

  const renderCabinet = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8">Личный кабинет</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Мои заказы</CardTitle>
            <CardDescription>История и отслеживание доставок</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">У вас пока нет заказов</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-semibold text-lg mb-1">Заказ {order.order_number}</div>
                          <div className="text-sm text-muted-foreground">{order.created_at}</div>
                        </div>
                        <Badge className={statusColors[order.status]}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <div className="text-muted-foreground">Получатель</div>
                          <div className="font-medium">{order.recipient_name}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Телефон</div>
                          <div className="font-medium">{order.recipient_phone}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Вес / Стоимость</div>
                          <div className="font-medium">{order.weight} кг / {order.price}₽</div>
                        </div>
                      </div>

                      {order.qr_code && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                          <img src={order.qr_code} alt="QR Code" className="w-24 h-24" />
                          <div className="text-sm text-muted-foreground">
                            Покажите этот QR-код при получении посылки
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8">Админ-панель</h2>
        
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
            <TabsTrigger value="pickup">Пункты забора (Сочи)</TabsTrigger>
            <TabsTrigger value="delivery">Пункты выдачи (Абхазия)</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Управление заказами</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.map((order) => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-semibold text-lg">Заказ {order.order_number}</div>
                          <div className="text-sm text-muted-foreground">{order.recipient_name} • {order.recipient_phone}</div>
                        </div>
                        <select 
                          className="border rounded px-3 py-1 text-sm"
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value as OrderStatus;
                            try {
                              await fetch(API_URLS.orders, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ order_id: order.id, status: newStatus })
                              });
                              fetchOrders();
                              toast.success('Статус заказа обновлён');
                            } catch (error) {
                              toast.error('Ошибка обновления статуса');
                            }
                          }}
                        >
                          <option value="processing">В обработке</option>
                          <option value="courier">У курьера</option>
                          <option value="transit">В доставке</option>
                          <option value="ready">Готов к получению</option>
                          <option value="delivered">Выдан</option>
                        </select>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">Вес:</span> {order.weight} кг • <span className="text-muted-foreground">Стоимость:</span> {order.price}₽</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pickup" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Пункты забора посылок в Сочи</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pickupPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{point.name}</div>
                      <div className="text-sm text-muted-foreground">{point.address}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Пункты выдачи в Абхазии</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliveryPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{point.name}</div>
                      <div className="text-sm text-muted-foreground">{point.city}, {point.address}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">🍓 О компании Berrybox</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-2 border-primary/20">
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed mb-4">
                <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Berrybox</span> — это свежий взгляд на курьерскую доставку между Сочи и Абхазией. 
                Мы берём ваши посылки из любых пунктов выдачи и доставляем их свежими, быстрыми и бережными — как ягодки!
              </p>
              <p className="text-lg leading-relaxed">
                Наша миссия — сделать доставку простой, быстрой и приятной для каждого. Никаких сложностей, только свежесть и скорость! 🍓
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Доставленных посылок</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <div className="text-muted-foreground">Поддержка клиентов</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">1 день</div>
                <div className="text-muted-foreground">Минимальный срок</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Контакты</h2>
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Телефон</div>
                  <div className="text-muted-foreground">+7 918 123 45 67</div>
                  <div className="text-sm text-muted-foreground">Ежедневно с 9:00 до 21:00</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Mail" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Email</div>
                  <div className="text-muted-foreground">info@berrybox.ru</div>
                  <div className="text-sm text-muted-foreground">Ответим в течение 2 часов</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Офис в Сочи</div>
                  <div className="text-muted-foreground">г. Сочи, ул. Навагинская, 12</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MessageCircle" size={24} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold mb-1">Мессенджеры</div>
                  <div className="text-muted-foreground">WhatsApp, Telegram: +7 918 123 45 67</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      {activeSection === 'home' && (
        <>
          {renderHome()}
          <FAQ />
        </>
      )}
      {activeSection === 'tariffs' && renderTariffs()}
      {activeSection === 'tracking' && renderTracking()}
      {activeSection === 'cabinet' && renderCabinet()}
      {activeSection === 'about' && renderAbout()}
      {activeSection === 'contacts' && renderContacts()}
      {activeSection === 'admin' && isAdmin && (
        <div className="pt-20 container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">Админ-панель</h2>
          <AdminPanel />
        </div>
      )}

      <ChatWidget />

      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl">🍓</span>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Berrybox</span>
              </div>
              <p className="text-gray-300">Свежая доставка из Сочи в Абхазию как ягодки</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Навигация</h3>
              <div className="space-y-2">
                <div className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActiveSection('home')}>Главная</div>
                <div className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActiveSection('tariffs')}>Тарифы</div>
                <div className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActiveSection('about')}>О нас</div>
                <div className="text-gray-400 hover:text-white cursor-pointer" onClick={() => setActiveSection('contacts')}>Контакты</div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Контакты</h3>
              <div className="space-y-2 text-gray-400">
                <div>+7 918 123 45 67</div>
                <div>info@berrybox.ru</div>
                <div>г. Сочи, ул. Навагинская, 12</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Berrybox. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;