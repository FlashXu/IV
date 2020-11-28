
mapboxgl.accessToken = 'pk.eyJ1Ijoid2FuZ2psNzciLCJhIjoiY2tlbGlkcm8zMjFybTJ5bnY5NG9uaTBqNyJ9.Hgrbgzz2aJ3_kLLa-AryVw';
var map=make_map();
var canvas = map.getCanvasContainer();
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

var geolocate = new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
    trackUserLocation: true
});
map.addControl(geolocate);
var userpos = [0,0]

map.on('load', function() {
  var statusNames = ['Cafes and Restaurants', 'Takeaway Food Services'];
  let statusColors = ['red', 'yellow'];

  // Request location on load
  geolocate.trigger();

  geolocate.on('geolocate', function(e) {
      var lon = e.coords.longitude;
      var lat = e.coords.latitude
      userpos = [lon, lat];
      console.log(userpos);
  });

  for (let i = 0; i < statusNames.length; i++) {
	//adds elements to the basemap
    let statusName = statusNames[i];
    let statusColor = statusColors[i];
    add_layer(map, statusColor, statusName);
    make_legend(statusColor,statusName);
    make_button(statusName, map);
    set_mouse_properties(map, statusName);


	map.on('click', statusName, function(e) {
	//collects features of the business for display
	var tradingName = e.features[0].properties['Trading name'];
	var longitude = e.features[0].properties['longitude'];
	var latitude = e.features[0].properties['latitude'];
	var address = e.features[0].properties['Street address'];

	var myurl = 'https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/search?term=' + tradingName + '&longitude=' + longitude + '&latitude=' + latitude;

	 //function that sends a request for information from the Yelp! API
	 $.ajax({
            url: myurl,
            headers: {
             'Authorization':'Bearer SDAOAY5yWXKAfHUdxFmDhZ9pG_-oV5HSfhmr1iv44a5gXpG1sWlVLBO3bGwVQQfwiJUL6dGWeluVuvLsj3vItKIZ8L8ofAwPVXzPu0_7I0qF5nQbp5aN8rPwWcd9X3Yx',
         },
            method: 'GET',
            dataType: 'json',
            success: function(data, status){
				var popupCard = document.getElementById('popup-card');
				if (popupCard == null){return};
				var query_name = popupCard.getAttribute("query_name");

				var businesses = JSON.parse(JSON.stringify(data))['businesses'];

				//if the business exists obtain details on it and put it in an popup with 2 columns
				if (businesses.length > 0){
					businesses = businesses[0];
					var name = JSON.stringify(businesses['name']);
					if (name.toLowerCase().indexOf(query_name) == -1){return};

					var[img_url, is_closed, categories_txt, rating, phone]=extract_data(businesses);
					var closure= (!is_closed) ? "Currently closed" : "Currently open";
					var star = '\u2605';
					document.getElementById('popup-card').innerHTML = (
					wrap('<h2>' + tradingName + '</h2>'+
					'<b>Address: </b>' + address +
					'<br><b>Establishment type:</b> ' + categories_txt +
					'<br><b>Rating: </b>' + star.repeat(parseInt(rating)) +
					'<br><b>Phone number:  </b>' + phone +
					'<br>'+closure, 'class="lcolumn"', "div")
					+
					wrap('<img src=' + img_url +  'width=200px height=200px/>', 'class="rcolumn"', "div"));


					document.getElementById('popup-card').style['width'] = "500px";

				};

            },
			error: function(errorThrown){
				console.log(errorThrown);
			}
         });

	//this is the default popup if no Yelp! entry exists
	new mapboxgl.Popup().setLngLat(e.lngLat)
	.setHTML('<div id="popup-card" query_name="' + tradingName.toLowerCase() + '"><div>'+
					'<h2>' + tradingName + '</h2>'+
					'<b>Address: </b>' + address)
	.addTo(map);
	});
  };

	allow_sidebar_collapse();




});


function allow_sidebar_collapse(){
	  //enables the sidebar to be collapsed in the UI
	  var hide_sidebar = document.getElementById('sidebarCollapse');
	  hide_sidebar.onclick = function(){
		var sidebar = document.getElementById('sidebar_btn_ul');
		var sidebarTitle = document.getElementById('sidebarTitle');

		if (sidebar.style.display == 'none'){
			sidebar.style.display = 'block';
			sidebarTitle.style.display = 'block';
		}else{
			sidebar.style.display = 'none';
			sidebarTitle.style.display = 'none';
		}
	}
}


