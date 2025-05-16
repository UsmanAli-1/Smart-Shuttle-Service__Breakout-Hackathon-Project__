import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Header from "../Header";
import {
    Box,
    Button,
    Select,
    MenuItem,
    Typography,
    Alert,
    Card,
    CardContent,
} from "@mui/material";

const SearchVan = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });

    const mapRef = useRef(null);
    const [pickUpMarker, setPickUpMarker] = useState(null);
    const [dropOffMarker, setDropOffMarker] = useState(null);
    const [timeSlot, setTimeSlot] = useState("08:00:00");
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType, setAlertType] = useState("");
    const [routeDetails, setRouteDetails] = useState(null);

    useEffect(() => {
        if (!mapRef.current) {
            // Initialize the map
            const leafletMap = L.map("map").setView([24.8607, 67.0011], 12);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(leafletMap);

            // Handle map click
            leafletMap.on("click", (e) => {
                const { lat, lng } = e.latlng;

                if (!pickUpMarker) {
                    const marker = L.marker([lat, lng], { draggable: true })
                        .addTo(leafletMap)
                        .bindPopup("Pick-Up Location")
                        .openPopup();
                    setPickUpMarker(marker);
                } else if (!dropOffMarker) {
                    const marker = L.marker([lat, lng], { draggable: true })
                        .addTo(leafletMap)
                        .bindPopup("Drop-Off Location")
                        .openPopup();
                    setDropOffMarker(marker);
                } else {
                    alert("Both pick-up and drop-off locations are already selected.");
                }
            });

            if (!!pickUpMarker) {
                const { lat, lng } = pickUpMarker.getLatLng();
                const marker = L.marker([lat, lng], { draggable: true })
                    .addTo(leafletMap)
                    .bindPopup("Pick-Up Location")
                    .openPopup();

            }
            if (!!dropOffMarker) {
                const { lat, lng } = dropOffMarker.getLatLng();
                const marker = L.marker([lat, lng], { draggable: true })
                    .addTo(leafletMap)
                    .bindPopup("Drop-Off Location")
                    .openPopup();

            }

            mapRef.current = leafletMap;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.off(); // Remove event listeners
                mapRef.current.remove(); // Remove map instance
                mapRef.current = null;
            }
        };
    }, [pickUpMarker, dropOffMarker]);

    useEffect(() => {
        if (pickUpMarker) {
            pickUpMarker.on("dragend", () => {
                console.log("Pick-Up Marker moved to:", pickUpMarker.getLatLng());
            });
        }
        if (dropOffMarker) {
            dropOffMarker.on("dragend", () => {
                console.log("Drop-Off Marker moved to:", dropOffMarker.getLatLng());
            });
        }
    }, [pickUpMarker, dropOffMarker]);



    const handleSearch = () => {
        if (!pickUpMarker || !dropOffMarker) {
            showAlert("Please select both pick-up and drop-off locations on the map.", "error");
            return;
        }

        const pickUpLocation = pickUpMarker.getLatLng();
        const dropLocation = dropOffMarker.getLatLng();

        fetch("http://127.0.0.1:5000/get_route_details/searchvan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pick_up_location: [pickUpLocation.lat, pickUpLocation.lng],
                drop_location: [dropLocation.lat, dropLocation.lng],
                time_slot: timeSlot,
                student_id: 24,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showAlert(data.error, "error");
                } else {
                    setRouteDetails(data);
                    showAlert("Route details fetched successfully!", "success");
                }
            })
            .catch((error) => {
                showAlert("An error occurred. Please try again.", "error");
                console.error("Error:", error);
            });
    };

    const showAlert = (message, type) => {
        setAlertMessage(message);
        setAlertType(type);
        setTimeout(() => setAlertMessage(""), 5000);
    };

    return (
        <>
            <Header />
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Typography variant="h5" gutterBottom>
                    Search for a Van
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        alignItems: "center",
                        width: "100%",
                        maxWidth: 400,
                    }}
                >
                    <Select
                        id="timeSlot"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        fullWidth
                        variant="outlined"
                    >
                        <MenuItem value="08:00:00">8:00 AM</MenuItem>
                        <MenuItem value="11:30:00">11:30 AM</MenuItem>
                        <MenuItem value="14:30:00">2:30 PM</MenuItem>
                    </Select>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        fullWidth
                    >
                        Search
                    </Button>
                </Box>

                <Box
                    id="map"
                    sx={{
                        height: "500px",
                        width: "100%",
                        maxWidth: "800px",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        mt: 2,
                    }}
                ></Box>

                {alertMessage && (
                    <Alert severity={alertType} sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
                        {alertMessage}
                    </Alert>
                )}

                {routeDetails && (
                    <Card sx={{ mt: 2, width: "100%", maxWidth: 400 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Route Assigned!
                            </Typography>
                            <Typography>
                                <strong>Driver:</strong> {routeDetails.driver_name}
                            </Typography>
                            <Typography>
                                <strong>Pick-Up Stop:</strong> {routeDetails.pick_up_stop.name} (Lat: {routeDetails.pick_up_stop.lat}, Lng: {routeDetails.pick_up_stop.lng})
                            </Typography>
                            <Typography>
                                <strong>Drop-Off Stop:</strong> {routeDetails.drop_off_stop.name} (Lat: {routeDetails.drop_off_stop.lat}, Lng: {routeDetails.drop_off_stop.lng})
                            </Typography>
                            <Typography>
                                <strong>Fee:</strong> ${routeDetails.fee_amount.toFixed(2)}
                            </Typography>
                            <Typography>
                                <strong>Due Date:</strong> {routeDetails.fee_due_date}
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </>
    );
};

export default SearchVan;
