import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context):
    """API для управления пунктами выдачи"""
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
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
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
            
            if not name or not address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Название и адрес обязательны'}),
                    'isBase64Encoded': False
                }
            
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
            
            if not point_id or not name or not address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'ID, название и адрес обязательны'}),
                    'isBase64Encoded': False
                }
            
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
