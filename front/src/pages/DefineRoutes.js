import React, { useState, useEffect } from "react";
import { Button } from '@mui/material';;

const DefineRoutes = () => {
    const [map, setMap] = useState(null); // Store the map instance
    const [stops, setStops] = useState([]); // Store selected stops

    // Initialize the map after the component mounts
    useEffect(() => {
        // Dynamically load the Google Maps API script
        const script = document.createElement("script");
        script.src =
            "https://maps.gomaps.pro/maps/api/js?key=AlzaSyJe_Ax9TO36SZIGCdL4OnGTtxBDj_DaJ6D&callback=initMap";
            
        script.async = true;
        script.defer = true;
        window.initMap = initMap; // Expose the initMap function globally
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
            delete window.initMap;
        };
    }, []);

    // Initialize the map and set it to the state
    const initMap = () => {
        console.log("initMap called"); // Debugging
        const google = window.google; // Access the Google Maps API
        const mapInstance = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 24.8607, lng: 67.0011 }, // Center on Karachi
            zoom: 12,
        });

        mapInstance.addListener("click", (event) => {
            const newStop = {
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
            };
            setStops((prevStops) => [...prevStops, newStop]);

            // Add a marker for the stop
            new google.maps.Marker({
                position: newStop,
                map: mapInstance,
            });
        });

        setMap(mapInstance);
    };
    

    // Save stops to the backend
    const saveStops = async () => {
        if (stops.length < 2) {
            alert("You need to select at least two stops to define a route.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/receive_stops", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ stops }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Route saved successfully!");
                console.log("Response:", data);
            } else {
                alert("Failed to save route: " + data.error);
                console.error("Error details:", data.details);
            }
        } catch (error) {
            console.error("Error occurred while saving stops:", error);
            alert("An error occurred. Please check the console for details.");
        }
    };

    return (
        <div style={{ position: "relative" }}>
            <div
                id="controls"
                style={{
                    position: "absolute",    
                    top: "10px",
                    left: "45%",
                    zIndex: 2,
                    backgroundColor: "white",
                    padding: "0px 10px",
                    borderRadius: "8px",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
                }}
            >
                {/* <button onClick={saveStops}></button> */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={saveStops}
                    style={{ marginBottom: '20px', marginTop: '10px' }}
                >
                    Save Stops
                </Button>
            </div>
            <div
                id="map"
                style={{
                    height: "100vh",
                    width: "100%",
                }}
            ></div>
        </div>
    );
};

export default DefineRoutes;
