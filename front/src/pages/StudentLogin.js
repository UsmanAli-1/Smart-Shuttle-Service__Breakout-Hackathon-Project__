// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import Header from "../Header";
// import '../log-reg.css';
// import { useNavigate } from "react-router-dom";
// import { Box, TextField, Button, Typography } from "@mui/material";

// export default function LoginPage() {
//     // Unified state for all form data
//     const [formData, setFormData] = useState({
//         id: '',
//         password: ''
//     });
//     const [error, setError] = useState(false);

//     // Handle changes for form fields
//     const handleChange = (e) => {
//         const { id, value } = e.target;
//         setFormData((prev) => ({ ...prev, [id]: value }));

//         // If id field is updated, check for pattern validation
//         if (id === "id") {
//             const regex = /^[0-9]{5}$/; // Matches the pattern 12345
//             setError(!regex.test(value));
//         }
//     };

// // handle submission 
// const handleSubmit = async (e) => {
//     e.preventDefault();
//     console.log(formData);

//     try {
//         const response = await fetch('http://localhost:5000/login/student', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(formData),
//         });

//         if (response.ok) {
//             const data = await response.json();
//             // alert(data.message);
//             if (data.message === "Login successful!") {
//                 // Redirect to dashboard
//                 window.location.href = "/studentdashboard";
//             }
//         } else {
//             const errorData = await response.json();
//             alert(errorData.error || 'An error occurred');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         alert('Failed to connect to the server');
//     }
// };


//     // direct to register page 
//     const navigate = useNavigate();

//     const handleRegister = () => {
//         navigate('/registerpage'); // Navigate to the register page
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
//                         Student Login
//                     </Typography>

//                     {/* Student ID Input Field */}
//                     <TextField
//                         label="Student id"
//                         id="id"
//                         type="text"
//                         fullWidth
//                         margin="dense"
//                         size="small"
//                         value={formData.id}
//                         onChange={handleChange}
//                         error={error}
//                         helperText={error ? "Please enter a valid number (12345)" : ""}
//                         placeholder="e.g., 12345"
//                         required
//                     />

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
//                         disabled={error || !formData.id || !formData.password} // Disable button if fields are empty or there's an error
//                     >
//                         Login
//                     </Button>

//                     {/* Register Button */}
//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "center",
//                             mt: 2,
//                         }}
//                     >
//                         <Button
//                             variant="contained"
//                             color="primary"
//                             sx={{ width: "30%" }}
//                             onClick={handleRegister}
//                         >
//                             Register
//                         </Button>
//                     </Box>
//                     {/* <Link to='/studentdashboard'>Student Dashboard</Link> Link to student dashboard  */}
//                 </Box>
//             </form>
//         </>
//     );
// }






import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Header";
import '../log-reg.css';
import { Box, TextField, Button, Typography } from "@mui/material";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        id: '',
        password: ''
    });
    const [error, setError] = useState(false);

    // Handle changes for form fields
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));

        if (id === "id") {
            const regex = /^[0-9]{5}$/; // Matches the pattern 12345
            setError(!regex.test(value));
        }
    };

    // Handle form submission (login)
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData);
    
        try {
            const response = await fetch('http://localhost:5000/login/student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                const data = await response.json();
                
                if (data.message === "Login successful!") {
                    // 🔹 Save Student ID to localStorage
                    localStorage.setItem('loggedInStudent', JSON.stringify({ id: formData.id }));
            
                    // 🔹 Store JWT token in a cookie
                    document.cookie = `token=${data.token}; path=/; Secure; SameSite=Strict`;
            
                    // 🔹 Redirect to the dashboard
                    navigate('/studentdashboard');
                }
            }
             else {
                const errorData = await response.json();
                alert(errorData.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server');
        }
    };
    

    // Navigate to the register page
    const navigate = useNavigate();
    const handleRegister = () => {
        navigate('/registerpage');
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
                        Student Login
                    </Typography>

                    {/* Student ID Input Field */}
                    <TextField
                        label="Student ID"
                        id="id"
                        type="text"
                        fullWidth
                        margin="dense"
                        size="small"
                        value={formData.id}
                        onChange={handleChange}
                        error={error}
                        helperText={error ? "Please enter a valid number (12345)" : ""}
                        placeholder="e.g., 12345"
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
                        disabled={error || !formData.id || !formData.password}
                    >
                        Login
                    </Button>

                    {/* Register Button */}
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ width: "30%" }}
                            onClick={handleRegister}
                        >
                            Register
                        </Button>
                    </Box>
                </Box>
            </form>
        </>
    );
}
