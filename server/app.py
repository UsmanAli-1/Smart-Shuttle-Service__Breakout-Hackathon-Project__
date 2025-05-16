from flask import Flask, request, jsonify ,make_response
import pymysql
from datetime import datetime,timedelta
import bcrypt
import json
import requests
from flask_cors import CORS
from geopy.distance import geodesic
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity 

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = "cine833fbn9fj9f9f9jf" # Change this to a strong secret
jwt = JWTManager(app)



# Your GoMaps API settings
API_KEY = "AlzaSyJe_Ax9TO36SZIGCdL4OnGTtxBDj_DaJ6D"
API_URL = "https://maps.gomaps.pro/maps/api/directions/json"

# Database connection function
def Connection():
    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport"
        )
        return connection
    except pymysql.MySQLError as e:
        return None


# Function to hash passwords
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

# Duplicate check function for students and drivers
def DuplicateCheck(cnic, phone):
    try:
        connection = Connection()
        with connection.cursor() as cursor:
            sql_check = "SELECT * FROM Students WHERE CNIC = %s OR Contact = %s"
            cursor.execute(sql_check, (cnic, phone))
            result = cursor.fetchone()
            if result:
                return "Error: Student with the same CNIC or phone number already exists."
            return None
    except pymysql.MySQLError as e:
        return f"Database Error: {str(e)}"
    finally:
        if connection:
            connection.close()

# Function to validate time
def validate_time(pick_time, drop_time):
    try:
        if isinstance(pick_time, str):
            pick_time = datetime.strptime(pick_time, "%H:%M").time()
        if isinstance(drop_time, str):
            drop_time = datetime.strptime(drop_time, "%H:%M").time()

        if pick_time >= drop_time:
            return None, "Error: Pick-up time must be earlier than drop-off time."

        return (pick_time, drop_time), None
    except ValueError as e:
        return None, f"Error: Invalid time format. {str(e)}"

