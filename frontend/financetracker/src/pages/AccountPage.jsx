import Navbar from "../components/Navbar"
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useAuth } from "../context/AuthContext";

const chartData = [
    { date: "20 Sep", balance: 20 },
    { date: "21 Sep", balance: 8530 },
    { date: "22 Sep", balance: 543 },
    { date: "23 Sep", balance: 8740 },
    { date: "24 Sep", balance: 9543 },
]

export default function AccountPage() {
    const { user, isLoading } = useAuth();
    // Check if the user is authenticated
    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/" />;
    }
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-[0.4fr_0.6fr]">
                    {/* Welcome card */}
                    <div className="bg-gray-800 rounded-xl p-6 flex flex-col justify-between shadow-md">
                        <div>
                            <p className="text-sm text-indigo-400 uppercase font-medium">Your Account</p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
                                Welcome Back,<br />Emil! 👋
                            </h2>
                            <p className="mt-10 text-md text-gray-400">
                                Everything seems ok and up-to-date with <br /> your account since your last visit.
                            </p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="bg-gray-800 rounded-xl p-6 shadow-md">
                        <div className="mb-4 text-center">
                            <p className="text-sm font-medium text-gray-400 mb-2 uppercase">Account balance</p>
                            <h3 className="text-2xl font-semibold">$9,543.12</h3>
                            <p className="text-sm text-green-400 mt-2">↑ $149.32 Today, Sep 25</p>
                        </div>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6b7280" // grå farve (#6b7280 = gray-500)
                                        axisLine={true}
                                        tickLine={true}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#1f2937", border: "none" }}
                                        labelStyle={{ color: "#9ca3af" }}
                                        formatter={(value) => [`$${value}`, "Balance"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        dot={{ r: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}