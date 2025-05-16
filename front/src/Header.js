import { Link } from "react-router-dom";

export default function Header() {
    return (
        <main>
            <header>
                <Link to="/"><img src="./images/logo.png" /></Link>
                <nav>
                    {/* <Link to="/loginpage">SHUTTLE</Link>
                    <Link to="/registerpage">MANAGEMENT</Link>       */}
                    <p>IQRA UNIVERSITY SHUTTLE </p> 
                </nav>
            </header>
        </main>
    );
}
