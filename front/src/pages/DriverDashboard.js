import React, { useEffect, useState } from 'react';
import Header from '../Header';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { fromLonLat } from 'ol/proj';

const DriverDashboard = () => {
    const [vehicleNumber, setVehicleNumber] = useState('Fetching assigned vehicle...');
    const [map, setMap] = useState(null);

    useEffect(() => {
        const loadMap = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/get_route_map');
                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || 'Error loading route data.');
                    return;
                }

                const { vehicle_number, route_coordinates } = data;

                // Update vehicle number
                setVehicleNumber(`Assigned Vehicle: ${vehicle_number}`);

                // Filter out duplicate stops if any
                const uniqueCoordinates = [];
                const seenCoordinates = new Set();

                for (const stop of route_coordinates) {
                    const key = `${stop.lat},${stop.lng}`;
                    if (!seenCoordinates.has(key)) {
                        uniqueCoordinates.push(stop);
                        seenCoordinates.add(key);
                    }
                }

                // Convert the unique route coordinates to OpenLayers format (longitude, latitude)
                const olCoordinates = uniqueCoordinates.map(stop => [stop.lng, stop.lat]);

                // Create a map instance
                const mapInstance = new Map({
                    target: 'map',
                    layers: [
                        new TileLayer({
                            source: new OSM(), // Use OpenStreetMap tiles
                        }),
                    ],
                    view: new View({
                        center: fromLonLat([olCoordinates[0][0], olCoordinates[0][1]]), // Center at the first stop
                        zoom: 13,
                    }),
                });

                // Add the route as a line string
                const routeFeature = new Feature({
                    geometry: new LineString(olCoordinates).transform('EPSG:4326', 'EPSG:3857'), // Transform to web mercator
                });

                // Style the route line
                const routeStyle = new Style({
                    stroke: new Stroke({
                        color: 'blue',
                        width: 4,
                    }),
                });
                routeFeature.setStyle(routeStyle);

                // Add stops as points
                const stopFeatures = uniqueCoordinates.map(stop => {
                    const pointFeature = new Feature({
                        geometry: new Point(fromLonLat([stop.lng, stop.lat])),
                    });

                    // Style for the stop points
                    pointFeature.setStyle(
                        new Style({
                            image: new Circle({
                                radius: 6,
                                fill: new Fill({ color: 'red' }),
                                stroke: new Stroke({ color: 'white', width: 2 }),
                            }),
                        })
                    );
                    return pointFeature;
                });

                // Add features to the map
                const vectorSource = new VectorSource({
                    features: [routeFeature, ...stopFeatures],
                });

                const vectorLayer = new VectorLayer({
                    source: vectorSource,
                });

                mapInstance.addLayer(vectorLayer);
                setMap(mapInstance);
            } catch (error) {
                console.error('Error loading map:', error);
                alert('Failed to load route map.');
            }
        };

        loadMap();
    }, []);

    return (
        <>
            <Header />
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Driver Dashboard
                </Typography>

                <Grid container spacing={4}>
                    {/* Vehicle Info Section */}
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">{vehicleNumber}</Typography>
                        </Paper>
                    </Grid>

                    {/* Map Section */}
                    <Grid item xs={12}>
                        <Box
                            id="map"
                            sx={{
                                height: 500,
                                width: '100%',
                                // mt: 2,
                                mb: 7,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                overflow: 'hidden',
                            }}
                        ></Box>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default DriverDashboard;



// import React, { useEffect, useState } from 'react';
// import Header from '../Header';
// import { Container, Typography, Grid, Paper, Box } from '@mui/material';
// import 'ol/ol.css';
// import { Map, View } from 'ol';
// import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
// import { OSM } from 'ol/source';
// import { Feature } from 'ol';
// import { Point, LineString } from 'ol/geom';
// import { Vector as VectorSource } from 'ol/source';
// import { Style, Stroke, Circle, Fill } from 'ol/style';
// import { fromLonLat } from 'ol/proj';

// const DriverDashboard = () => {
//     const [vehicleNumber, setVehicleNumber] = useState('Fetching assigned vehicle...');
//     const [routeData, setRouteData] = useState(null);
//     const [map, setMap] = useState(null);

//     useEffect(() => {
//         const fetchDriverRoute = async () => {
//             try {
//                 const token = localStorage.getItem('driver_token');
//                 if (!token) {
//                     alert('You must be logged in!');
//                     return;
//                 }

//                 const response = await fetch('http://localhost:5000/driver/route', {
//                     method: 'GET',
//                     headers: {
//                         'Authorization': `Bearer ${token}`
//                     }
//                 });

//                 if (!response.ok) {
//                     alert('Error fetching route data.');
//                     return;
//                 }

//                 const data = await response.json();
//                 setRouteData(data);

//                 // Assuming you also fetch vehicle number along with route details
//                 setVehicleNumber(data.vehicle_number || 'Vehicle not assigned.');
//             } catch (error) {
//                 console.error('Error fetching route:', error);
//                 alert('Error loading route data.');
//             }
//         };

//         fetchDriverRoute();
//     }, []);

//     useEffect(() => {
//         if (routeData) {
//             const { route_details, route_coordinates } = routeData;

//             const uniqueCoordinates = [];
//             const seenCoordinates = new Set();

//             for (const stop of route_coordinates) {
//                 const key = `${stop.lat},${stop.lng}`;
//                 if (!seenCoordinates.has(key)) {
//                     uniqueCoordinates.push(stop);
//                     seenCoordinates.add(key);
//                 }
//             }

//             const olCoordinates = uniqueCoordinates.map(stop => [stop.lng, stop.lat]);

//             const mapInstance = new Map({
//                 target: 'map',
//                 layers: [
//                     new TileLayer({
//                         source: new OSM(),
//                     }),
//                 ],
//                 view: new View({
//                     center: fromLonLat([olCoordinates[0][0], olCoordinates[0][1]]),
//                     zoom: 13,
//                 }),
//             });

//             const routeFeature = new Feature({
//                 geometry: new LineString(olCoordinates).transform('EPSG:4326', 'EPSG:3857'),
//             });

//             const routeStyle = new Style({
//                 stroke: new Stroke({
//                     color: 'blue',
//                     width: 4,
//                 }),
//             });

//             routeFeature.setStyle(routeStyle);

//             const stopFeatures = uniqueCoordinates.map(stop => {
//                 const pointFeature = new Feature({
//                     geometry: new Point(fromLonLat([stop.lng, stop.lat])),
//                 });

//                 pointFeature.setStyle(
//                     new Style({
//                         image: new Circle({
//                             radius: 6,
//                             fill: new Fill({ color: 'red' }),
//                             stroke: new Stroke({ color: 'white', width: 2 }),
//                         }),
//                     })
//                 );
//                 return pointFeature;
//             });

//             const vectorSource = new VectorSource({
//                 features: [routeFeature, ...stopFeatures],
//             });

//             const vectorLayer = new VectorLayer({
//                 source: vectorSource,
//             });

//             mapInstance.addLayer(vectorLayer);
//             setMap(mapInstance);
//         }
//     }, [routeData]);

//     return (
//         <>
//             <Header />
//             <Container maxWidth="lg" sx={{ mt: 4 }}>
//                 <Typography variant="h4" align="center" gutterBottom>
//                     Driver Dashboard
//                 </Typography>

//                 <Grid container spacing={4}>
//                     {/* Vehicle Info Section */}
//                     <Grid item xs={12}>
//                         <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                             <Typography variant="h6">{vehicleNumber}</Typography>
//                         </Paper>
//                     </Grid>

//                     {/* Route Info Section */}
//                     {routeData && (
//                         <Grid item xs={12}>
//                             <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
//                                 <Typography variant="h6">{routeData.route_name}</Typography>
//                                 <Typography>{routeData.route_details}</Typography>
//                             </Paper>
//                         </Grid>
//                     )}

//                     {/* Map Section */}
//                     <Grid item xs={12}>
//                         <Box
//                             id="map"
//                             sx={{
//                                 height: 500,
//                                 width: '100%',
//                                 border: '1px solid #ccc',
//                                 borderRadius: 1,
//                                 overflow: 'hidden',
//                             }}
//                         ></Box>
//                     </Grid>
//                 </Grid>
//             </Container>
//         </>
//     );
// };

// export default DriverDashboard;
