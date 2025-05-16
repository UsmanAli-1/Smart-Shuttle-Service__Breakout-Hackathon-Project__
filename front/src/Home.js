import { useNavigate } from "react-router-dom";
import { Button, Container, Typography, Grid, Paper } from "@mui/material";
import Header from "./Header";

export default function Home() {
    const navigate = useNavigate();

    const handleStudent = () => {
        navigate('/studentlogin');
    };
    const handleDriver = () => {
        navigate('/driverlogin');
    };
    const handleAdmin = () => {
        navigate('/adminlogin');
    };

    return (
        <>
            <Header />
            <div style={{ display: 'flex', alignItems: 'center', height: '75vh' }}>
                <Container maxWidth="sm" sx={{ paddingTop: 5, textAlign: 'center' }}>
                    <Paper sx={{ padding: 5, boxShadow: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Welcome To Shuttle Dashboard
                        </Typography>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                            Select your role to proceed:
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item xs={12} sm={10}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleStudent}
                                    sx={{ fontSize: '1.2rem', padding: '15px' }}
                                >
                                    Student Dashboard
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={10}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleDriver}
                                    sx={{ fontSize: '1.2rem', padding: '15px' }}
                                >
                                    Driver Dashboard
                                </Button>
                            </Grid>
                            <Grid item xs={12} sm={10}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleAdmin}
                                    sx={{ fontSize: '1.2rem', padding: '15px' }}
                                >
                                    Admin Dashboard
                                </Button>
                            </Grid>
                        </Grid>
                        <Typography variant="body2" marginTop="10px" color="#888">
                            &copy; 2025 All rights reserved.
                        </Typography>
                    </Paper>
                </Container>
            </div>
        </>
    );
}