# Register a student
@app.route('/register/student', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    id = data.get('id')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    cnic = data.get('cnic')

    # Validate required fields
    if not all([name, id, email, password, phone, cnic]):
        return jsonify({"error": "All fields are required."}), 400

    # Check for duplicates
    duplicate_error = DuplicateCheck(cnic, phone)
    if duplicate_error:
        return jsonify({"error": duplicate_error}), 400

    hashed_password = hash_password(password)

    connection = None
    try:
        connection = Connection()
        with connection.cursor() as cursor:
            # Insert into Students table
            sql_students = """
            INSERT INTO Students (Name, ID, Email, Contact, CNIC)
            VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(sql_students, (name, id, email, phone, cnic))
            connection.commit()

            student_id = cursor.lastrowid

            # Insert into Users1 table
            sql_users = """
            INSERT INTO Users1 (Username, Password, Role, ReferenceID)
            VALUES (%s, %s, 'Student', %s)
            """
            cursor.execute(sql_users, (id, hashed_password, student_id))
            connection.commit()

        return jsonify({"message": "Student registration successful!"}), 201

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500

    finally:
        if connection:
            connection.close()
# ///////////////////////////////////////===student login ===//////////////////////////////////////////////////
# Student login function
# @app.route('/login/student', methods=['POST'])
# def login_student():
#     data = request.get_json()
#     id = data.get('id')
#     password = data.get('password')
    

#     connection = Connection()
#     if connection is None:
#         return jsonify({"error": "Unable to connect to the database."}), 500

#     try:
#         with connection.cursor() as cursor:
#             sql = """
#             SELECT u.Password, u.Role, s.Name 
#             FROM Users1 u 
#             JOIN Students s ON u.ReferenceID = s.StudentID 
#             WHERE u.Username = %s AND u.Role = 'Student'
#             """
#             cursor.execute(sql, (id,))
#             result = cursor.fetchone()

#             if result:
#                 stored_password, role, name = result
#                 if bcrypt.checkpw(password.encode('utf-8'), stored_password):
#                     return jsonify({"message": f"Login successful!"})
#                 else:
#                     return jsonify({"error": "Invalid ID or Password."}), 401
#             else:
#                 return jsonify({"error": "Invalid ID or Password."}), 401
#     except pymysql.MySQLError as e:
#         return jsonify({"error": f"Database Error: {str(e)}"}), 500
#     finally:
#         if connection:
#             connection.close()


# ===========================================

@app.route('/login/student', methods=['POST'])
def login_student():
    data = request.get_json()
    id = data.get('id')
    password = data.get('password')

    connection = Connection()
    if connection is None:
        return jsonify({"error": "Unable to connect to the database."}), 500

    try:
        with connection.cursor() as cursor:
            sql = """
            SELECT u.Password, u.Role, s.Name 
            FROM Users1 u 
            JOIN Students s ON u.ReferenceID = s.StudentID 
            WHERE u.Username = %s AND u.Role = 'Student'
            """
            cursor.execute(sql, (id,))
            result = cursor.fetchone()

            if result:
                stored_password, role, name = result
                if bcrypt.checkpw(password.encode('utf-8'), stored_password):

                    # Generate JWT token
                    access_token = create_access_token(
                        identity={"id": id, "role": role},  # ✅ Include user ID
                        expires_delta=timedelta(hours=1)  # Token expires in 1 hour
                    )

                    # Set token in a cookie
                    response = make_response(jsonify({"message": "Login successful!"}))
                    response.set_cookie('token', access_token, httponly=True, secure=True, samesite='Strict')

                    return response
                else:
                    return jsonify({"error": "Invalid ID or Password."}), 401
            else:
                return jsonify({"error": "Invalid ID or Password."}), 401
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        connection.close()


@app.route('/student/studentdashboard', methods=['GET'])
@jwt_required()  # Protect this route
def student_dashboard():
    # Get the current user's identity (from the token)
    current_user = get_jwt_identity()
    username = current_user["username"]

    # Now fetch data specific to this student
    connection = Connection()
    if connection is None:
        return jsonify({"error": "Unable to connect to the database."}), 500

    try:
        with connection.cursor() as cursor:
            sql = """
            SELECT s.Name, u.Username, u.Role 
            FROM Users1 u 
            JOIN Students s ON u.ReferenceID = s.StudentID 
            WHERE u.Username = %s
            """
            cursor.execute(sql, (username,))
            result = cursor.fetchone()

            if result:
                name, username, role = result
                return jsonify({
                    "name": name,
                    "id": username,
                    "role": role,
                })
            else:
                return jsonify({"error": "Student not found"}), 404

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()


# ===========================================



# //////////////////////////////////////////////////=== manager login funtion===//////////////////////////////

# Manager login function
@app.route('/login/manager', methods=['POST'])
def login_manager():
    data = request.get_json()
    username1 = data.get('username')
    password1 = data.get('password')

    connection = Connection()
    if connection is None:
        return jsonify({"error": "Unable to connect to the database."}), 500

    try:
        with connection.cursor() as cursor:
            sql = """
            SELECT Password, Role
            FROM Users1
            WHERE Username = %s AND Role = 'Manager'
            """
            cursor.execute(sql, (username1,))
            result = cursor.fetchone()

            if result:
                stored_password, role = result
                if bcrypt.checkpw(password1.encode('utf-8'), stored_password):
                    return jsonify({"message": f"Login successful!"})
                else:
                    return jsonify({"error": "Invalid Username or Password."}), 401
            else:
                return jsonify({"error": "Invalid Username or Password."}), 401
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

# Register a driver
@app.route('/register/driver', methods=['POST'])
def register_driver():
    data = request.get_json()
    name = data.get('name')
    password = data.get('password')
    phone = data.get('phone')
    cnic = data.get('cnic')

    duplicate_error = DuplicateCheck(cnic, phone)
    if duplicate_error:
        return jsonify({"error": duplicate_error}), 400

    hashed_password = hash_password(password)

    try:
        connection = Connection()
        with connection.cursor() as cursor:
            sql_drivers = """
            INSERT INTO Drivers (Name, Contact, CNIC)
            VALUES (%s, %s, %s)
            """
            cursor.execute(sql_drivers, (
                name, phone, cnic
            ))
            connection.commit()

            driver_id = cursor.lastrowid

            sql_users = """
            INSERT INTO Users1 (Username, Password, Role, DriverID)
            VALUES (%s, %s, 'Driver', %s)
            """
            cursor.execute(sql_users, (name, hashed_password, driver_id))
            connection.commit()
            
        return jsonify({"message": "Driver registration successful!"})

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

# # Driver login function
@app.route('/login/driver', methods=['POST'])
def login_driver():
    data = request.get_json()
    cnic = data.get('cnic')
    password = data.get('password')

    connection = Connection()
    if connection is None:
        return jsonify({"error": "Unable to connect to the database."}), 500

    try:
        with connection.cursor() as cursor:
            sql = """
            SELECT u.Password, u.Role, d.Name 
            FROM Users1 u 
            JOIN Drivers d ON u.DriverID = d.DriverID 
            WHERE d.CNIC = %s AND u.Role = 'Driver'
            """
            cursor.execute(sql, (cnic,))
            result = cursor.fetchone()

            if result:
                stored_password, role, name = result
                if bcrypt.checkpw(password.encode('utf-8'), stored_password):
                    return jsonify({"message": f"Login successful!"})
                else:
                    return jsonify({"error": "Invalid CNIC or Password."}), 401
            else:
                return jsonify({"error": "Invalid CNIC or Password."}), 401
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

# Register a vehicle
@app.route('/register/vehicle', methods=['POST'])
def register_vehicle():
    data = request.get_json()
    capacity = data.get('capacity')
    plate_number = data.get('plate_number')

    try:
        connection = Connection()
        with connection.cursor() as cursor:
            sql = "INSERT INTO Vehicles (Capacity, PlateNumber) VALUES (%s, %s)"
            cursor.execute(sql, (capacity, plate_number))
            connection.commit()

        return jsonify({"message": "Vehicle registration successful!"})

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

# ==================================////// map and route code  ///////======================================

# Function to calculate route details using GoMaps API
def add_route(stops):
    try:
        origin = f"{stops[0]['lat']},{stops[0]['lng']}"  # First stop
        destination = f"{stops[-1]['lat']},{stops[-1]['lng']}"  # Last stop
        waypoints = "|".join([f"{stop['lat']},{stop['lng']}" for stop in stops[1:-1]])  # Middle stops

        # Construct the API request parameters
        params = {
            "key": API_KEY,
            "origin": origin,
            "destination": destination,
            "waypoints": waypoints,
            "optimize_waypoints": "true",  # Optional, for route optimization
            "mode": "driving",  # Change to 'walking', 'bicycling', or 'transit' if necessary
        }

        # Make the GET request to GoMaps API
        response = requests.get(API_URL, params=params)

        if response.status_code == 200:
            data = response.json()

            if data['status'] == 'OK':
                route = data['routes'][0]
                total_distance = sum(leg['distance']['value'] for leg in route['legs']) / 1000  # Total distance in km

                # Compute DistanceToEnd for each stop
                distances_to_end = []
                for i, stop in enumerate(stops):
                    # Calculate distance from this stop to the end
                    stop_origin = f"{stop['lat']},{stop['lng']}"
                    params_distance = {
                        "key": API_KEY,
                        "origin": stop_origin,
                        "destination": destination,
                        "mode": "driving",
                    }
                    response_distance = requests.get(API_URL, params=params_distance)
                    if response_distance.status_code == 200:
                        distance_data = response_distance.json()
                        if distance_data['status'] == 'OK':
                            distance_to_end = sum(
                                leg['distance']['value'] for leg in distance_data['routes'][0]['legs']
                            ) / 1000
                            distances_to_end.append(distance_to_end)
                        else:
                            distances_to_end.append(None)  # If API call fails for this stop
                    else:
                        distances_to_end.append(None)

                return {
                    "success": True,
                    "optimized_stops": stops,
                    "total_distance": total_distance,
                    "distances_to_end": distances_to_end,
                    "directions": route,
                }
            else:
                return {"success": False, "error": "Routing failed", "details": data}
        else:
            return {"success": False, "error": f"API call failed with status {response.status_code}", "details": response.text}

    except Exception as e:
        return {"success": False, "error": str(e)}


# Flask route to receive stops and calculate route details
@app.route("/receive_stops", methods=["POST"])
def receive_stops():
    stops = request.json.get("stops", [])
    print("Received stops:", stops)  # Debugging: Check stops in the backend

    if not stops or len(stops) < 2:
        return "Error: At least two stops are required to calculate a route.", 400

    # Call the add_route function to calculate route details
    route_result = add_route(stops)

    if not route_result["success"]:
        return jsonify({"error": route_result["error"], "details": route_result.get("details", "")}), 400

    optimized_stops = route_result["optimized_stops"]
    total_distance = route_result["total_distance"]
    distances_to_end = route_result["distances_to_end"]

    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport",
        )
        with connection.cursor() as cursor:
            sql = """
                INSERT INTO Routes (Stops, TotalDistance, OptimizedStops, DistancesToEnd)
                VALUES (%s, %s, %s, %s)
            """
            cursor.execute(
                sql,
                (
                    json.dumps(stops),
                    total_distance,
                    json.dumps(optimized_stops),
                    json.dumps(distances_to_end),
                ),
            )
            connection.commit()

        return jsonify({
            "message": "Route added successfully!",
            "optimized_stops": optimized_stops,
            "total_distance": total_distance,
            "distances_to_end": distances_to_end,
        }), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()

