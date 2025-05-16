// import React, { useState } from "react";
// import '../log-reg.css';
// import Header from '../Header'
// import { Box, TextField, Button, Typography } from "@mui/material";
// import { Link } from "react-router-dom";


// export default function DriverLogin() {

//     // Unified state for all form data
//     const [formData, setFormData] = useState({
//         cnic: '',
//         password: ''
//     });
//     const [error, setError] = useState(false);

//     // Handle changes for form fields
//     const handleChange = (e) => {
//         const { id, value } = e.target;
//         setFormData((prev) => ({ ...prev, [id]: value }));

//         // If phone field is updated, check for pattern validation
//         if (id === "cnic") {
//             const regex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/; // Matches the pattern 12345-1234567-1
//             setError(!regex.test(value));
//         }
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         console.log(formData);
    
//         try {
//             const response = await fetch('http://localhost:5000/login/driver', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(formData),
//             });
    
//             if (response.ok) {
//                 const data = await response.json();
//                 // alert(data.message);
//                 if (data.message === "Login successful!") {
//                     // Redirect to dashboard
//                     window.location.href = "/driverdashboard";
//                 }
//             } else {
//                 const errorData = await response.json();
//                 alert(errorData.error || 'An error occurred');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Failed to connect to the server');
//         }
//     };
//     return (
//         <>
//             <Header />
//             <form onSubmit={handleSubmit}>
//                 <Box
//                     sx={{
//                         maxWidth: 350,
//                         mx: "auto",
//                         mt: 10,
//                         p: 3,
//                         boxShadow: 3,
//                         borderRadius: 2,
//                         backgroundColor: "#fff",
//                         display: "flex",
//                         flexDirection: "column",
//                         justifyContent: "center",
//                     }}
//                 >
//                     <Typography
//                         variant="h5"
//                         component="h1"
//                         gutterBottom
//                         align="center"
//                         sx={{ fontWeight: "bold", mb: 2 }}
//                     >
//                        Driver Login
//                     </Typography>

//                     {/* Cnic Input Field */}
//                     <TextField
//                     id="cnic"
//                     label="CNIC"
//                     fullWidth
//                     margin="dense"
//                     size="small"
//                     required
//                     onChange={handleChange}
//                     placeholder="e.g., 12345-1234567-1"
//                     value={formData.cnic}
//                     error={error}
//                     helperText={error ? "Please enter a valid number (12345-1234567-1)" : ""}
//                 />

//                     {/* Password Input Field */}
//                     <TextField
//                         label="Password"
//                         id="password"
//                         type="password"
//                         fullWidth
//                         margin="dense"
//                         size="small"
//                         value={formData.password}
//                         onChange={handleChange}
//                         required
//                     />

//                     {/* Submit Button */}
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         color="primary"
//                         fullWidth
//                         sx={{ mt: 3 }}
//                         disabled={error || !formData.cnic || !formData.password} // Disable the button if there's an error or any field is empty
//                     >
//                         Login
//                     </Button>
//                 </Box>
//             </form>
//         </>
//     );
// }


import React, { useState } from "react";
import '../log-reg.css';
import Header from '../Header';
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';  // Used for navigation

export default function DriverLogin() {
    const [formData, setFormData] = useState({
        cnic: '',
        password: ''
    });
    const [error, setError] = useState(false);
    const navigate = useNavigate();  // Hook for navigation

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));

        if (id === "cnic") {
            const regex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;
            setError(!regex.test(value));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/login/driver', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message === "Login successful!") {
                    // Show alert with driver name
                    alert(`Login successful! Welcome, ${data.name}`);

                    // Store JWT token in localStorage
                    localStorage.setItem('driver_token', data.token);

                    // Redirect to the driver dashboard
                    navigate("/driverdashboard");
                }
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server');
        }
    };

    return (
        <>
            <Header />
            <form onSubmit={handleSubmit}>
                <Box
                    sx={{
                        maxWidth: 350,
                        mx: "auto",
                        mt: 10,
                        p: 3,
                        boxShadow: 3,
                        borderRadius: 2,
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Typography
                        variant="h5"
                        component="h1"
                        gutterBottom
                        align="center"
                        sx={{ fontWeight: "bold", mb: 2 }}
                    >
                        Driver Login
                    </Typography>

                    {/* CNIC Input Field */}
                    <TextField
                        id="cnic"
                        label="CNIC"
                        fullWidth
                        margin="dense"
                        size="small"
                        required
                        onChange={handleChange}
                        placeholder="e.g., 12345-1234567-1"
                        value={formData.cnic}
                        error={error}
                        helperText={error ? "Please enter a valid number (12345-1234567-1)" : ""}
                    />

                    {/* Password Input Field */}
                    <TextField
                        label="Password"
                        id="password"
                        type="password"
                        fullWidth
                        margin="dense"
                        size="small"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        disabled={error || !formData.cnic || !formData.password}
                    >
                        Login
                    </Button>
                </Box>
            </form>
        </>
    );
}
