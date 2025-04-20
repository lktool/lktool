import os
import shutil

def delete_migrations():
    """Delete all migration files except __init__.py"""
    apps = ['users']
    for app in apps:
        migrations_dir = os.path.join('users', 'migrations')
        if os.path.exists(migrations_dir):
            for filename in os.listdir(migrations_dir):
                filepath = os.path.join(migrations_dir, filename)
                if os.path.isfile(filepath) and filename != '__init__.py' and filename.endswith('.py'):
                    print(f"Removing {filepath}")
                    os.remove(filepath)
            print(f"Kept {migrations_dir}/__init__.py")

if __name__ == "__main__":
    delete_migrations()
    print("Migration files deleted. Now run:")
    print("1. Connect to MongoDB and drop the database or collections")
    print("2. python manage.py makemigrations")
    print("3. python manage.py migrate")