# ===================================////// avaliability and assign code ////////=================================

@app.route("/get_routes", methods=["GET"])
def get_routes():
    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport",
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT RouteID FROM Routes")
            routes = [{"id": row[0]} for row in cursor.fetchall()]
        return jsonify(routes), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()


@app.route("/get_drivers", methods=["GET"])
def get_drivers():
    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport",
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT DriverID, Name FROM Drivers WHERE Availability = 1")
            drivers = [{"id": row[0], "name": row[1]} for row in cursor.fetchall()]
        return jsonify(drivers), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()


@app.route("/get_vans", methods=["GET"])
def get_vans():
    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport",
        )
        with connection.cursor() as cursor:
            cursor.execute("SELECT VehicleID, PlateNumber FROM Vehicles WHERE Status = 'Available'")
            vans = [{"id": row[0], "number": row[1]} for row in cursor.fetchall()]
        return jsonify(vans), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if connection:
            connection.close()


@app.route("/assign_route", methods=["POST"])
def assign_route():
    data = request.json
    route_id = data.get("route_id")
    driver_id = data.get("driver_id")
    van_id = data.get("van_id")
    departure_time = data.get("departure_time")  # Added time selection

    if not route_id or not driver_id or not van_id or not departure_time:
        return jsonify({"error": "Route ID, Driver ID, Van ID, and Departure Time are required."}), 400

    try:
        connection = pymysql.connect(
            host="database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
            user="admin",
            password="STSAI2025",
            database="SmartTransport",
        )

        with connection.cursor() as cursor:
            # Check if the van is available
            cursor.execute("SELECT Status FROM Vehicles WHERE VehicleID = %s", (van_id,))
            van_status = cursor.fetchone()
            if not van_status or van_status[0] != "Available":
                return jsonify({"error": "The selected van is not available."}), 400

            # Insert into RouteAssignments with departure time
            sql_assign = """
                INSERT INTO Assignments (RouteID, VehicleID, DriverID, Time, AssignmentDate)
                VALUES (%s, %s, %s, %s, CURDATE())
            """
            cursor.execute(sql_assign, (route_id, van_id, driver_id, departure_time))

            # Update van status to 'In Service'
            sql_update_van = "UPDATE Vehicles SET Status = 'In Service' WHERE VehicleID = %s"
            cursor.execute(sql_update_van, (van_id,))

            # Update driver status to 'Not Available'
            sql_update_driver = "UPDATE Drivers SET Availability = 0 WHERE DriverID = %s"
            cursor.execute(sql_update_driver, (driver_id,))

            connection.commit()

        return jsonify({"message": "Route assigned successfully!"}), 200

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    finally:
        if connection:
            connection.close()


