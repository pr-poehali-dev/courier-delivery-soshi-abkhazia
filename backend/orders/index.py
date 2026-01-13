import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def calculate_volumetric_weight(length: float, width: float, height: float, volume_factor: float = 5000) -> float:
    """Рассчитывает объемный вес"""
    return (length * width * height) / volume_factor

def calculate_price(weight: float, length: float = None, width: float = None, height: float = None) -> float:
    """Рассчитывает стоимость доставки с учетом габаритов"""
    actual_weight = weight
    
    if length and width and height:
        volumetric_weight = calculate_volumetric_weight(length, width, height)
        actual_weight = max(weight, volumetric_weight)
    
    if actual_weight < 10:
        return actual_weight * 120
    return actual_weight * 100

def generate_order_number(order_id: int) -> str:
    """Генерирует номер заказа"""
    return f"BB-{str(order_id).zfill(3)}"

def handler(event: dict, context):
    """API для управления заказами"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id = params.get('user_id')
            order_id = params.get('order_id')
            
            if order_id:
                cursor.execute(
                    "SELECT * FROM orders WHERE id = %s",
                    (order_id,)
                )
                order = cursor.fetchone()
                if order:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(dict(order), default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Заказ не найден'}),
                        'isBase64Encoded': False
                    }
            
            if user_id:
                cursor.execute(
                    "SELECT * FROM orders WHERE user_id = %s ORDER BY created_at DESC",
                    (user_id,)
                )
            else:
                cursor.execute("SELECT * FROM orders ORDER BY created_at DESC")
            
            orders = cursor.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(order) for order in orders], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            user_id = body.get('user_id')
            recipient_name = body.get('recipient_name', '').strip()
            recipient_phone = body.get('recipient_phone', '').strip()
            delivery_address = body.get('delivery_address', '').strip()
            weight = float(body.get('weight', 0))
            length = float(body.get('length', 0)) if body.get('length') else None
            width = float(body.get('width', 0)) if body.get('width') else None
            height = float(body.get('height', 0)) if body.get('height') else None
            delivery_type = body.get('delivery_type', 'home')
            comment = body.get('comment', '').strip()
            pickup_point_id = body.get('pickup_point_id')
            delivery_point_id = body.get('delivery_point_id')
            
            if not recipient_name or not recipient_phone or weight <= 0:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все обязательные поля'}),
                    'isBase64Encoded': False
                }
            
            if delivery_type == 'pickup' and not delivery_point_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Выберите пункт выдачи'}),
                    'isBase64Encoded': False
                }
            
            price = calculate_price(weight, length, width, height)
            
            cursor.execute(
                """INSERT INTO orders (order_number, user_id, recipient_name, recipient_phone, 
                   delivery_address, weight, length, width, height, price, delivery_type, comment, status, pickup_point_id, delivery_point_id) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
                   RETURNING *""",
                ('TEMP', user_id, recipient_name, recipient_phone, delivery_address, 
                 weight, length, width, height, price, delivery_type, comment, 'processing', pickup_point_id, delivery_point_id)
            )
            order = cursor.fetchone()
            order_dict = dict(order)
            
            order_number = generate_order_number(order_dict['id'])
            cursor.execute(
                "UPDATE orders SET order_number = %s WHERE id = %s",
                (order_number, order_dict['id'])
            )
            order_dict['order_number'] = order_number
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(order_dict, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            order_id = body.get('order_id')
            status = body.get('status')
            
            if not order_id or not status:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID заказа и статус обязательны'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(
                "UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                (status, order_id)
            )
            order = cursor.fetchone()
            conn.commit()
            
            if order:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(order), default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заказ не найден'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()