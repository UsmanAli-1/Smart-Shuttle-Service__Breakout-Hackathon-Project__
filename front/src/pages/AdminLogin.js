import React, { useState } from "react";
import '../log-reg.css';
import Header from '../Header'
import { Box, TextField, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function AdminLogin() {
    // Unified state for all form data
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(false);

    // Handle changes for form fields
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        console.log(formData);
        
        try {
            const response = await fetch('http://localhost:5000/login/manager', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const data = await response.json();
                // alert(data.message);
                if (data.message === "Login successful!") {
                    // Redirect to dashboard
                    window.location.href = "/admindashboard";
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
                        Admin Login
                    </Typography>

                    {/* Number Input Field */}
                    <TextField
                        label="Username"
                        id="username"
                        type="text"
                        fullWidth
                        margin="dense"
                        size="small"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="username"
                        // error={error}
                        // helperText={error ? "Please enter a valid number (admin123@example.com)" : ""}
                        required
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
                        // disabled={error || !formData.email || !formData.password} // Disable the button if there's an error or any field is empty
                    >
                        Login
                    </Button>
                    {/* <Link to='/admindashboard'>Admin Dashboard</Link> */}
                </Box>
            </form>
        </>
    );
}