# /////////////////////////////////===show driver code ===////////////////////////////////////////////////////


# Database connection details
DB_CONFIG = {
    "host": "database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
    "user": "admin",
    "password": "STSAI2025",
    "database": "SmartTransport",
}

# GoMaps.pro API details
GOMAPS_API_URL = "https://maps.gomaps.pro/maps/api/directions/json"
GOMAPS_API_KEY = "AlzaSyJe_Ax9TO36SZIGCdL4OnGTtxBDj_DaJ6D"  # Replace with your GoMaps.pro API key


@app.route("/get_route_map", methods=["GET"])
def get_route_map():
    driver_id = 1  # Hardcoded for testing purposes

    try:
        # Connect to the database
        connection = pymysql.connect(**DB_CONFIG)

        with connection.cursor() as cursor:
            # Fetch stops and vehicle for the driver
            sql_query = """
                SELECT 
                    Routes.Stops, 
                    Vehicles.PlateNumber
                FROM 
                    Assignments
                INNER JOIN 
                    Routes ON Assignments.RouteID = Routes.RouteID
                INNER JOIN 
                    Vehicles ON Assignments.VehicleID = Vehicles.VehicleID
                WHERE 
                    Assignments.DriverID = %s
            """
            cursor.execute(sql_query, (driver_id,))
            assignment = cursor.fetchone()

            if not assignment:
                return jsonify({"message": "No route assigned to this driver."}), 404

            stops, vehicle_number = assignment

            # Parse the JSON string of stops
            try:
                stop_coordinates = [
                    {"stop": f"Stop {index + 1}",
                     "lat": stop["lat"],
                     "lng": stop["lng"]}
                    for index, stop in enumerate(json.loads(stops))  # Parse the JSON string into a list of dictionaries
                ]
            except (ValueError, AttributeError) as e:
                return jsonify({"error": f"Invalid stops data: {str(e)}"}), 500

            # Get the coordinates (lat, lon) for routing
            coordinates = [(stop["lat"], stop["lng"]) for stop in stop_coordinates]

            # Request the route from GoMaps.pro API for each pair of consecutive stops
            route_coordinates = []
            for i in range(len(coordinates) - 1):
                start, end = coordinates[i], coordinates[i + 1]

                # Format the URL correctly
                api_url = f"{GOMAPS_API_URL}?origin={start[0]},{start[1]}&destination={end[0]},{end[1]}&key={GOMAPS_API_KEY}"

                # Send request to GoMaps.pro for directions
                response = requests.get(api_url)

                # Check if the request was successful
                if response.status_code == 200:
                    route_data = response.json()

                    if route_data["status"] == "OK":
                        # Extract the key points from the route
                        for route in route_data['routes'][0]['legs']:
                            for step in route['steps']:  # Iterate through each step for the leg
                                # Adding each step's location as a point
                                start_location = step['start_location']
                                end_location = step['end_location']
                                route_coordinates.append({"lat": start_location['lat'], "lng": start_location['lng']})
                                route_coordinates.append({"lat": end_location['lat'], "lng": end_location['lng']})

                    else:
                        return jsonify({"error": "No route found for the given coordinates."}), 500
                else:
                    return jsonify({"error": f"Failed to fetch route data from GoMaps.pro, Status Code: {response.status_code}"}), 500

            # Remove duplicates from the route coordinates
            seen_coordinates = set()
            unique_coordinates = []
            for coord in route_coordinates:
                key = (coord["lat"], coord["lng"])
                if key not in seen_coordinates:
                    unique_coordinates.append(coord)
                    seen_coordinates.add(key)

            return jsonify({
                "vehicle_number": vehicle_number,
                "route_coordinates": unique_coordinates
            }), 200

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Database Error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected Error: {str(e)}"}), 500
    finally:
        if 'connection' in locals() and connection:
            connection.close()

