import React, { useState, useEffect } from 'react';
import { Container, CircularProgress,Typography, Grid, Paper, Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Box } from '@mui/material';
import '../Dashboard.css';
import { useNavigate } from "react-router-dom";
import Header from '../Header';

const StudentDashboard = () => {

    const [errorMessage, setErrorMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [uploadedReceipt, setUploadedReceipt] = useState(null);
    const [tripHistory, setTripHistory] = useState([
        { date: '2025-01-05', trips: 3 },
        { date: '2025-01-06', trips: 2 },
        { date: '2025-01-07', trips: 1 },
        { date: '2025-01-08', trips: 2 },
        { date: '2025-01-09', trips: 5 },
        { date: '2025-01-10', trips: 4 },
        { date: '2025-01-11', trips: 3 },
        { date: '2025-01-12', trips: 2 },
        { date: '2025-01-13', trips: 6 },
        { date: '2025-01-14', trips: 2 },
        { date: '2025-01-15', trips: 4 },
        { date: '2025-01-16', trips: 2 }
    ]);

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleReceiptUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedReceipt(file);
            setErrorMessage('Receipt uploaded successfully!');
            setSnackbarOpen(true);
        }
    };

    const calculateTotalTrips = () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
        let totalTrips = 0;

        tripHistory.forEach((entry) => {
            const tripDate = new Date(entry.date);
            if (tripDate >= thirtyDaysAgo) {
                totalTrips += entry.trips;
            }
        });

        return totalTrips;
    };

    // Get the last 10 trip details for the bottom-right section
    const getLastTenTrips = () => {
        return tripHistory.slice(0, 10);
    };

    // navigate to searchvan 
    const navigate = useNavigate();

    const handleSearchVan = () => {
        navigate('/searchvan');
    };

    const handleFees = () => {
        navigate('/studentfees');
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const [totalDueFee, setTotalDueFee] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState(24);
    // const studentId = 24; // Hardcoded student ID (can be dynamic in a real app)

    // Function to fetch the total due fee for the student
    const fetchTotalDueFee = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/get_total_due_fee/studentfees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            const { total_due_fee } = data;

            if (total_due_fee !== undefined && !isNaN(total_due_fee)) {
                setTotalDueFee(`₨ ${Number(total_due_fee).toFixed(2)}`);
            } else {
                setTotalDueFee('Error: Invalid fee data.');
            }
        } catch (error) {
            console.error('Error fetching fee data:', error);
            setTotalDueFee('Error: Could not fetch fee data.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch fee data on component mount
    useEffect(() => {
        fetchTotalDueFee();
    }, []);

    return (
        <>
            <Header />
            <Container maxWidth="lg" className="dashboard-container">
                <Typography variant="h3" align="center" gutterBottom>Student Dashboard</Typography>
                <Grid container spacing={4}>
                    {/* look for van code  */}
                    <Grid item xs={12} md={6} >
                        <Paper className="dashboard-paper">
                            <Typography variant="h5">Search For Van </Typography>
                            <Typography color='#555'>you have to select 2 locations , pick up location and drop off location</Typography>
                            <Box display="flex" alignItems="center" marginTop={2}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    style={{ marginRight: '10px' }}
                                    onClick={handleSearchVan}
                                >
                                    Search Van
                                </Button>

                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6} >
                        {/* Fee Payment Section */}
                        <Paper className="dashboard-paper">
                            <Typography variant="h5">Fee Information</Typography>
                            <Box sx={{ marginBottom: 4 }}>
                                <Typography
                                    variant="h6"
                                    component="label"
                                    sx={{
                                        color: '#555',
                                        marginBottom: 1,
                                    }}
                                >
                                    Total Due Fee:
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: '2em',
                                        color: '#333',
                                        textAlign: 'center',
                                        marginTop: 1,
                                        fontWeight: 'bold',
                                    }}
                                >
                                    {loading ? <CircularProgress size={30} /> : totalDueFee}
                                </Typography>
                            </Box>

                            {/* File Upload for Fee Payment Receipt */}
                            <Box display="flex" alignItems="center" marginTop={2}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    style={{ marginRight: '10px' }}
                                >
                                    Upload Receipt
                                    <input
                                        type="file"
                                        accept="image/*, .pdf"
                                        hidden
                                        onChange={handleReceiptUpload}
                                    />
                                </Button>
                                {uploadedReceipt && (
                                    <Typography variant="body2" color="textSecondary">
                                        File: {uploadedReceipt.name}
                                    </Typography>
                                )}
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    style={{ marginRight: '10px' }}
                                    onClick={fetchTotalDueFee}
                                >
                                    Check Fees
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>


                    {/* Trip History Section: Positioned on the Right Side of Fee Payment Section */}
                    <Grid item xs={12} md={6}>
                        <Paper className="dashboard-paper" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h5">Trip History (Last 10 Days)</Typography>
                            <Typography variant="body2" color="textSecondary">
                                Total Trips in Last 30 Days: {calculateTotalTrips()}
                            </Typography>
                            {getLastTenTrips().map((entry, index) => (
                                <Typography variant="body2" key={index}>
                                    {entry.date}: {entry.trips} trips
                                </Typography>
                            ))}
                        </Paper>
                    </Grid>

                </Grid>

            </Container>

            {/* Snackbar for Alerts */}
            <Snackbar
                open={snackbarOpen}
                message={errorMessage}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
            />
        </>
    );
};

