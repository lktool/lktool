from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('contact', '0001_initial'),  # This must be the actual existing previous migration
    ]

    operations = [
        migrations.AddField(
            model_name='contactsubmission',
            name='analysis',
            field=models.JSONField(blank=True, null=True),
        ),
    ]
