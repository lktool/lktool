from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('contact', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='contactsubmission',
            name='admin_reply',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='contactsubmission',
            name='admin_reply_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
