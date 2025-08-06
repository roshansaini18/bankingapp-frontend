import Adminlayout from "../Layout/Adminlayout";
import Dashboard from "../Shared/Dashboard";
import useSWR from "swr";
import { fetchData, http } from "../../modules/modules"; // Assuming you have an http module too

const AdminDashboard = () => {
    // 1. Safely get userInfo from localStorage.
    const userInfoString = localStorage.getItem("userInfo");
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;

    // 2. This is the key fix: The SWR key is now a function.
    // SWR will only call the fetcher if this function returns a valid URL string.
    // If userInfo or userInfo.branch is missing, it returns null, and SWR will pause.
    const { data: trData, error: trError } = useSWR(
        () => userInfo?.branch ? `/api/transaction/summary?branch=${userInfo.branch}` : null,
        (url) => http().get(url).then(res => res.data), // Example of a fetcher using your http module
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            refreshInterval: 1200000,
        }
    );

    // 3. Optional: Handle error state for a better user experience.
    if (trError) {
        console.error("SWR Error fetching summary:", trError);
        return (
            <Adminlayout>
                <div className="text-center p-8 bg-red-100 text-red-700 rounded-lg">
                    <h2 className="text-xl font-bold">Could not load dashboard data.</h2>
                    <p>There was an error fetching the transaction summary.</p>
                </div>
            </Adminlayout>
        );
    }
    
    // While `trData` is undefined (because SWR is paused or fetching),
    // the Dashboard component's internal skeleton loader will be shown.
    // `trData && trData` is the same as just `trData`.
    return (
        <Adminlayout>
            <Dashboard data={trData} />
        </Adminlayout>
    );
}

export default AdminDashboard;