# //////////////////////////////////===show details on admin dashboard===////////////////////////////////////////////////


# Database connection details
DB_CONFIG = {
    "host": "database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
    "user": "admin",
    "password": "STSAI2025",
    "database": "SmartTransport",
}

# GoMaps.pro API details
GOMAPS_API_URL = "https://maps.gomaps.pro/maps/api/directions/json"
GOMAPS_API_KEY = "AlzaSyJe_Ax9TO36SZIGCdL4OnGTtxBDj_DaJ6D"  # Replace with your GoMaps.pro API key


# Function to get location names using GoMaps Reverse Geocoding API
def get_location_name_with_gomaps(lat, lng):
    try:
        # Replace with your GoMaps API key
        REVERSE_GEOCODING_API_URL = f"https://maps.gomaps.pro/maps/api/geocode/json?latlng={lat},{lng}&key={GOMAPS_API_KEY}"

        response = requests.get(REVERSE_GEOCODING_API_URL)
        if response.status_code == 200:
            data = response.json()
            if data["status"] == "OK" and len(data["results"]) > 0:
                # Get the formatted address
                formatted_address = data["results"][0]["formatted_address"]

                # Check if the formatted address contains a Plus Code (e.g., "W2VW+3V9")
                if '+' in formatted_address:
                    # Check if the address includes a regular location name besides the Plus Code
                    address_parts = formatted_address.split(",")

                    # Check if the first part contains a location name and not just the Plus Code
                    if len(address_parts) > 1:
                        # Return the first part of the address if it's a location name
                        return address_parts[0].strip()
                    else:
                        return "Unknown Location (Plus Code)"
                else:
                    # If no Plus Code, just return the first part of the address
                    address_parts = formatted_address.split(",")
                    return address_parts[0].strip()  # Strip any extra spaces around the name

            else:
                return "Unknown Location"
        else:
            return "Error Fetching Location"
    except Exception as e:
        return f"Error: {str(e)}"

