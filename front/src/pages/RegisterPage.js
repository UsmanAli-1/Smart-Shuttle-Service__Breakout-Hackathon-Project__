import React, { useState } from "react";
import Header from "../Header"; // Assuming you have a custom header component
import '../log-reg.css'; // Your CSS file
import { Box, TextField, Button, Typography } from "@mui/material"; // Importing Material UI components

export default function RegisterPage() {
    // State to store form data for each input field
    const [formData, setFormData] = useState({
        name: '',
        father_name: '',
        email:'',
        address: '',
        phone: '',
        cnic: '',
        password: '',
        id:'',
    });
    

    // State to handle file upload
    const [file, setFile] = useState(null);

        const [error, setError] = useState(false);
    

    // Handle input field change and update the state for each field
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));

        if (id === "phone") {
            const regex = /^03[0-9]{9}$/; // Matches the pattern 03XXXXXXXXX
            setError(!regex.test(value));
        }

        if (id === "cnic") {
            const regex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/; // Matches the pattern 12345-1234567-1
            setError(!regex.test(value));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
    
        try {
            const response = await fetch('http://localhost:5000/register/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
            } else {
                // const errorData = await response.json();
                console.error(data);
                alert(data.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server');
        }
    };

    return (
        <>
            <Header /> 
            <Box
                component="form" // Defining the form component
                onSubmit={handleSubmit} // Handle the form submission
                sx={{
                    maxWidth: 350,
                    mx: "auto",
                    mt: 2,
                    p: 2,
                    boxShadow: 3,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                }}
            >
                <Typography variant="h5" align="center" sx={{ fontWeight: "bold", mb: 2 }} >
                    Register
                </Typography>

                {/* Name field */}
                <TextField
                    id="name"
                    label="Name"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                />

                {/* Father's name field */}
                <TextField
                    id="father_name"
                    label="Father's Name"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                />

                {/* Address field */}
                {/* <TextField
                    id="address"
                    label="Address"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                /> */}

                {/* Phone field with pattern validation */}
                <TextField
                    id="phone"
                    label="Phone"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                    placeholder="e.g., 03001234567"
                    value={formData.phone}
                    error={error}
                    helperText={error ? "Please enter a valid number (03XXXXXXXXX)" : ""}
                />

                {/* CNIC field with pattern validation */}
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

                {/* Password field */}
                <TextField
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                />

                <TextField
                    id="email"
                    label="Email"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                />
                <TextField
                    id="id"
                    label="Student id"
                    fullWidth
                    margin="dense"
                    size="small"
                    required
                    onChange={handleChange}
                />
                
                {/* File Upload Button */}
                <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Upload File
                    <input
                        type="file"
                        hidden
                        onChange={(e) => setFile(e.target.files[0])} // Set selected file
                    />
                </Button>

                {/* Display file name if a file is selected */}
                {file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Selected File: {file.name}
                    </Typography>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={error || !formData.phone || !formData.password}
                >
                    Register
                </Button>
            </Box>
        </>
    );
}
