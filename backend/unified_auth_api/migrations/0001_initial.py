from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('contact', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SubmissionAnalysis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('strengths', models.JSONField(blank=True, null=True)),
                ('weaknesses', models.JSONField(blank=True, null=True)),
                ('recommendations', models.JSONField(blank=True, null=True)),
                ('score', models.IntegerField(blank=True, null=True)),
                ('analyzed_at', models.DateTimeField(auto_now_add=True)),
                ('submission', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='detailed_analysis', to='contact.contactsubmission')),
            ],
            options={
                'verbose_name': 'LinkedIn Profile Analysis',
                'verbose_name_plural': 'LinkedIn Profile Analyses',
            },
        ),
    ]
