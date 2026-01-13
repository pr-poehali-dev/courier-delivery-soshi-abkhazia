import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const Calculator = () => {
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');

  const calculateVolumetricWeight = () => {
    if (!length || !width || !height) return 0;
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);
    return (l * w * h) / 5000;
  };

  const calculatePrice = () => {
    const w = Number(weight) || 0;
    const volWeight = calculateVolumetricWeight();
    const actualWeight = Math.max(w, volWeight);
    
    if (actualWeight < 10) return actualWeight * 120;
    return actualWeight * 100;
  };

  const volumetricWeight = calculateVolumetricWeight();
  const actualWeight = Math.max(Number(weight) || 0, volumetricWeight);
  const price = calculatePrice();

  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Калькулятор стоимости доставки
          </h2>
          <p className="text-muted-foreground text-lg">
            Рассчитайте точную стоимость с учётом веса и габаритов
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-2xl border-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="Calculator" size={28} className="text-primary" />
              Введите данные о посылке
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Weight" size={18} className="text-primary" />
                    Вес (кг) *
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold mb-2 flex items-center gap-2">
                    <Icon name="Box" size={18} className="text-primary" />
                    Габариты (см)
                  </Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm text-muted-foreground">Длина</Label>
                      <Input 
                        type="number" 
                        placeholder="30"
                        value={length}
                        onChange={(e) => setLength(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Ширина</Label>
                      <Input 
                        type="number" 
                        placeholder="20"
                        value={width}
                        onChange={(e) => setWidth(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Высота</Label>
                      <Input 
                        type="number" 
                        placeholder="10"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  {length && width && height && (
                    <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
                      <Icon name="Info" size={14} className="inline mr-1" />
                      Объём: {(Number(length) * Number(width) * Number(height)).toLocaleString()} см³
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {(weight || (length && width && height)) ? (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary to-blue-900 text-white p-8 rounded-2xl shadow-xl">
                      <div className="text-sm font-medium mb-2 opacity-90">Стоимость доставки</div>
                      <div className="text-5xl font-bold mb-4">{price.toFixed(0)}₽</div>
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <Icon name="TrendingDown" size={16} />
                        {actualWeight < 10 ? '120₽ за кг' : '100₽ за кг (скидка от 10 кг)'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Фактический вес:</span>
                        <Badge variant="outline" className="font-semibold">{Number(weight || 0).toFixed(1)} кг</Badge>
                      </div>
                      {volumetricWeight > 0 && (
                        <>
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm text-muted-foreground">Объёмный вес:</span>
                            <Badge variant="outline" className="font-semibold">{volumetricWeight.toFixed(1)} кг</Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                            <span className="text-sm font-medium">Расчётный вес:</span>
                            <Badge className="bg-primary font-bold">{actualWeight.toFixed(1)} кг</Badge>
                          </div>
                        </>
                      )}
                    </div>

                    {volumetricWeight > Number(weight || 0) && (
                      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <Icon name="AlertTriangle" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <strong>Объёмный вес больше!</strong> Стоимость рассчитывается по большему значению.
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-12 border-2 border-dashed rounded-2xl">
                    <Icon name="Package" size={64} className="mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-muted-foreground text-lg">
                      Укажите вес или габариты для расчёта
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Icon name="CheckCircle" size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">Тариф до 10 кг</div>
                    <div className="text-green-700">120₽ за килограмм</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Icon name="TrendingDown" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900 mb-1">Тариф от 10 кг</div>
                    <div className="text-blue-700">100₽ за килограмм (скидка 17%)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            <Icon name="Info" size={14} className="inline mr-1" />
            Объёмный вес = (Длина × Ширина × Высота) / 5000. Для расчёта используется больший из весов.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
