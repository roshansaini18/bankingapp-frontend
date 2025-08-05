// import { useState, useEffect } from "react";
// import Cookies from "universal-cookie";
// import { http } from "../../modules/modules";
// import { Navigate, Outlet } from "react-router-dom";
// import Loader from "../Loader";

// const Guard = ({ endpoint, role }) => {
//   const cookies = new Cookies();
//   const token = cookies.get("authToken");

//   const [authorised, setAuthorised] = useState(false);
//   const [userType, setUserType] = useState(null);
//   const [loader, setLoader] = useState(true); // explicitly track loading

//   useEffect(() => {
//     const verifyToken = async () => {
//       if (!token) {
//         setAuthorised(false);
//         setLoader(false);
//         return;
//       }
//       try {
//         const httpReq = http(token);
//         const { data } = await httpReq.get(endpoint);
//         const user = data?.data?.userType;
//         sessionStorage.setItem("userInfo", JSON.stringify(data?.data));
//         setUserType(user);
//         setAuthorised(true);
//       } catch (err) {
//         setUserType(null);
//         setAuthorised(false);
//       } finally {
//         setLoader(false); // stop loading in all cases
//       }
//     };

//     verifyToken();
//   }, [endpoint, token]);

//   if (!token) return <Navigate to="/" />;
//   if (loader) return <Loader />;
//   if (!authorised) return <Navigate to="/" />;
//   if (authorised && userType === role) return <Outlet />;

//   return <Navigate to="/" />;
// };

// export default Guard;


// Guard.js (Corrected)

import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { http } from "../../modules/modules";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../Loader";

const Guard = ({ endpoint, role }) => {
  const cookies = new Cookies();
  const token = cookies.get("authToken");

  // No need for userType state here, it was causing the race condition
  const [authorised, setAuthorised] = useState(null); // Use null to represent the initial pending state
  const [loader, setLoader] = useState(true);

// In Guard.js

useEffect(() => {
  const verifyToken = async () => {
    console.log("--- Guard Verification Started ---");
    console.log("1. Token from cookies:", token);
    console.log("2. Role prop being checked for:", role);
    console.log("3. Verification endpoint:", endpoint);

    if (!token) {
      console.log("Verification failed: No token found in cookies.");
      setAuthorised(false);
      setLoader(false);
      return;
    }

    try {
      const httpReq = http(token);
      const { data } = await httpReq.get(endpoint);
      console.log("4. SUCCESS: API call succeeded. Full response data from server:", data);

      const apiUserType = data?.userType || data?.data?.userType;
      console.log("5. Extracted user type from API response:", apiUserType);

      if (apiUserType === role) {
        console.log("6. ✅ SUCCESS: Role matches. User is authorized.");
        setAuthorised(true);
      } else {
        console.error("7. ❌ FAILURE: Role mismatch.");
        console.error(`   > API returned role: '${apiUserType}'`);
        console.error(`   > Required role: '${role}'`);
        setAuthorised(false);
      }
    } catch (err) {
      console.error("7. ❌ FAILURE: The API call threw an error.", err);
      if (err.response) {
        // This is for errors returned by the server (e.g., 401, 403, 500)
        console.error("   > Server responded with status:", err.response.status);
        console.error("   > Server error message:", err.response.data);
      }
      setAuthorised(false);
      cookies.remove("authToken", { path: "/" });
    } finally {
      console.log("--- Guard Verification Finished ---");
      setLoader(false);
    }
  };

  verifyToken();
}, [token, endpoint, role]);

  // Show loader while verification is in progress
  if (loader || authorised === null) {
    return <Loader />;
  }

  // If authorised, show the child component. Otherwise, redirect to the home page.
  return authorised ? <Outlet /> : <Navigate to="/" />;
};

export default Guard;