import datetime

# Function to convert timedelta to a string (if necessary)
def timedelta_to_string(td):
    if isinstance(td, datetime.timedelta):
        # Convert the timedelta to a string in a desired format (e.g., hours:minutes:seconds)
        total_seconds = int(td.total_seconds())
        hours = total_seconds // 3600
        minutes = (total_seconds % 3600) // 60
        seconds = total_seconds % 60
        return f"{hours:02}:{minutes:02}:{seconds:02}"  # Format as hh:mm:ss
    return str(td)  # If it's not a timedelta, just return it as a string

# Updated backend route
@app.route("/get_assigned_routes_with_locations", methods=["GET"])
def get_assigned_routes_with_locations():
    try:
        # Connect to the database
        connection = pymysql.connect(**DB_CONFIG)

        with connection.cursor() as cursor:
            # SQL query to fetch all assigned routes with driver name, vehicle license number, and departure time
            sql_query = """
                SELECT 
                    Routes.RouteID,
                    Routes.Stops,
                    Drivers.Name,
                    Vehicles.PlateNumber,
                    Assignments.Time
                FROM 
                    Assignments
                INNER JOIN 
                    Routes ON Assignments.RouteID = Routes.RouteID
                INNER JOIN 
                    Drivers ON Assignments.DriverID = Drivers.DriverID
                INNER JOIN 
                    Vehicles ON Assignments.VehicleID = Vehicles.VehicleID
            """
            cursor.execute(sql_query)
            assigned_routes = cursor.fetchall()

            result = []

            # Process each route
            for route in assigned_routes:
                route_id, stops, driver_name, vehicle_plate, departure_time = route

                # Convert departure_time (if it's a timedelta) to string
                departure_time_str = timedelta_to_string(departure_time)

                # Parse stops (JSON string of coordinates)
                try:
                    stop_coordinates = json.loads(stops)  # Parse stops JSON
                    stop_locations = []

                    # Get the location name for each coordinate
                    for stop in stop_coordinates:
                        lat, lng = stop["lat"], stop["lng"]
                        location_name = get_location_name_with_gomaps(lat, lng)
                        stop_locations.append(location_name)
                except (ValueError, AttributeError) as e:
                    stop_locations = ["Invalid Stops Data"]

                # Append the route data
                result.append({
                    "route_id": route_id,
                    "driver_name": driver_name,
                    "vehicle_plate": vehicle_plate,
                    "departure_time": departure_time_str,  # Send the string version of departure time
                    "stops": stop_locations,
                })

            return jsonify(result), 200

    except Exception as e:
        # Log the full exception traceback for easier debugging
        print("Error occurred: ", e)
        return jsonify({"error": f"Unexpected Error: {str(e)}"}), 500
    finally:
        if 'connection' in locals() and connection:
            connection.close()


