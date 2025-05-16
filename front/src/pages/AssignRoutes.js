import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import Header from "../Header";

const AssignRoute = () => {
    const [routes, setRoutes] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vans, setVans] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedDriver, setSelectedDriver] = useState("");
    const [selectedVan, setSelectedVan] = useState("");
    const [departureTime, setDepartureTime] = useState("08:00");

    const departureTimes = [
        { label: "08:00 AM", value: "08:00" },
        { label: "11:30 AM", value: "11:30" },
        { label: "02:30 PM", value: "14:30" },
    ];

    // Fetch data and populate dropdowns
    const fetchData = async (url, setState, key) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (Array.isArray(data)) {
                setState(data.map((item) => ({ id: item.id, value: item[key] })));
            } else {
                console.error(`No data available from ${url}`);
            }
        } catch (error) {
            console.error(`Error fetching data from ${url}:`, error);
        }
    };

    useEffect(() => {
        fetchData("http://127.0.0.1:5000/get_routes", setRoutes, "id");
        fetchData("http://127.0.0.1:5000/get_drivers", setDrivers, "name");
        fetchData("http://127.0.0.1:5000/get_vans", setVans, "number");
    }, []);

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedRoute || !selectedDriver || !selectedVan || !departureTime) {
            alert("Please select all fields.");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/assign_route", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    route_id: selectedRoute,
                    driver_id: selectedDriver,
                    van_id: selectedVan,
                    departure_time: departureTime,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to assign route.");
        }
    };

    return (
        <>
            <Header />
            <Box
                sx={{
                    maxWidth: 400,
                    mx: "auto",
                    mt: 4,
                    p: 3,
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    boxShadow: 2,
                }}
            >
                <Typography
                    variant="h4"
                    component="h1"
                    gutterBottom
                    display={"flex"}
                    justifyContent={"center"}
                >
                    Assign Route
                </Typography>

                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="route-label">Route</InputLabel>
                        <Select
                            labelId="route-label"
                            id="routeDropdown"
                            value={selectedRoute}
                            onChange={(e) => setSelectedRoute(e.target.value)}
                        >
                            <MenuItem value="">Select Route</MenuItem>
                            {routes.map((route) => (
                                <MenuItem key={route.id} value={route.id}>
                                    {route.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="driver-label">Driver</InputLabel>
                        <Select
                            labelId="driver-label"
                            id="driverDropdown"
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                        >
                            <MenuItem value="">Select Driver</MenuItem>
                            {drivers.map((driver) => (
                                <MenuItem key={driver.id} value={driver.id}>
                                    {driver.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="van-label">Van</InputLabel>
                        <Select
                            labelId="van-label"
                            id="vanDropdown"
                            value={selectedVan}
                            onChange={(e) => setSelectedVan(e.target.value)}
                        >
                            <MenuItem value="">Select Van</MenuItem>
                            {vans.map((van) => (
                                <MenuItem key={van.id} value={van.id}>
                                    {van.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel id="departure-label">Departure Time</InputLabel>
                        <Select
                            labelId="departure-label"
                            id="departure_time"
                            value={departureTime}
                            onChange={(e) => setDepartureTime(e.target.value)}
                        >
                            {departureTimes.map((time) => (
                                <MenuItem key={time.value} value={time.value}>
                                    {time.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Assign
                    </Button>
                </form>
            </Box>
        </>
    );
};

export default AssignRoute;
