from django.urls import path

from . import views


app_name = 'world'
urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.on_logout, name='logout'),
    path('user/attractions', views.get_attractions, name='get_attractions'),
    path('user/countryPolygon', views.get_country_polygon, name='get_country_polygon'),
    path('user/favouriteList', views.add_favourite_place, name="add_favourite_place"),
    path('user/favouriteList/<int:placeid>', views.handle_favourite_place, name="favourite_place"),
]

