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

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setAuthorised(false);
        setLoader(false);
        return;
      }

      try {
        const httpReq = http(token);
        const { data } = await httpReq.get(endpoint);

        // Get the user type directly from the API response
        const apiUserType = data?.userType || data?.data?.userType;

        // *** FIX: Perform the role check here directly ***
        if (apiUserType === role) {
          // If the role matches, set authorised to true
          setAuthorised(true);
          // Also, update localStorage with the latest user info from the verification endpoint
          localStorage.setItem("userInfo", JSON.stringify(data?.data || data));
        } else {
          // If roles don't match, explicitly set to false
          setAuthorised(false);
        }
      } catch (err) {
        // Any error in verification means not authorised
        setAuthorised(false);
        // It's good practice to remove invalid tokens
        cookies.remove("authToken", { path: "/" });
      } finally {
        setLoader(false);
      }
    };

    verifyToken();
    // We only need to run this effect when the component mounts or if the token changes.
    // 'endpoint' and 'role' are props and should be stable.
  }, [token, endpoint, role]);

  // Show loader while verification is in progress
  if (loader || authorised === null) {
    return <Loader />;
  }

  // If authorised, show the child component. Otherwise, redirect to the home page.
  return authorised ? <Outlet /> : <Navigate to="/" />;
};

export default Guard;
