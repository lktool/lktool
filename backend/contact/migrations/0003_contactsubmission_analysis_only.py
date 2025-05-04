from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('contact', '0002_contactsubmission_analysis_contactsubmission_user'),
    ]

    operations = [
        # Since we've already tried to add analysis, we'll handle it differently
        # Check if the column exists first
        migrations.RunSQL(
            # Add analysis column if it doesn't exist
            """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM information_schema.columns
                    WHERE table_name = 'contact_contactsubmission'
                    AND column_name = 'analysis'
                ) THEN
                    ALTER TABLE contact_contactsubmission ADD COLUMN analysis jsonb NULL;
                END IF;
            END $$;
            """,
            # No reverse operation needed
            ""
        ),
    ]
