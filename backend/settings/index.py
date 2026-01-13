import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context):
    """API для управления настройками сайта"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
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