# # //////////////////////////////////////=== Van search code === //////////////////////////////////////////////////////


# Function to get the closest stop based on location
def get_closest_stop(student_lat, student_lng):
    connection = pymysql.connect(**DB_CONFIG)
    cursor = connection.cursor()

    # Fetch all stops from the Routes table
    sql_query = "SELECT RouteID, Stops FROM Routes"
    cursor.execute(sql_query)
    routes = cursor.fetchall()

    closest_stop = None
    min_distance = float('inf')

    # Loop through routes and stops to find the closest one
    for route in routes:
        route_id, stops_json = route
        stops = json.loads(stops_json)

        for stop in stops:
            stop_lat, stop_lng = stop["lat"], stop["lng"]
            stop_location = (stop_lat, stop_lng)
            student_location = (student_lat, student_lng)
            distance = geodesic(student_location, stop_location).km

            if distance < min_distance:
                closest_stop = {
                    "route_id": route_id,
                    "stop_name": stop.get("name", "Unknown Stop"),
                    "distance": distance,
                    "stop_lat": stop_lat,
                    "stop_lng": stop_lng
                }
                min_distance = distance

    connection.close()
    return closest_stop

@app.route("/get_route_details/searchvan", methods=["POST"])
def get_route_details():
    try:
        data = request.get_json()

        # Extract pick-up and drop-off coordinates
        pick_up_coords = data.get("pick_up_location")
        drop_coords = data.get("drop_location")
        time_slot = data.get("time_slot")
        student_id = data.get("student_id")

        if not pick_up_coords or not drop_coords:
            return jsonify({"error": "Invalid pick-up or drop-off location."}), 400

        pick_up_lat, pick_up_lng = pick_up_coords
        drop_lat, drop_lng = drop_coords

        # Check if student exists
        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        cursor.execute("SELECT * FROM Students WHERE StudentID = %s", (student_id,))
        student = cursor.fetchone()

        if not student:
            connection.close()
            return jsonify({"error": "Student ID does not exist."}), 404

        # Find closest pick-up and drop-off stops
        closest_pick_up_stop = get_closest_stop(pick_up_lat, pick_up_lng)
        closest_drop_off_stop = get_closest_stop(drop_lat, drop_lng)

        if not closest_pick_up_stop or not closest_drop_off_stop:
            return jsonify({"error": "No closest stops found."}), 404

        # Get assignment details for the closest pick-up stop
        sql_query = """
        SELECT a.AssignmentID, a.RouteID, d.Name as DriverName 
        FROM Assignments a
        JOIN Drivers d ON a.DriverID = d.DriverID
        WHERE a.RouteID = %s AND a.Time = %s
        """
        cursor.execute(sql_query, (closest_pick_up_stop["route_id"], time_slot))
        assignment = cursor.fetchone()

        if assignment:
            assignment_id, route_id, driver_name = assignment

            # Calculate the fee based on pick-up and drop-off stops
            distance = geodesic(
                (closest_pick_up_stop["stop_lat"], closest_pick_up_stop["stop_lng"]),
                (closest_drop_off_stop["stop_lat"], closest_drop_off_stop["stop_lng"])
            ).km
            fee_amount = calculate_fee(distance)

            # Step 1: Insert into Trips table to generate TripID
            cursor.execute("""
                INSERT INTO Trips (AssignmentID, StudentID)
                VALUES (%s, %s)
            """, (assignment_id, student_id))
            connection.commit()
            trip_id = cursor.lastrowid  # Get the generated TripID

            # Step 2: Insert fee into Fees table with the generated TripID
            due_date = datetime.datetime.now() + timedelta(days=30)  # Example due date: 30 days from now
            cursor.execute("""
                INSERT INTO Fee (Amount, DueDate, Status, StudentID, TripID)
                VALUES (%s, %s, %s, %s, %s)
            """, (fee_amount, due_date, "Unpaid", student_id, trip_id))
            connection.commit()

            # Fetch the names of the stops for pick-up and drop-off
            pick_up_stop_name = closest_pick_up_stop.get("stop_name", "Unknown")
            drop_off_stop_name = closest_drop_off_stop.get("stop_name", "Unknown")

            connection.close()

            return jsonify({
                "student_id": student_id,
                "driver_name": driver_name,
                "assigned_route_id": route_id,
                "assigned_driver": driver_name,
                "pick_up_stop": {
                    "name": pick_up_stop_name,
                    "lat": closest_pick_up_stop["stop_lat"],
                    "lng": closest_pick_up_stop["stop_lng"]
                },
                "drop_off_stop": {
                    "name": drop_off_stop_name,
                    "lat": closest_drop_off_stop["stop_lat"],
                    "lng": closest_drop_off_stop["stop_lng"]
                },
                "fee_amount": fee_amount,
                "fee_due_date": due_date.strftime("%Y-%m-%d"),
                "fee_status": "unpaid"
            })
        else:
            connection.close()
            return jsonify({"error": "No assignment found for the selected time."}), 404

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500



