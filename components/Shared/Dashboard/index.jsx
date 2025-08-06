import { Card, Divider, Skeleton } from "antd";
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

// Register the components Chart.js needs to draw the charts
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ summary }) => {
    // If the summary data hasn't loaded yet, show a placeholder
    if (!summary) {
        return (
            <div className="grid md:grid-cols-4 gap-6">
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
                <Skeleton active paragraph={{ rows: 2 }} />
            </div>
        );
    }

    // --- Chart Data and Options ---

    // Data for the Bar Chart (Credit vs Debit Amount)
    const barChartData = {
        labels: ['Transactions'],
        datasets: [
            {
                label: 'Total Credit (₹)',
                data: [summary.totalCredit],
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(34, 197, 94, 1)',
                borderWidth: 1,
            },
            {
                label: 'Total Debit (₹)',
                data: [summary.totalDebit],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Data for the Doughnut Chart (Transaction Counts)
    const doughnutChartData = {
        labels: ['Credit Transactions', 'Debit Transactions'],
        datasets: [
            {
                label: 'Transaction Count',
                data: [summary.creditCount, summary.debitCount],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgba(255, 255, 255, 1)',
                    'rgba(255, 255, 255, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    return (
        <div className="flex flex-col gap-6">
            {/* --- Top Statistic Cards --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="shadow text-center">
                    <BarChartOutlined className="text-3xl text-rose-500 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-600">Total Transactions</h3>
                    <p className="text-2xl font-bold">{summary.totalTransactions}</p>
                </Card>
                <Card className="shadow text-center">
                    <PlusOutlined className="text-3xl text-green-500 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-600">Total Credit</h3>
                    <p className="text-2xl font-bold">₹{summary.totalCredit.toLocaleString()}</p>
                </Card>
                <Card className="shadow text-center">
                    <MinusOutlined className="text-3xl text-red-500 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-600">Total Debit</h3>
                    <p className="text-2xl font-bold">₹{summary.totalDebit.toLocaleString()}</p>
                </Card>
                <Card className="shadow text-center">
                    <DollarOutlined className="text-3xl text-blue-500 mb-2" />
                    <h3 className="text-lg font-semibold text-gray-600">Final Balance</h3>
                    <p className="text-2xl font-bold">₹{summary.balance.toLocaleString()}</p>
                </Card>
            </div>

            {/* --- Charts --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="shadow">
                    <h3 className="text-lg font-semibold mb-4">Credit vs. Debit Amount</h3>
                    <Bar data={barChartData} options={{ responsive: true }} />
                </Card>
                <Card className="shadow flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-4">Transaction Type Breakdown</h3>
                    <div style={{ maxWidth: '250px', margin: '0 auto' }}>
                        <Doughnut data={doughnutChartData} options={{ responsive: true }} />
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard;
