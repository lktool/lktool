"""
Script to fix migration dependency issues between users and admin apps.
"""
import os
import django
from django.db import connection

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

def fix_migrations():
    """Fix migration dependency issues by faking migrations in correct order"""
    from django.core.management import call_command
    
    print("Starting migration dependency fix...")
    
    # First, check if users.0002_usersubscription exists in migration history
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM django_migrations WHERE app='users' AND name='0002_usersubscription'")
        migration_exists = cursor.fetchone() is not None
    
    if migration_exists:
        print("Migration users.0002_usersubscription already exists in history.")
    else:
        print("Migration users.0002_usersubscription not found in history.")
        print("Faking the migration...")
        
        # Fake the migration
        try:
            call_command('migrate', 'users', '0002_usersubscription', fake=True)
            print("Successfully faked users.0002_usersubscription migration.")
        except Exception as e:
            print(f"Error faking migration: {str(e)}")
            
    # Now try to run all migrations to make sure everything is consistent
    print("Running migrations to ensure consistency...")
    try:
        call_command('migrate')
        print("All migrations completed successfully.")
    except Exception as e:
        print(f"Error running migrations: {str(e)}")
        print("You may need to manually reset migrations.")
    
    print("Migration fix process completed.")

if __name__ == '__main__':
    fix_migrations()