# Function to calculate fee based on distance
def calculate_fee(distance):
    fee_per_km = 3  # Example fee rate per km
    return round(distance * fee_per_km, 2)

# ////////////////////////////////////////////=== Fees code ===////////////////////////////////////////////////


# Database connection details
DB_CONFIG = {
    "host": "database-1.c9uigweku7ol.ap-south-1.rds.amazonaws.com",
    "user": "admin",
    "password": "STSAI2025",
    "database": "SmartTransport",
}



@app.route("/get_total_due_fee/studentfees", methods=["POST"])
def get_total_due_fee():
    try:
        data = request.get_json()
        student_id = data.get("student_id")

        if not student_id:
            return jsonify({"error": "Student ID is required"}), 400

        connection = pymysql.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # Calculate the total due fee for the student
        cursor.execute("""
            SELECT SUM(f.Amount) AS total_due_fee
            FROM Fee f
            WHERE f.StudentID = %s AND f.Status = 'Unpaid'
        """, (student_id,))
        result = cursor.fetchone()

        total_due_fee = result[0] if result[0] is not None else 0.00

        connection.close()

        return jsonify({"total_due_fee": total_due_fee})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# @app.route("/get_total_due_fee/studentfees", methods=["POST"])
# def get_total_due_fee():
#     try:
#         data = request.get_json()
#         student_id = data.get("student_id")

#         if not student_id:
#             return jsonify({"error": "Student ID is required"}), 400

#         connection = pymysql.connect(**DB_CONFIG)
#         cursor = connection.cursor()

#         # Calculate the total due fee for the student
#         cursor.execute("""
#             SELECT SUM(f.Amount) AS total_due_fee
#             FROM Fee f
#             WHERE f.StudentID = %s AND f.Status = 'Unpaid'
#         """, (student_id,))
#         result = cursor.fetchone()

#         total_due_fee = result[0] if result[0] is not None else 0.00

#         connection.close()

#         return jsonify({"total_due_fee": total_due_fee})

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)


