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
                setVerificationStatus("unauthorised");
                // Clear any stale user info if no token exists
                localStorage.removeItem("userInfo"); 
                return;
            }

            try {
                const httpReq = http(token);
                const { data } = await httpReq.get(endpoint);
                const userPayload = data?.data || data;

                // --- THIS IS THE KEY FIX ---
                // 1. Save user info as soon as the token is verified as valid.
                localStorage.setItem("userInfo", JSON.stringify(userPayload));

                const userRole = userPayload?.userType;
                
                // 2. Add detailed console logs for easier debugging
                console.log("GUARD: Verification successful.");
                console.log("GUARD: Role from API is:", `"${userRole}"`);
                console.log("GUARD: Required role for this route is:", `"${role}"`);

                // 3. Now, separately check for route authorization.
                if (userRole === role) {
                    console.log("GUARD: Role match SUCCESS. Authorizing access.");
                    setVerificationStatus("authorised");
                } else {
                    console.log("GUARD: Role match FAILED. Redirecting.");
                    setVerificationStatus("unauthorised");
                }

            } catch (err) {
                console.error("GUARD: Token verification API call failed.", err);
                // If the token is invalid, remove it and the stale user info
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

    if (verificationStatus === "verifying") {
        return null; // The GlobalLoader is handling the UI
    }

    if (verificationStatus === "authorised") {
        return <Outlet />; // Success: Render the dashboard or other protected content
    }
    
    // Any other status leads to a redirect
    return <Navigate to="/" />;
};

export default Guard;
