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

import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { http } from "../../modules/modules";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../Loader";

const Guard = ({ endpoint, role }) => {
  const cookies = new Cookies();
  
  // This state will track the verification status: 'loading', 'authorised', or 'unauthorised'
  const [authStatus, setAuthStatus] = useState('loading');

  useEffect(() => {
    const verifyUser = async () => {
      const token = cookies.get("authToken");

      // 1. If no token exists, the user is definitely not authorised.
      if (!token) {
        setAuthStatus('unauthorised');
        return;
      }

      try {
        // 2. We have a token. Let's verify it with the backend.
        const httpReq = http(token);
        const { data } = await httpReq.get(endpoint);
        
        // 3. The token is valid. Now, check if the user has the correct role for this route.
        const user = data?.data;
        if (user && user.userType === role) {
          // Success! User is valid and has the correct role.
          // We also refresh localStorage with the latest user info from the server.
          localStorage.setItem("userInfo", JSON.stringify(user));
          setAuthStatus('authorised');
        } else {
          // The user is valid but trying to access a route they don't have permission for.
          setAuthStatus('unauthorised');
        }
      } catch (err) {
        // 4. The token is invalid or expired. Clear everything.
        cookies.remove("authToken", { path: "/" });
        localStorage.removeItem("userInfo");
        setAuthStatus('unauthorised');
      }
    };

    verifyUser();
  }, [endpoint, role]); // Rerun if the endpoint or role prop changes

  // --- Render Logic ---

  // 1. While we are verifying the token, show a loader.
  // This is the key to preventing the premature redirect.
  if (authStatus === 'loading') {
    return <Loader />;
  }

  // 2. If verification is complete and the user is authorised, show the protected content.
  if (authStatus === 'authorised') {
    return <Outlet />;
  }

  // 3. If verification is complete and the user is not authorised, redirect to the login page.
  return <Navigate to="/" />;
};

export default Guard;




