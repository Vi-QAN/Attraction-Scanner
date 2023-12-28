from django.urls import path, re_path

from . import views
# from .views import (manifest, service_worker)
from .views import service_worker


app_name = 'world'
urlpatterns = [
    path('', views.LoginView.as_view(), name='login'),
    path('user/<int:userid>', views.HomeView.as_view(), name='home'),
    path('logout/', views.on_logout, name='logout'),
    path('user/attractions', views.get_attractions, name='get_attractions'),
    path('user/countryPolygon', views.get_country_polygon, name='get_country_polygon'),
    path('user/<int:userid>/favouriteList', views.favourite_list, name="favourite_list"),
    path('user/<int:userid>/favouriteList/<int:placeid>', views.favourite_place, name="favourite_place"),
    re_path(r"^serviceworker\.js$", service_worker, name="serviceworker"),
    # re_path(r"^manifest\.json$", manifest, name="manifest"),
]

