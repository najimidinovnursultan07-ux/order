from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Создаёт суперпользователя admin, если его ещё нет в базе'

    USERNAME = 'admin'
    PASSWORD = 'admin123'
    EMAIL = 'admin@example.com'

    def handle(self, *args, **options):
        User = get_user_model()

        if User.objects.filter(username=self.USERNAME).exists():
            self.stdout.write(
                self.style.WARNING(f'Суперпользователь "{self.USERNAME}" уже существует — пропуск.')
            )
            return

        User.objects.create_superuser(
            username=self.USERNAME,
            email=self.EMAIL,
            password=self.PASSWORD,
        )
        self.stdout.write(
            self.style.SUCCESS(f'Суперпользователь "{self.USERNAME}" успешно создан.')
        )
