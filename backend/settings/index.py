import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context):
    """API для управления настройками сайта и FAQ"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        params = event.get('queryStringParameters', {}) or {}
        resource = params.get('resource', 'settings')
        
        if resource == 'statuses':
            if method == 'GET':
                cursor.execute("SELECT * FROM order_statuses WHERE is_active = TRUE ORDER BY order_position")
                statuses = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(item) for item in statuses], default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                status_key = body.get('status_key', '').strip()
                status_label = body.get('status_label', '').strip()
                status_color = body.get('status_color', 'bg-gray-100 text-gray-800').strip()
                order_position = body.get('order_position', 0)
                
                if not status_key or not status_label:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Ключ и название статуса обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "INSERT INTO order_statuses (status_key, status_label, status_color, order_position) VALUES (%s, %s, %s, %s) RETURNING *",
                    (status_key, status_label, status_color, order_position)
                )
                status_item = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(status_item), default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'DELETE':
                body = json.loads(event.get('body', '{}'))
                status_id = body.get('id')
                
                if not status_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ID обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "UPDATE order_statuses SET is_active = FALSE WHERE id = %s RETURNING *",
                    (status_id,)
                )
                status_item = cursor.fetchone()
                conn.commit()
                
                if status_item:
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
                        'body': json.dumps({'error': 'Статус не найден'}),
                        'isBase64Encoded': False
                    }
        
        elif resource == 'faq':
            if method == 'GET':
                cursor.execute("SELECT * FROM faq WHERE is_active = TRUE ORDER BY order_position")
                faq_items = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(item) for item in faq_items], default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'POST':
                body = json.loads(event.get('body', '{}'))
                question = body.get('question', '').strip()
                answer = body.get('answer', '').strip()
                order_position = body.get('order_position', 0)
                
                if not question or not answer:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Вопрос и ответ обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "INSERT INTO faq (question, answer, order_position) VALUES (%s, %s, %s) RETURNING *",
                    (question, answer, order_position)
                )
                faq_item = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(faq_item), default=str),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT':
                body = json.loads(event.get('body', '{}'))
                faq_id = body.get('id')
                question = body.get('question', '').strip()
                answer = body.get('answer', '').strip()
                order_position = body.get('order_position', 0)
                
                if not faq_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ID обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "UPDATE faq SET question = %s, answer = %s, order_position = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *",
                    (question, answer, order_position, faq_id)
                )
                faq_item = cursor.fetchone()
                conn.commit()
                
                if faq_item:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(dict(faq_item), default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'FAQ не найден'}),
                        'isBase64Encoded': False
                    }
            
            elif method == 'DELETE':
                body = json.loads(event.get('body', '{}'))
                faq_id = body.get('id')
                
                if not faq_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'ID обязателен'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "UPDATE faq SET is_active = FALSE WHERE id = %s RETURNING *",
                    (faq_id,)
                )
                faq_item = cursor.fetchone()
                conn.commit()
                
                if faq_item:
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
                        'body': json.dumps({'error': 'FAQ не найден'}),
                        'isBase64Encoded': False
                    }
        
        elif resource == 'settings':
            if method == 'GET':
                cursor.execute("SELECT * FROM settings ORDER BY key")
                settings = cursor.fetchall()
                settings_dict = {setting['key']: setting['value'] for setting in settings}
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(settings_dict),
                    'isBase64Encoded': False
                }
            
            elif method == 'PUT':
                body = json.loads(event.get('body', '{}'))
                
                for key, value in body.items():
                    cursor.execute(
                        """INSERT INTO settings (key, value) VALUES (%s, %s)
                           ON CONFLICT (key) DO UPDATE SET value = %s, updated_at = CURRENT_TIMESTAMP""",
                        (key, str(value), str(value))
                    )
                
                conn.commit()
                
                cursor.execute("SELECT * FROM settings ORDER BY key")
                settings = cursor.fetchall()
                settings_dict = {setting['key']: setting['value'] for setting in settings}
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(settings_dict),
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