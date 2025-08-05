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
  const token = cookies.get("authToken");
  console.log(token);
  const [authorised, setAuthorised] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loader, setLoader] = useState(true);
  
  useEffect(() => {
    const verifyToken = async () => {
      // If no token, mark unauthorized and stop loader
      if (!token) {
        setAuthorised(false);
        setLoader(false);
        return;
      }

      try {
        // Send verification request with token
        const httpReq = http(token);
        const { data } = await httpReq.get(endpoint);
         console.log(data);
        // Handle possible API response formats
        const user = data?.userType || data?.data?.userType;

        // Save user data consistently in localStorage
        localStorage.setItem("userInfo", JSON.stringify(data?.data || data));

        setUserType(user);
         console.log(userType);
        setAuthorised(true);
      } catch (err) {
        setUserType(null);
        setAuthorised(false);
      } finally {
        setLoader(false);
      }
    };

    verifyToken();
  }, [endpoint, token]);

  // Show loader while verifying
  if (loader) return <Loader />;

  // Redirect if no token or unauthorized
  if (!token || !authorised) return <Navigate to="/" />;

  // Redirect if authorized but role mismatch
  if (authorised && userType !== role) return <Navigate to="/" />;

  // Allow access
  return <Outlet />;
};

export default Guard;
