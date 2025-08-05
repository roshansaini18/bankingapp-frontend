import { useState, useEffect } from "react";
import Cookies from "universal-cookie";
import { http } from "../../modules/modules";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../Loader";

const Guard = ({ endpoint, role }) => {
  const cookies = new Cookies();
  const token = cookies.get("authToken");

  const [authorised, setAuthorised] = useState(false);
  const [userType, setUserType] = useState(null);
  const [loader, setLoader] = useState(true); // explicitly track loading

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
        const user = data?.data?.userType;
        sessionStorage.setItem("userInfo", JSON.stringify(data?.data));
        setUserType(user);
        setAuthorised(true);
      } catch (err) {
        setUserType(null);
        setAuthorised(false);
      } finally {
        setLoader(false); // stop loading in all cases
      }
    };

    verifyToken();
  }, [endpoint, token]);

  if (!token) return <Navigate to="/" />;
  if (loader) return <Loader />;
  if (!authorised) return <Navigate to="/" />;
  if (authorised && userType === role) return <Outlet />;

  return <Navigate to="/" />;
};

export default Guard;