function make_map(){
  //draws the basemap
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wangjl77/ckghtky5t0j4m19qhwzkdn6uh',
    center: [144.93, -37.81],

    zoom: 12.5
  });
  return map

}

function add_layer(map, statusColor, statusName) {
	//adds a resturaunt overlay
    map.addLayer({
      id: statusName,
      type: 'circle',
      source: {
        type: 'vector',
        url: 'mapbox://hikari1119.4bgqncmi'
      },
      'source-layer': 'Cafe__restaurant__bistro_seat-bfogwe',
      "paint": {
        "circle-color": statusColor,
		"circle-radius": 5
      },
      'filter': ['==', 'Industry (ANZSIC4) description', statusName]
    }, 'building');
}

function make_legend(statusColor,statusName ){
       	//create legend
        let item = document.createElement('div');
        let key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = statusColor;

        let value = document.createElement('span');
        value.innerHTML = statusName;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
}


function make_button(statusName, map){
	//set visibility on linked elements
    var link = document.createElement('a');
    var layers = document.getElementById('sidebar_btn_ul');
	  var link_ul = document.createElement('li');
    layers.appendChild(link_ul);
	  link_ul.appendChild(link);

    link.onclick = function(e) {
      let clickedLayer = this.textContent;
      e.preventDefault();
      e.stopPropagation();

      let visibility = map.getLayoutProperty(clickedLayer, 'visibility');

      if (visibility === 'visible') {
        map.setLayoutProperty(clickedLayer, 'visibility', 'none');
        this.className = '';
      } else {
        this.className = 'active';
        map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
      }
    };

    link.href = '#';
    link.className = '';
    link.textContent = statusName;
	map.setLayoutProperty(statusName, 'visibility', 'none');
  }

function set_mouse_properties(map, statusName){
	// Change the icon to a pointer icon when you mouse over a building
	map.on('mouseenter', statusName, function() {
	  map.getCanvas().style.cursor = 'pointer';
	});

	// Change it back to a pan icon when it leaves.
	map.on('mouseleave', statusName, function() {
	  map.getCanvas().style.cursor = '';
	});
}

function extract_data(businesses){
	//collects data from Yelp! API replies
	var img_url = JSON.stringify(businesses['image_url']);
	var is_closed = JSON.stringify(businesses['is_closed']);
	var categories = businesses['categories'];
	var categories_txt = ''
	var inntxt = ''

	for (let i = 0; i < categories.length; i++) {
		inntxt = JSON.stringify(categories[i]['title'])
		inntxt = inntxt.replace(/"/g, "");
		if (i!=0){
			categories_txt +=', '
			}
		categories_txt += (inntxt);
	}

	var rating = JSON.stringify(businesses['rating']);
	var phone = JSON.stringify(businesses['phone']);
	phone = phone.replace(/"/g, "");
	return [img_url, is_closed, categories_txt, rating, phone];

}

function wrap(to_wrap, arguments, tag){
	//wraps in HTML tags
	return "<" + tag+ " "+arguments+" "+">"+to_wrap+"</"+tag+">"
}

// create a function to make a directions request
function getRoute(end) {
  // make a directions request using cycling profile
  // an arbitrary start will always be the same
  // only the end or destination will change

  var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + userpos[0] + ',' + userpos[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

  // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  req.onload = function() {
    var json = JSON.parse(req.response);
    var data = json.routes[0];
    var route = data.geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
    // if the route already exists on the map, reset it using setData
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else { // otherwise, make a new request
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson
            }
          }
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75
        }
      });
    }
    // add turn instructions here at the end
  var instructions = document.getElementById('instructions');
  var steps = data.legs[0].steps;
  //shows trip instructions
  var tripInstructions = [];
  for (var i = 0; i < steps.length; i++) {
    tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
    instructions.innerHTML = '<b>Walking instructions</b><br><span class="duration">Journey time: ' + Math.floor(data.duration / 60) + ' min </span>' + tripInstructions;
  }
};
  req.send();

}

// Creates a new route based on where the user clicks on the map
map.on('click', function(e) {
  var coordsObj = e.lngLat;
  canvas.style.cursor = '';
  var coords = Object.keys(coordsObj).map(function(key) {
    return coordsObj[key];
  });
  var end = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: coords
      }
    }
    ]
  };
  if (map.getLayer('end')) {
    map.getSource('end').setData(end);
  } else {
    map.addLayer({
      id: 'end',
      type: 'circle',
      source: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: coords
            }
          }]
        }
      },
      paint: {
        'circle-radius': 10,
        'circle-color': '#f30'
      }
    });
  }
  getRoute(coords);

});
