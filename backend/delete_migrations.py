import os
import glob

def delete_migrations():
    """Delete all migration files except __init__.py"""
    migration_pattern = os.path.join('users', 'migrations', '*.py')
    for migration_file in glob.glob(migration_pattern):
        if os.path.basename(migration_file) != '__init__.py':
            print(f"Removing {migration_file}")
            os.remove(migration_file)
    
    # Ensure __init__.py exists
    init_file = os.path.join('users', 'migrations', '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            pass
        print(f"Created {init_file}")

if __name__ == "__main__":
    delete_migrations()
    print("\nMigration files deleted. Now follow these steps:")
    print("1. Update your models.py file")
    print("2. Run: python manage.py makemigrations")
    print("3. Run: python manage.py migrate")
