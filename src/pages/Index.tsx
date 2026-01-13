import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type OrderStatus = 'processing' | 'courier' | 'transit' | 'ready' | 'delivered';

interface Order {
  id: string;
  recipient: string;
  phone: string;
  address: string;
  weight: number;
  deliveryType: 'home' | 'pickup';
  status: OrderStatus;
  createdAt: string;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'tariffs' | 'tracking' | 'cabinet' | 'about' | 'contacts' | 'admin'>('home');
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'BB-001',
      recipient: 'Иван Петров',
      phone: '+7 918 123 45 67',
      address: 'Сухум, ул. Ленина, 15',
      weight: 5,
      deliveryType: 'home',
      status: 'transit',
      createdAt: '2026-01-10'
    }
  ]);
  const [pickupPoints, setPickupPoints] = useState([
    { id: 1, name: 'Озон', address: 'Сочи, ул. Навагинская, 12' },
    { id: 2, name: 'Wildberries', address: 'Сочи, ул. Конституции, 45' },
    { id: 3, name: 'Яндекс Маркет', address: 'Сочи, ТРЦ Моремолл' },
    { id: 4, name: 'Почта России', address: 'Сочи, ул. Горького, 23' },
    { id: 5, name: 'Ламода', address: 'Сочи, ул. Воровского, 89' },
    { id: 6, name: 'Золотое яблоко', address: 'Сочи, проспект Курортный, 56' },
    { id: 7, name: 'СДЭК', address: 'Сочи, ул. Пластунская, 34' },
    { id: 8, name: 'Boxberry', address: 'Сочи, ул. Донская, 78' }
  ]);

  const [orderForm, setOrderForm] = useState({
    recipient: '',
    phone: '',
    address: '',
    weight: '',
    deliveryType: 'home' as 'home' | 'pickup',
    comment: ''
  });

  const statusLabels: Record<OrderStatus, string> = {
    processing: 'Заказ в обработке',
    courier: 'Заказ у курьера',
    transit: 'Заказ в доставке в Абхазию',
    ready: 'Заказ готов к получению',
    delivered: 'Заказ выдан'
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

  const handleLogin = (email: string, password: string) => {
    if (email === 'admin@beribox.ru' && password === 'admin123') {
      setIsAdmin(true);
      setIsLoggedIn(true);
      setActiveSection('admin');
      toast.success('Добро пожаловать в админ-панель!');
    } else {
      setIsLoggedIn(true);
      setActiveSection('cabinet');
      toast.success('Вы успешно вошли в систему');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setActiveSection('home');
    toast.success('Вы вышли из системы');
  };

  const handleCreateOrder = () => {
    if (!orderForm.recipient || !orderForm.phone || !orderForm.address || !orderForm.weight) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    const newOrder: Order = {
      id: `BB-${String(orders.length + 1).padStart(3, '0')}`,
      recipient: orderForm.recipient,
      phone: orderForm.phone,
      address: orderForm.address,
      weight: Number(orderForm.weight),
      deliveryType: orderForm.deliveryType,
      status: 'processing',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setOrders([...orders, newOrder]);
    setOrderForm({
      recipient: '',
      phone: '',
      address: '',
      weight: '',
      deliveryType: 'home',
      comment: ''
    });
    toast.success(`Заказ ${newOrder.id} успешно создан!`);
  };

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('home')}>
            <Icon name="Package" size={32} className="text-primary" />
            <span className="text-2xl font-bold text-primary">Бери Бокс</span>
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
                      <p className="text-xs text-muted-foreground text-center">
                        Админ: admin@beribox.ru / admin123
                      </p>
                    </TabsContent>
                    <TabsContent value="register" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input type="text" placeholder="Иван Иванов" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Телефон</Label>
                        <Input type="tel" placeholder="+7 918 123 45 67" />
                      </div>
                      <div className="space-y-2">
                        <Label>Пароль</Label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        handleLogin('user@example.com', 'password');
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
      <section className="relative bg-gradient-to-br from-primary to-blue-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Доставка из Сочи в Абхазию от 1 дня
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Забираем посылки из любых пунктов выдачи и доставляем прямо в руки
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg" onClick={() => setActiveSection('tracking')}>
                <Icon name="Package" size={20} className="mr-2" />
                Оформить заказ
              </Button>
              <Button size="lg" variant="outline" className="text-lg bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Icon name="Play" size={20} className="mr-2" />
                Как это работает
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Zap" size={28} className="text-primary" />
                </div>
                <CardTitle>Быстро</CardTitle>
                <CardDescription>Доставка от 1 дня. Забираем посылки ежедневно</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Shield" size={28} className="text-accent" />
                </div>
                <CardTitle>Надёжно</CardTitle>
                <CardDescription>Страхование груза и гарантия доставки</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="DollarSign" size={28} className="text-green-600" />
                </div>
                <CardTitle>Выгодно</CardTitle>
                <CardDescription>От 100₽ за килограмм при весе от 10 кг</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Откуда забираем посылки</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Озон', 'Wildberries', 'Яндекс Маркет', 'Почта России', 'Ламода', 'Золотое яблоко', 'СДЭК', 'Boxberry'].map((service) => (
              <Card key={service} className="border-2 hover:border-primary transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-center p-6">
                  <span className="font-semibold text-lg">{service}</span>
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

        <Card className="max-w-2xl mx-auto mt-12 bg-gradient-to-r from-blue-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-center">Калькулятор стоимости</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Вес посылки (кг)</Label>
                <Input type="number" placeholder="Введите вес" id="calc-weight" />
              </div>
              <Button className="w-full" onClick={() => {
                const weight = Number((document.getElementById('calc-weight') as HTMLInputElement).value);
                if (weight > 0) {
                  const price = calculatePrice(weight);
                  toast.success(`Стоимость доставки: ${price}₽`);
                }
              }}>
                Рассчитать стоимость
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderTracking = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Оформление заказа</h2>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Создать новую доставку</CardTitle>
            <CardDescription>Заполните данные для оформления заказа</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Имя получателя *</Label>
              <Input 
                placeholder="Иван Иванов" 
                value={orderForm.recipient}
                onChange={(e) => setOrderForm({...orderForm, recipient: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Номер телефона *</Label>
              <Input 
                type="tel" 
                placeholder="+7 918 123 45 67"
                value={orderForm.phone}
                onChange={(e) => setOrderForm({...orderForm, phone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Адрес доставки *</Label>
              <Input 
                placeholder="Сухум, ул. Ленина, 15"
                value={orderForm.address}
                onChange={(e) => setOrderForm({...orderForm, address: e.target.value})}
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
              {orderForm.weight && (
                <p className="text-sm text-muted-foreground">
                  Стоимость: <span className="font-semibold text-primary">{calculatePrice(Number(orderForm.weight))}₽</span>
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Способ получения *</Label>
              <RadioGroup value={orderForm.deliveryType} onValueChange={(value: 'home' | 'pickup') => setOrderForm({...orderForm, deliveryType: value})}>
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
  );

  const renderCabinet = () => (
    <div className="pt-20 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold mb-8">Личный кабинет</h2>
        
        <div className="grid gap-6">
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
                            <div className="font-semibold text-lg mb-1">Заказ {order.id}</div>
                            <div className="text-sm text-muted-foreground">{order.createdAt}</div>
                          </div>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Получатель</div>
                            <div className="font-medium">{order.recipient}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Телефон</div>
                            <div className="font-medium">{order.phone}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Адрес</div>
                            <div className="font-medium">{order.address}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Вес / Стоимость</div>
                            <div className="font-medium">{order.weight} кг / {calculatePrice(order.weight)}₽</div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Статус доставки</span>
                          </div>
                          <div className="relative">
                            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200"></div>
                            <div className="relative flex justify-between">
                              {(['processing', 'courier', 'transit', 'ready', 'delivered'] as OrderStatus[]).map((status, idx) => {
                                const currentIdx = (['processing', 'courier', 'transit', 'ready', 'delivered'] as OrderStatus[]).indexOf(order.status);
                                const isActive = idx <= currentIdx;
                                return (
                                  <div key={status} className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary text-white' : 'bg-gray-200'} relative z-10`}>
                                      {isActive ? <Icon name="Check" size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-400"></div>}
                                    </div>
                                    <div className="text-xs mt-2 text-center max-w-[80px]">{statusLabels[status].replace('Заказ ', '')}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
            <TabsTrigger value="points">Пункты выдачи</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
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
                          <div className="font-semibold text-lg">Заказ {order.id}</div>
                          <div className="text-sm text-muted-foreground">{order.recipient} • {order.phone}</div>
                        </div>
                        <select 
                          className="border rounded px-3 py-1 text-sm"
                          value={order.status}
                          onChange={(e) => {
                            const newOrders = orders.map(o => 
                              o.id === order.id ? {...o, status: e.target.value as OrderStatus} : o
                            );
                            setOrders(newOrders);
                            toast.success('Статус заказа обновлён');
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
                        <div><span className="text-muted-foreground">Адрес:</span> {order.address}</div>
                        <div><span className="text-muted-foreground">Вес:</span> {order.weight} кг • <span className="text-muted-foreground">Стоимость:</span> {calculatePrice(order.weight)}₽</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Пункты выдачи</CardTitle>
                <CardDescription>Управление пунктами забора посылок</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pickupPoints.map((point) => (
                  <div key={point.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{point.name}</div>
                      <div className="text-sm text-muted-foreground">{point.address}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setPickupPoints(pickupPoints.filter(p => p.id !== point.id));
                        toast.success('Пункт выдачи удалён');
                      }}>
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить пункт выдачи
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новый пункт выдачи</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input id="new-point-name" placeholder="Озон" />
                      </div>
                      <div className="space-y-2">
                        <Label>Адрес</Label>
                        <Input id="new-point-address" placeholder="Сочи, ул. Навагинская, 12" />
                      </div>
                      <Button className="w-full" onClick={() => {
                        const name = (document.getElementById('new-point-name') as HTMLInputElement).value;
                        const address = (document.getElementById('new-point-address') as HTMLInputElement).value;
                        if (name && address) {
                          setPickupPoints([...pickupPoints, { id: Date.now(), name, address }]);
                          toast.success('Пункт выдачи добавлен');
                        }
                      }}>
                        Добавить
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Настройки сайта</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Название компании</Label>
                  <Input defaultValue="Бери Бокс" />
                </div>
                <div className="space-y-2">
                  <Label>Телефон поддержки</Label>
                  <Input defaultValue="+7 918 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="info@beribox.ru" />
                </div>
                <div className="space-y-2">
                  <Label>Базовый тариф (до 10 кг), ₽/кг</Label>
                  <Input type="number" defaultValue="120" />
                </div>
                <div className="space-y-2">
                  <Label>Оптимальный тариф (от 10 кг), ₽/кг</Label>
                  <Input type="number" defaultValue="100" />
                </div>
                <Button onClick={() => toast.success('Настройки сохранены')}>
                  Сохранить настройки
                </Button>
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
        <h2 className="text-4xl font-bold text-center mb-12">О компании Бери Бокс</h2>
        
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-lg leading-relaxed mb-4">
                <span className="font-semibold text-primary">Бери Бокс</span> — это надёжный сервис курьерской доставки между Сочи и Абхазией. 
                Мы специализируемся на доставке посылок из популярных интернет-магазинов и пунктов выдачи.
              </p>
              <p className="text-lg leading-relaxed">
                Наша миссия — сделать международную доставку быстрой, удобной и доступной для каждого.
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
                  <div className="text-muted-foreground">info@beribox.ru</div>
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
      {activeSection === 'home' && renderHome()}
      {activeSection === 'tariffs' && renderTariffs()}
      {activeSection === 'tracking' && renderTracking()}
      {activeSection === 'cabinet' && renderCabinet()}
      {activeSection === 'about' && renderAbout()}
      {activeSection === 'contacts' && renderContacts()}
      {activeSection === 'admin' && isAdmin && renderAdmin()}

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Package" size={28} className="text-accent" />
                <span className="text-xl font-bold">Бери Бокс</span>
              </div>
              <p className="text-gray-400">Быстрая и надёжная доставка из Сочи в Абхазию</p>
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
                <div>info@beribox.ru</div>
                <div>г. Сочи, ул. Навагинская, 12</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            © 2026 Бери Бокс. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
