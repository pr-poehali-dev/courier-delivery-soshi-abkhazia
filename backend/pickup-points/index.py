import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import qrcode
import io
import base64

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_qr_code(order_number: str) -> str:
    """Генерирует QR-код для заказа"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f"BERIBOX-{order_number}")
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f'data:image/png;base64,{img_str}'

def handler(event: dict, context):
    """API для управления пунктами выдачи и генерации QR-кодов"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action', 'pickup')
        
        if action == 'qr':
            if method == 'POST':
                body = json.loads(event.get('body', '{}'))
                order_number = body.get('order_number', '')
                
                if not order_number:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Номер заказа обязателен'}),
                        'isBase64Encoded': False
                    }
                
                qr_code = generate_qr_code(order_number)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'qr_code': qr_code,
                        'order_number': order_number
                    }),
                    'isBase64Encoded': False
                }
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            if action == 'delivery':
                cursor.execute("SELECT * FROM delivery_points_abkhazia WHERE is_active = TRUE ORDER BY city, name")
            else:
                cursor.execute("SELECT * FROM pickup_points WHERE is_active = TRUE ORDER BY name")
            points = cursor.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(point) for point in points], default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name', '').strip()
            address = body.get('address', '').strip()
            city = body.get('city', '').strip()
            
            if not name or not address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название и адрес обязательны'}),
                    'isBase64Encoded': False
                }
            
            if action == 'delivery':
                if not city:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Город обязателен для пункта доставки'}),
                        'isBase64Encoded': False
                    }
                cursor.execute(
                    "INSERT INTO delivery_points_abkhazia (name, address, city) VALUES (%s, %s, %s) RETURNING *",
                    (name, address, city)
                )
            else:
                cursor.execute(
                    "INSERT INTO pickup_points (name, address) VALUES (%s, %s) RETURNING *",
                    (name, address)
                )
            point = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(point), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            point_id = body.get('id')
            name = body.get('name', '').strip()
            address = body.get('address', '').strip()
            city = body.get('city', '').strip()
            
            if not point_id or not name or not address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID, название и адрес обязательны'}),
                    'isBase64Encoded': False
                }
            
            if action == 'delivery':
                if not city:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Город обязателен'}),
                        'isBase64Encoded': False
                    }
                cursor.execute(
                    "UPDATE delivery_points_abkhazia SET name = %s, address = %s, city = %s WHERE id = %s RETURNING *",
                    (name, address, city, point_id)
                )
            else:
                cursor.execute(
                    "UPDATE pickup_points SET name = %s, address = %s WHERE id = %s RETURNING *",
                    (name, address, point_id)
                )
            point = cursor.fetchone()
            conn.commit()
            
            if point:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(point), default=str),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пункт выдачи не найден'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            body = json.loads(event.get('body', '{}'))
            point_id = body.get('id')
            
            if not point_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID обязателен'}),
                    'isBase64Encoded': False
                }
            
            if action == 'delivery':
                cursor.execute(
                    "UPDATE delivery_points_abkhazia SET is_active = FALSE WHERE id = %s RETURNING *",
                    (point_id,)
                )
            else:
                cursor.execute(
                    "UPDATE pickup_points SET is_active = FALSE WHERE id = %s RETURNING *",
                    (point_id,)
                )
            point = cursor.fetchone()
            conn.commit()
            
            if point:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пункт выдачи не найден'}),
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
