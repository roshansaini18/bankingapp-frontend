import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { http } from "../../modules/modules";
import { Navigate, Outlet } from "react-router-dom";
import { useLoader } from "./Layout/Theme/ThemeContext";

const Guard = ({ endpoint, role }) => {
    const cookies = new Cookies();
    const token = cookies.get("authToken");
    const { showLoader, hideLoader } = useLoader();
    const [verificationStatus, setVerificationStatus] = useState("verifying");

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                localStorage.removeItem("userInfo");
                setVerificationStatus("unauthorised");
                return;
            }
            try {
                const httpReq = http(token);
                const { data } = await httpReq.get(endpoint);
                const userPayload = data?.data || data;

                localStorage.setItem("userInfo", JSON.stringify(userPayload));
                const userRole = userPayload?.userType;

                if (userRole === role) {
                    setVerificationStatus("authorised");
                } else {
                    setVerificationStatus("unauthorised");
                }
            } catch (err) {
                cookies.remove("authToken", { path: '/' });
                localStorage.removeItem("userInfo");
                setVerificationStatus("unauthorised");
            }
        };

        (async () => {
            showLoader();
            await verifyToken();
            hideLoader();
        })();

    }, [endpoint, role, token, showLoader, hideLoader]);

    // This logic prevents the race condition.
    // It will not render the <Outlet/> until verification is complete.
    if (verificationStatus === "verifying") {
        return null; // The GlobalLoader is handling the UI
    }

    if (verificationStatus === "authorised") {
        return <Outlet />;
    }
    
    return <Navigate to="/" />;
};

export default Guard;
