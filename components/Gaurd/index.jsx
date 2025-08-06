import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { http } from "../../modules/modules";
import { Navigate, Outlet } from "react-router-dom";
import { useLoader } from "../Layout/Theme/ThemeContext"; // 1. Import the global loader hook

const Guard = ({ endpoint, role }) => {
    const cookies = new Cookies();
    const token = cookies.get("authToken");
    
    // 2. Use the global loader instead of local state
    const { showLoader, hideLoader } = useLoader();

    // 3. Use a single state to manage the verification status. This is the key fix.
    const [verificationStatus, setVerificationStatus] = useState("verifying");

    useEffect(() => {
        const verifyToken = async () => {
            // No need to show loader here, the parent will do it before this component even mounts if needed
            
            if (!token) {
                setVerificationStatus("unauthorised");
                return; // Exit early
            }

            try {
                // The global loader is already shown by the time this runs.
                const httpReq = http(token);
                const { data } = await httpReq.get(endpoint);

                // Handle possible API response formats
                const user = data?.userType || data?.data?.userType;

                // For debugging, log the variable directly, not the state.
                console.log("User Type from API:", user);

                // 4. Perform the role check *inside* the useEffect, where we have the fresh data.
                if (user === role) {
                    setVerificationStatus("authorised");
                    // Save user data only on successful authorization and role match
                } else {
                    // Role mismatch
                    setVerificationStatus("unauthorised");
                }
            } catch (err) {
                console.error("Token verification failed:", err);
                setVerificationStatus("unauthorised");
            }
        };
        
        // Wrap the async function in a self-invoking function to handle showing/hiding loader
        (async () => {
            showLoader();
            await verifyToken();
            hideLoader();
        })();

    }, [endpoint, role, token, showLoader, hideLoader]); // Add all dependencies

    // 5. The return logic is now much simpler and free of race conditions.
    if (verificationStatus === "verifying") {
        // The GlobalLoader is displaying, so we render nothing here.
        return null;
    }

    if (verificationStatus === "authorised") {
        return <Outlet />;
    }
    
    // This catches all other cases ('unauthorised', etc.)
    return <Navigate to="/" />;
};

export default Guard;
