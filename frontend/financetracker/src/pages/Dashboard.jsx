import { useAuth } from "../context/AuthContext"
import { Navigate } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function Dashboard() {
    const { user } = useAuth()
    // Check if the user is authenticated
    if (!user) {
        return <Navigate to="/" />
    }
    return (
        <div>
            <Navbar />
            <h1>Dashboard</h1>
            <p>Welcome back {user.name}</p>
            <p>Here you can view your financial data and insights.</p>
        </div>
    )
}