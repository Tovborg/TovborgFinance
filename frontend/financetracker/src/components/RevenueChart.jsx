import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart() {
    const data = [
        { date: "01 Jan", expenses: 2400, income: 3200 },
        { date: "02 Jan", expenses: 3550, income: 4200 },
        { date: "03 Jan", expenses: 2300, income: 2800 },
        { date: "04 Jan", expenses: 4100, income: 4500 },
        { date: "05 Jan", expenses: 2900, income: 3600 },
        { date: "06 Jan", expenses: 3400, income: 3900 },
    ]
    return (
        <div className='bg-gray-800 rounded-xl p-6 shadow-md w-full'>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-center mb-7">
                <div>
                    <h2 className="text-lg font-semibold text-white">Revenue and Expenses</h2>
                    <p className="text-sm text-gray-400">Graph overview over your money</p>
                </div>
                <div className="flex justify-start sm:justify-end gap-2">
                    <button className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">Today</button>
                    <button className="text-xs px-3 py-1 rounded bg-indigo-600 text-white">Weekly</button>
                    <button className="text-xs px-3 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600">Monthly</button>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="date" stroke="#888888" />
                        <YAxis stroke="#888888" />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                        <Line type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}