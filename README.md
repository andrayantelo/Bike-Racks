# A bikerack quality reporting app.

```
pip3 install --user venv
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
pushd src
pip install -e .
popd
```

# Initialize the db
```
FLASK_APP=bikeracks flask init-db
# The app will run as group www-data and needs write access
sudo chgrp -R www-data src/instance
sudo chmod -R 664 src/instance
```

# To develop
```
FLASK_ENV=development FLASK_APP=bikeracks flask run --host 0.0.0.0 --port 9000
```

# Production serving
```
sudo uwsgi --ini config/uwsgi-bikeracks.ini
```

Then configure e.g. Nginx to do wsgi passthrough as needed, e.g.:

```
# Virtual Host configuration for bikeracks
server {
	listen 80;
	listen [::]:80;

	server_name example.com;

	root /var/www/;

	index index.html;

	location / {
		try_files $uri @bikeracks;
	}

	location @bikeracks {
		include uwsgi_params;
		uwsgi_pass unix:/tmp/bikeracks.sock;
	}
}
```
![Alt text](https://raw.githubusercontent.com/andrayantelo/Bike-Racks/master/mobileimg.png)
