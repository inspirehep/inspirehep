from django.contrib.auth.models import Group

admin_group, created = Group.objects.get_or_create(name="admin")
curator_group, created = Group.objects.get_or_create(name="curator")
