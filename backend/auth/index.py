import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширует пароль"""
    return hashlib.sha256(password.encode()).hexdigest()

def handler(event: dict, context):
    """API для авторизации и регистрации пользователей"""
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'login':
                email = body.get('email', '').strip()
                password = body.get('password', '')
                
                if not email or not password:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email и пароль обязательны'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                cursor.execute(
                    "SELECT id, email, name, phone, is_admin FROM users WHERE email = %s AND password_hash = %s",
                    (email, password_hash)
                )
                user = cursor.fetchone()
                
                if user:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'success': True, 'user': dict(user)}),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 401,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Неверный email или пароль'}),
                        'isBase64Encoded': False
                    }
            
            elif action == 'register':
                email = body.get('email', '').strip()
                password = body.get('password', '')
                name = body.get('name', '').strip()
                phone = body.get('phone', '').strip()
                
                if not email or not password or not name:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Email, пароль и имя обязательны'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
                if cursor.fetchone():
                    return {
                        'statusCode': 409,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Пользователь с таким email уже существует'}),
                        'isBase64Encoded': False
                    }
                
                password_hash = hash_password(password)
                cursor.execute(
                    "INSERT INTO users (email, password_hash, name, phone) VALUES (%s, %s, %s, %s) RETURNING id, email, name, phone, is_admin",
                    (email, password_hash, name, phone)
                )
                user = cursor.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True, 'user': dict(user)}),
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
