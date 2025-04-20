import os
import shutil

def delete_migrations():
    """Delete all migration files except __init__.py"""
    apps = ['users']
    for app in apps:
        migrations_dir = os.path.join(app, 'migrations')
        if os.path.exists(migrations_dir):
            for filename in os.listdir(migrations_dir):
                filepath = os.path.join(migrations_dir, filename)
                if os.path.isfile(filepath) and filename != '__init__.py' and filename.endswith('.py'):
                    print(f"Removing {filepath}")
                    os.remove(filepath)
            print(f"Kept {migrations_dir}/__init__.py")

if __name__ == "__main__":
    print("This script will delete migration files for the users app.")
    print("Make sure you have a backup of your database if needed.")
    response = input("Do you want to continue? (y/n): ")
    if response.lower() == 'y':
        delete_migrations()
        print("\nMigration files deleted. Now follow these steps:")
        print("1. Connect to MongoDB and drop the database or collections")
        print("2. Run: python manage.py makemigrations")
        print("3. Run: python manage.py migrate")
        print("4. Create a new superuser: python manage.py createsuperuser")
    else:
        print("Operation cancelled.")
