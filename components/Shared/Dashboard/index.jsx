import { Card, Button, Divider } from "antd";
import {
    DownloadOutlined,
    ManOutlined,
    UploadOutlined,
    BookOutlined,
    BarChartOutlined,
    PlusOutlined,
    MinusOutlined,
    DollarOutlined
} from "@ant-design/icons";
const Dashboard = ({data}) => {
    return (
        <div>
            <div className="grid md:grid-cols-4 gap-6">
                <Card className="shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                                type="primary"
                                icon={<BarChartOutlined />}s
                                size="large"
                                shape="circle"
                                className="bg-rose-600"
                            />
                            <h1 className="text-xl font-semibold text-rose-600">
                                Transactions
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-rose-400">
                                {data?.data.totalTransactions}T
                            </h1>
                            <p className="text-lg mt-1 text-zinc-400">
                                {Math.floor(
                                    ((data?.data.totalTransactions)+(data?.data.totalTransactions*50)/100)
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                shape="circle"
                                className="bg-green-600"
                            />
                            <h1 className="text-xl font-semibold text-green-600">
                                Credits
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-rose-400">
                                {data?.data.totalCredit}T
                            </h1>
                            <p className="text-lg mt-1 text-zinc-400">
                                {Math.floor(
                                    ((data?.data.totalCredit)+(data?.data.totalCredit*50)/100)
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                                type="primary"
                                icon={<MinusOutlined />}
                                size="large"
                                shape="circle"
                                className="bg-orange-600"
                            />
                            <h1 className="text-xl font-semibold text-orange-600">
                                Debits
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                           <h1 className="text-3xl font-bold text-rose-400">
                                {data?.data.totalDebit}T
                            </h1>
                            <p className="text-lg mt-1 text-zinc-400">
                                {Math.floor(
                                    ((data?.data.totalDebit)+(data?.data.totalDebit*50)/100)
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card className="shadow">
                    <div className="flex justify-around items-center">
                        <div className="flex items-center flex-col gap-y-2">
                            <Button
                                type="primary"
                                icon={<DollarOutlined />}
                                size="large"
                                shape="circle"
                                className="bg-blue-600"
                            />
                            <h1 className="text-xl font-semibold text-blue-600">
                                Balance
                            </h1>
                        </div>
                        <Divider type="vertical" className="h-24" />
                        <div>
                            <h1 className="text-3xl font-bold text-rose-400">
                                {data?.data.balance}T
                            </h1>
                            <p className="text-lg mt-1 text-zinc-400">
                                {Math.floor(
                                    ((data?.data.balance)+(data?.data.balance*50)/100)
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
export default Dashboard;