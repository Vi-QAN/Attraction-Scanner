from django.contrib.gis import admin
from .models import WorldBorder, FavouritePlace

admin.site.register(WorldBorder, admin.GISModelAdmin)
admin.site.register(FavouritePlace)
