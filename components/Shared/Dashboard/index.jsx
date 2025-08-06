import { Card, Skeleton } from "antd";
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import {
    BarChartOutlined,
    PlusOutlined,
    MinusOutlined,
    DollarOutlined,
} from "@ant-design/icons";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

// --- Canara Bank Theme Colors ---
const CANARA_BLUE = '#0055A5';
const ACCENT_YELLOW = '#FFC107';
const CREDIT_GREEN = '#22c55e'; // A clear green for credit
const DEBIT_RED = '#ef4444'; // A clear red for debit

const Dashboard = ({ data }) => {
    // Loading state: shows skeletons if data is not yet available
    if (!data || !data.data) {
        return (
            <div className="grid md:grid-cols-4 gap-6">
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
            </div>
        );
    }

    // Safely destructure data with default values
    const summary = data.data;
    const {
        totalTransactions = 0,
        totalCredit = 0,
        totalDebit = 0,
        balance = 0,
    } = summary;

    // --- Chart Data with Themed Colors ---
    const barChartData = {
        labels: ['Amount'],
        datasets: [
            {
                label: 'Total Credit (₹)',
                data: [totalCredit],
                backgroundColor: 'rgba(34, 197, 94, 0.7)', // Green
                borderColor: CREDIT_GREEN,
                borderWidth: 1,
            },
            {
                label: 'Total Debit (₹)',
                data: [totalDebit],
                backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red
                borderColor: DEBIT_RED,
                borderWidth: 1,
            },
        ],
    };

    const doughnutChartData = {
        labels: ['Total Credit', 'Total Debit'],
        datasets: [
            {
                label: 'Amount (₹)',
                data: [totalCredit, totalDebit],
                // Using the primary brand colors for the breakdown
                backgroundColor: [CANARA_BLUE, ACCENT_YELLOW],
                borderColor: ['#FFFFFF', '#FFFFFF'],
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div className="flex flex-col gap-6">
            {/* --- Top Statistic Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow text-center">
                    <BarChartOutlined className="text-3xl mb-2" style={{ color: ACCENT_YELLOW }} />
                    <h3 className="text-lg font-semibold text-gray-600">Total Transactions</h3>
                    <p className="text-2xl font-bold">{totalTransactions}</p>
                </Card>
                <Card className="shadow text-center">
                    <PlusOutlined className="text-3xl mb-2" style={{ color: CREDIT_GREEN }} />
                    <h3 className="text-lg font-semibold text-gray-600">Total Credit</h3>
                    <p className="text-2xl font-bold">₹{totalCredit.toLocaleString('en-IN')}</p>
                </Card>
                <Card className="shadow text-center">
                    <MinusOutlined className="text-3xl mb-2" style={{ color: DEBIT_RED }} />
                    <h3 className="text-lg font-semibold text-gray-600">Total Debit</h3>
                    <p className="text-2xl font-bold">₹{totalDebit.toLocaleString('en-IN')}</p>
                </Card>
                <Card className="shadow text-center">
                    <DollarOutlined className="text-3xl mb-2" style={{ color: CANARA_BLUE }} />
                    <h3 className="text-lg font-semibold text-gray-600">Final Balance</h3>
                    <p className="text-2xl font-bold">₹{balance.toLocaleString('en-IN')}</p>
                </Card>
            </div>

            {/* --- Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card className="shadow lg:col-span-3">
                    <h3 className="text-lg font-semibold mb-4">Credit vs. Debit Comparison</h3>
                    <div className="relative h-80">
                        <Bar data={barChartData} options={chartOptions} />
                    </div>
                </Card>
                <Card className="shadow lg:col-span-2 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Amount Breakdown</h3>
                    <div className="relative h-80 w-80">
                        <Doughnut data={doughnutChartData} options={chartOptions} />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
