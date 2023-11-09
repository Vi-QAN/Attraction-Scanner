from django.contrib import messages
from django.shortcuts import redirect

import os
from .models import FavouritePlace, WorldBorder
from django.contrib.gis.geos import GEOSGeometry
from django.shortcuts import render
from django.urls import reverse
from django.views import generic
import json
import requests
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.utils.decorators import method_decorator
from django.contrib.auth.forms import AuthenticationForm


User = get_user_model()
# user = User.objects.create(username='john_doe', password='password123')

# Create your views here.

# class IndexView (generic.ListView):

class HomeView (generic.View):
    model = FavouritePlace
    template_name = 'world/map.html'

    @method_decorator(login_required(redirect_field_name='next', login_url='/accounts/login'))
    def get(self, request, *args, **kwargs):
        context = {}
        userid = request.GET.get('userid')
        context['favourite_list'] = FavouritePlace.objects.filter(userid=userid)
        context['countries'] = WorldBorder.objects.only('id','name').order_by('name')
        context['userid'] = userid

        return render(request, self.template_name, context)

class LoginView (generic.View):
    template_name = 'world/login.html'

    def post(self, request):
        if request.method == 'POST':
            form = AuthenticationForm(request, request.POST)
            if form.is_valid():
                username = form.cleaned_data.get('username')
                password = form.cleaned_data.get('password')
                user = authenticate(request, username=username, password=password)

                if user is not None:
                    login(request, user)
                    return redirect(reverse('world:home') + '?userid=' + str(user.id))  # Replace 'home' with your desired redirect URL after successful login
                else:
                    messages.error(request, 'Invalid username or password')
            else:
                messages.error(request, 'Invalid username or password')
        else:
            form = AuthenticationForm()

    def get(self, request):
        return render(request, self.template_name)


@login_required(redirect_field_name='next', login_url='/accounts/login')
def get_country_polygon(request):
    if request.method == "GET":

        id = request.GET.get('countryId')
        result = WorldBorder.objects.get(id=id)

        geojson_data = {

            "type": "Feature",
            "properties": {
                "name": result.name,
                "lat": result.lat,
                "lon": result.lon,

            },
            "geometry": json.loads(GEOSGeometry(result.mpoly).json)

        }
        return JsonResponse({'item' : geojson_data})

@login_required(redirect_field_name='next', login_url='/accounts/login')
def get_attractions(request):
    url = "https://opentripmap-places-v1.p.rapidapi.com/en/places/radius"

    radius = request.GET.get('radius')
    lon = request.GET.get('lon')
    lat = request.GET.get('lat')

    querystring = {"radius": str(radius), "lon": str(lon), "lat": str(lat)}

    headers = {
        "X-RapidAPI-Key": str(os.environ.get('API_KEY')),
        "X-RapidAPI-Host": "opentripmap-places-v1.p.rapidapi.com"
    }

    try:

        response = requests.get(url, headers=headers, params=querystring)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Parse the JSON response (if the API returns JSON)
            api_data = response.json()

            # Process the data as needed
            items = []
            for item in api_data['features']:
                if item['properties']['name']:
                    items.append({
                        "id": item['id'],
                        "name": item['properties']['name'],
                        "distance": item['properties']['dist'],
                        "xid": item['properties']['xid'],

                        "lon": item['geometry']['coordinates'][0],
                        "lat": item['geometry']['coordinates'][1],

                        # "wikidata": item['properties']['wikidata'],
                        "rate": item['properties']['rate']
                    })
            # For example, you can return it as a JSON response
            return JsonResponse({'items' : items}, status=response.status_code)

        else:
            # Handle other status codes (e.g., return an error response)
            return JsonResponse({'error': 'API request failed'}, status=response.status_code)

    except requests.exceptions.RequestException as e:
        # Handle exceptions, such as network errors
        return JsonResponse({'error': 'API request failed: ' + str(e)})

@login_required(redirect_field_name='next', login_url='/accounts/login')
def on_logout(request):
    logout(request)
    return redirect('/accounts/login')


@login_required(redirect_field_name='next', login_url='/accounts/login')
def handle_favourite_place(request, placeid):
    try:
        userid = request.GET.get('userid')
        place = FavouritePlace.objects.get(id=placeid, userid=userid)
        data = json.dumps({
            "id": place.id,
            "name": place.name,
            "distance": place.distance,
            "xid": place.xid,

            "lon": place.lon,
            "lat": place.lat,

            # "wikidata": item['properties']['wikidata'],
            "rate": place.rate
        })

    except FavouritePlace.DoesNotExist:
        return JsonResponse({"error": "Place not found"}, status=404)
        pass

    if request.method == "GET":
        response_data = {'message': data}
        return JsonResponse(response_data)
    elif request.method == "DELETE":

        # Delete the object
        place.delete()
        response_data = {'message': 'Place deleted successfully.'}
        return JsonResponse(response_data)
@login_required(redirect_field_name='next', login_url='/accounts/login')
def add_favourite_place(request):
    if request.method == "POST":
        data = json.loads(request.body)
        # Process the JSON data
        response_data = {"message": "Data received and processed successfully."}
        user = User.objects.get(id=data['userid'])
        try:
            FavouritePlace.objects.get(id=data['id'])
        except:
            FavouritePlace.objects.create(id=data['id'], userid=user, name=data['name'], distance=data['distance'],
                                          xid=data['xid'], rate=data['rate'], lon=data['lon'], lat=data['lat'])
            return JsonResponse(response_data, status=200)
        return JsonResponse({"error" : "Place is already added"}, status=409)
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)



