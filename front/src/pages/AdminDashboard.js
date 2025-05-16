import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
} from '@mui/material';
import '../Dashboard.css';
import Header from '../Header';
import axios from 'axios';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [vans, setVans] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openDriverDialog, setOpenDriverDialog] = useState(false);
    const [openVanDialog, setOpenVanDialog] = useState(false);

    const [newDriver, setNewDriver] = useState({
        name: '',
        password: '',
        cnic: '',
        phone: '',
        status: 'Active'
    });

    const [newVan, setNewVan] = useState({
        capacity: '',
        plate_number: ''
    });

    const [error, setError] = useState(false);

    const handleOpenDriverDialog = () => setOpenDriverDialog(true);
    const handleCloseDriverDialog = () => {
        setOpenDriverDialog(false);
        setNewDriver({ name: '', password: '', cnic: '', phone: '', status: 'Active' });
    };

    const handleOpenVanDialog = () => setOpenVanDialog(true);
    const handleCloseVanDialog = () => {
        setOpenVanDialog(false);
        setNewVan({ capacity: '', plate_number: '' });
    };

    const handleDriverChange = (e) => {
        const { id, value } = e.target;
        setNewDriver((prev) => ({ ...prev, [id]: value }));

        if (id === "phone") {
            const regex = /^03[0-9]{9}$/; // Matches the pattern 03XXXXXXXXX
            setError(!regex.test(value));
        }

        if (id === "cnic") {
            const regex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/; // Matches the pattern 12345-1234567-1
            setError(!regex.test(value));
        }
    };

    const handleVanChange = (e) => {
        const { id, value } = e.target;
        setNewVan((prev) => ({ ...prev, [id]: value }));
    };

    const handleRegisterDriver = async () => {
        const { name, password, cnic, phone, status } = newDriver;

        if (name.trim() && password.trim() && cnic.trim() && phone.trim() && !error) {
            try {
                const response = await axios.post('http://127.0.0.1:5000/register/driver', {
                    name,
                    password,
                    cnic,
                    phone,
                    status
                });

                if (response.status === 200) {
                    alert('Driver registered successfully!');
                    setUsers([...users, { id: users.length + 1, name, status }]);
                    handleCloseDriverDialog();
                }
            } catch (error) {
                console.error('Error registering driver:', error);
                alert('An error occurred while registering the driver.');
            }
        } else {
            alert('Please ensure all fields are filled correctly.');
        }
    };

    const handleRegisterVan = async () => {
        const { capacity, plate_number } = newVan;

        if (capacity.trim() && plate_number.trim()) {
            try {
                const response = await axios.post('http://127.0.0.1:5000/register/vehicle', {
                    capacity,
                    plate_number
                });

                if (response.status === 200) {
                    alert('Van registered successfully!');
                    setVans([...vans, { id: vans.length + 1, capacity, plate_number }]);
                    handleCloseVanDialog();
                }
            } catch (error) {
                console.error('Error registering van:', error);
                alert('An error occurred while registering the van.');
            }
        } else {
            alert('Please ensure all fields are filled correctly.');
        }
    };

    useEffect(() => {
        const root = document.getElementById('root');
        if (openDriverDialog || openVanDialog) {
            root.setAttribute('inert', 'true');
        } else {
            root.removeAttribute('inert');
        }
        return () => root.removeAttribute('inert');
    }, [openDriverDialog, openVanDialog]);


    // ==redirect to html file ==
        const navigate = useNavigate();
        const handleRedirect = () => {
            // window.location.href = "/defineroutes";
            navigate("/defineroutes");
        };

        const handleAssignRedirect = () =>{
            navigate("/assignroutes");
        }
    

        // show details code 
        useEffect(() => {
            // Fetch assigned routes
            axios
                .get("http://127.0.0.1:5000/get_assigned_routes_with_locations")
                .then((response) => {
                    setRoutes(response.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching routes:", err);
                    setError(true);
                    setLoading(false);
                });
        }, []);
    
    return (
        <><Header />
            <Container maxWidth="lg" className="dashboard-container">
                <Typography variant="h3" align="center" gutterBottom>Admin Dashboard</Typography>

                <Grid container spacing={4}>
                    {/* Driver Management Section */}
                    <Grid item xs={12} md={6}>
                        <Paper className="dashboard-paper" >
                            <Typography variant="h5" gutterBottom >Driver Management</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenDriverDialog}
                                style={{ marginBottom: '20px', marginTop: '10px' }}
                            >
                                Register Driver
                            </Button>
                            {users.map(user => (
                                <div key={user.id} className="user-status" style={{ marginBottom: '20px' }}>
                                    <Typography variant="h6">{user.name}</Typography>
                                    <Typography variant="body1">Status: {user.status}</Typography>
                                    <Button
                                        variant="contained"
                                        color={user.status === 'Active' ? 'secondary' : 'primary'}
                                        onClick={() => {
                                            const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
                                            setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
                                        }}
                                    >
                                        Toggle Status
                                    </Button>
                                </div>
                            ))}
                        </Paper>
                    </Grid>


                    {/* Van Management Section */}
                    <Grid item xs={12} md={6}>
                        <Paper className="dashboard-paper">
                            <Typography variant="h5" gutterBottom>Van Management</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleOpenVanDialog}
                                style={{ marginBottom: '20px', marginTop: '10px' }}
                            >
                                Register Van
                            </Button>
                            {vans.map(van => (
                                <div key={van.id} className="van-status" style={{ marginBottom: '20px' }}>
                                    <Typography variant="h6">Plate Number: {van.plate_number}</Typography>
                                    <Typography variant="body1">Capacity: {van.capacity}</Typography>
                                </div>
                            ))}
                        </Paper>
                    </Grid>

                    {/* add route code  */}
                    <Grid item xs={12} md={6}>
                        <Paper className="dashboard-paper">
                            <Typography variant="h5" gutterBottom>Route Management</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleRedirect}
                                style={{ marginBottom: '20px', marginTop: '10px' }}
                            >
                                Add Route
                            </Button>
                        </Paper>
                    </Grid>

                    {/* avaliablitya and assign code  */}
                    <Grid item xs={12} md={6}>
                        <Paper className="dashboard-paper">
                            <Typography variant="h5" gutterBottom>Assign Management</Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAssignRedirect}
                                style={{ marginBottom: '20px', marginTop: '10px' }}
                            >
                                Assign Driver & Routes
                            </Button>
                        </Paper>
                    </Grid>

                    {/* show details  */}
                    <Grid item xs={12}>
                        <Paper className="dashboard-paper">
                            <Typography variant="h5" gutterBottom>
                                Assigned Routes
                            </Typography>
                            {loading ? (
                                <CircularProgress />
                            ) : error ? (
                                <Alert severity="error">
                                    Failed to load routes. Please try again later.
                                </Alert>
                            ) : routes.length === 0 ? (
                                <Alert severity="info">No routes found.</Alert>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Route ID</TableCell>
                                                <TableCell>Driver Name</TableCell>
                                                <TableCell>Vehicle Plate Number</TableCell>
                                                <TableCell>Departure Time</TableCell>
                                                <TableCell>Stops</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {routes.map((route) => (
                                                <TableRow key={route.route_id}>
                                                    <TableCell>{route.route_id}</TableCell>
                                                    <TableCell>{route.driver_name}</TableCell>
                                                    <TableCell>{route.vehicle_plate}</TableCell>
                                                    <TableCell>{route.departure_time}</TableCell>
                                                    <TableCell>
                                                        {route.stops.join(", ")}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Paper>
                    </Grid>
                </Grid>

                {/* Register Driver Dialog */}
                <Dialog
                    open={openDriverDialog}
                    onClose={handleCloseDriverDialog}
                >
                    <DialogTitle >Register New Driver</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="name"
                            label="Driver Name"
                            value={newDriver.name}
                            onChange={handleDriverChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                        />
                        <TextField
                            id="password"
                            label="Password"
                            type="password"
                            value={newDriver.password}
                            onChange={handleDriverChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                        />
                        <TextField
                            id="cnic"
                            label="CNIC Number"
                            value={newDriver.cnic}
                            onChange={handleDriverChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                            error={error && newDriver.cnic}
                            helperText={error && newDriver.cnic ? "Invalid CNIC format (12345-1234567-1)" : ""}
                        />
                        <TextField
                            id="phone"
                            label="Phone Number"
                            value={newDriver.phone}
                            onChange={handleDriverChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                            error={error && newDriver.phone}
                            helperText={error && newDriver.phone ? "Invalid phone format (03XXXXXXXXX)" : ""}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDriverDialog} color="secondary">Cancel</Button>
                        <Button onClick={handleRegisterDriver} color="primary">Register</Button>
                    </DialogActions>
                </Dialog>

                {/* Register Van Dialog */}
                <Dialog
                    open={openVanDialog}
                    onClose={handleCloseVanDialog}
                >
                    <DialogTitle>Register New Van</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="capacity"
                            label="Capacity"
                            value={newVan.capacity}
                            onChange={handleVanChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                        />
                        <TextField
                            id="plate_number"
                            label="Plate Number"
                            value={newVan.plate_number}
                            onChange={handleVanChange}
                            variant="outlined"
                            fullWidth
                            style={{ marginBottom: '20px' }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseVanDialog} color="secondary">Cancel</Button>
                        <Button onClick={handleRegisterVan} color="primary">Register</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </>
    );
};

export default AdminDashboard;