export default StudentDashboard;



// import React, { useState, useEffect } from 'react';
// import { Container, CircularProgress, Typography, Grid, Paper, Button, Box, Snackbar } from '@mui/material';
// import { useNavigate } from "react-router-dom";
// import Header from '../Header';

// const StudentDashboard = () => {
//     const [studentId, setStudentId] = useState(null);  // Set dynamically based on login
//     const [vanAssignment, setVanAssignment] = useState('Van A');
//     const [feeDetails, setFeeDetails] = useState({ monthlyFee: 0, dueDate: '', status: 'unpaid' });
//     const [totalDueFee, setTotalDueFee] = useState('Loading...');
//     const [loading, setLoading] = useState(true);
//     const [errorMessage, setErrorMessage] = useState('');
//     const [snackbarOpen, setSnackbarOpen] = useState(false);

//     const navigate = useNavigate();

//     // 🔹 Fetch logged-in student ID from localStorage
//     useEffect(() => {
//         const storedStudent = localStorage.getItem('loggedInStudent');

//         if (storedStudent) {
//             try {
//                 const parsedStudent = JSON.parse(storedStudent);
//                 if (parsedStudent.id) {
//                     setStudentId(parsedStudent.id);
//                 } else {
//                     setErrorMessage("Invalid student data.");
//                     setSnackbarOpen(true);
//                 }
//             } catch (error) {
//                 console.error("Error parsing student data:", error);
//                 setErrorMessage("Error retrieving student data.");
//                 setSnackbarOpen(true);
//             }
//         } else {
//             setErrorMessage("No student logged in.");
//             setSnackbarOpen(true);
//         }
//     }, []);

//     // 🔹 Fetch total due fee from backend
//     const fetchTotalDueFee = async () => {
//         if (!studentId) return; // Avoid API call if student ID is missing

//         setLoading(true);
//         try {
//             const response = await fetch('http://127.0.0.1:5000/get_total_due_fee/studentfees', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ student_id: studentId })
//             });

//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
//             const { total_due_fee } = data;

//             if (total_due_fee !== undefined && !isNaN(total_due_fee)) {
//                 setTotalDueFee(`₨ ${Number(total_due_fee).toFixed(2)}`);
//             } else {
//                 setTotalDueFee('Error: Invalid fee data.');
//             }
//         } catch (error) {
//             console.error('Error fetching fee data:', error);
//             setTotalDueFee('Error: Could not fetch fee data.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // 🔹 Fetch total due fee when studentId is set
//     useEffect(() => {
//         if (studentId) {
//             fetchTotalDueFee();
//         }
//     }, [studentId]);

//     // 🔹 Handle route selection and fee payment
//     const handleRouteSelection = (selectedRoute) => {
//         setVanAssignment(selectedRoute);
//         const feeAmount = selectedRoute === 'Van A' ? 200 : 0;
//         setFeeDetails({ ...feeDetails, monthlyFee: feeAmount, status: feeAmount > 0 ? 'paid' : 'unpaid' });
//     };

//     const handleSearchVan = () => {
//         navigate('/searchvan');
//     };

//     const handleSnackbarClose = () => {
//         setSnackbarOpen(false);
//     };

//     return (
//         <>
//             <Header />
//             <Container maxWidth="lg" className="dashboard-container">
//                 <Typography variant="h3" align="center" gutterBottom>Student Dashboard</Typography>
//                 <Grid container spacing={4}>
//                     {/* Van Assignment Section */}
//                     <Grid item xs={12} md={6}>
//                         <Paper className="dashboard-paper">
//                             <Typography variant="h5">Search For Van</Typography>
//                             <Typography color='#555'>Select a pick-up and drop-off location</Typography>
//                             <Box display="flex" alignItems="center" marginTop={2}>
//                                 <Button variant="contained" color="primary" onClick={handleSearchVan}>
//                                     Search Van
//                                 </Button>
//                             </Box>
//                         </Paper>
//                     </Grid>

//                     {/* Fee Information Section */}
//                     <Grid item xs={12} md={6}>
//                         <Paper className="dashboard-paper">
//                             <Typography variant="h5">Fee Information</Typography>
//                             <Typography variant="h6" sx={{ color: '#555', marginBottom: 1 }}>
//                                 Total Due Fee:
//                             </Typography>
//                             <Typography
//                                 variant="h4"
//                                 sx={{
//                                     fontSize: '2em',
//                                     color: '#333',
//                                     textAlign: 'center',
//                                     marginTop: 1,
//                                     fontWeight: 'bold',
//                                 }}
//                             >
//                                 {loading ? <CircularProgress size={30} /> : totalDueFee}
//                             </Typography>

//                             <Box display="flex" alignItems="center" marginTop={2}>
//                                 <Button variant="contained" color="primary" onClick={() => handleRouteSelection('Van A')}>
//                                     Pay Fee
//                                 </Button>
//                             </Box>
//                         </Paper>
//                     </Grid>
//                 </Grid>
//             </Container>

//             <Snackbar open={snackbarOpen} message={errorMessage} autoHideDuration={4000} onClose={handleSnackbarClose} />
//         </>
//     );
// };

// export default StudentDashboard;
