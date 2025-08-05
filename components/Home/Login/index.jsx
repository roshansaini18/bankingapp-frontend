import { LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
const { Item } = Form;
import { trimData, http } from "../../../modules/modules";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const cookies = new Cookies();
  const expires = new Date();
  expires.setDate(expires.getDate() + 3);

  const navigate = useNavigate();
  const [messageApi, context] = message.useMessage();

  const onFinish = async (values) => {
    try {
      const finalObj = trimData(values);
      const httpReq = http();
      const { data } = await httpReq.post("/api/login", finalObj);

      if (data?.isLoged) {
        const { token, userType, user } = data;
        cookies.set("authToken", token, { path: "/", expires });

        if (user) {
          localStorage.setItem("userInfo", JSON.stringify(user));
        }

        if (userType === "admin") {
          navigate("/admin");
        } else if (userType === "employee") {
          navigate("/employee");
        } else if (userType === "customer") {
          navigate("/customer");
        }

        messageApi.success("Login success");
      } else {
        return message.warning("Wrong credentials!");
      }
    } catch (err) {
      messageApi.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] py-4 sm:py-6 bg-gray-100">
      {context}

      {/* Blue Gradient Container */}
      <div className="flex flex-col md:flex-row w-[95%] md:w-[80%] lg:w-[70%] rounded-xl shadow-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">
        
        {/* Left side image (hidden on mobile) */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-6">
          <img
            src="/bank-img.png"
            alt="Bank"
            className="w-4/5 max-w-md object-contain drop-shadow-lg"
          />
        </div>

        {/* Right side login form */}
        <div className="flex w-full md:w-1/2 items-center justify-center p-4 sm:p-6 bg-white">
          <Card className="w-full max-w-sm sm:max-w-md shadow-none border-0">
            <h2 className="text-xl sm:text-2xl font-semibold text-center text-blue-700 mb-3 sm:mb-4">
              Bank Login
            </h2>
            <Form name="login" onFinish={onFinish} layout="vertical" className="space-y-2">
              <Item name="email" label={<span className="text-sm sm:text-base">Username</span>} rules={[{ required: true }]}>
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter your username"
                  size="large"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </Item>
              <Item name="password" label={<span className="text-sm sm:text-base">Password</span>} rules={[{ required: true }]}>
                <Input.Password
                  prefix={<LoginOutlined />}
                  placeholder="Enter your password"
                  size="large"
                  className="h-10 sm:h-12 text-sm sm:text-base"
                />
              </Item>
              <Item>
                <Button
                  type="text"
                  htmlType="submit"
                  block
                  size="large"
                  className="!bg-blue-500 !text-white !font-bold hover:!bg-blue-600 text-sm sm:text-base"
                >
                  Login
                </Button>
              </Item>

              {/* Forgot Password link */}
              <div className="text-center mt-2">
                <Button
                  type="link"
                  className="!text-blue-500 hover:!text-blue-700 text-xs sm:text-sm"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

// import { LoginOutlined, UserOutlined } from "@ant-design/icons";
// import { Button, Card, Form, Input, message } from "antd";
// const { Item } = Form;
// import { trimData, http } from "../../../modules/modules";
// import Cookies from "universal-cookie";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const cookies = new Cookies();
//   const expires = new Date();
//   expires.setDate(expires.getDate() + 3); // Set cookie to expire in 3 days

//   const navigate = useNavigate();
//   const [messageApi, context] = message.useMessage();

//   const onFinish = async (values) => {
//     try {
//       const finalObj = trimData(values);
//       const httpReq = http();
//       console.log(finalObj);
//       const { data } = await httpReq.post("/api/login", finalObj);


//       if (data?.isLoged) {
//         const { token, userType, user } = data;
        
//         // 1. Set the authentication token in cookies
//         cookies.set("authToken", token, { path: "/", expires });

//         // 2. Store the user's information in localStorage.
//         // localStorage persists even after the browser is closed.
//         if (user) {
//           localStorage.setItem("userInfo", JSON.stringify(user));
//         }

//         // 3. Navigate based on user type
//         if (userType === "admin") {
//           navigate("/admin");
//         } else if (userType === "employee") {
//           navigate("/employee");
//         } else if (userType === "customer") {
//           navigate("/customer");
//         }

//         messageApi.success("Login success");
//       } else {
//         // Use messageApi for consistency
//         messageApi.warning("Wrong credentials!");
//       }
//     } catch (err) {
//       messageApi.error(err?.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-[80vh] py-4 sm:py-6 bg-gray-100">
//       {context}
//       <div className="flex flex-col md:flex-row w-[95%] md:w-[80%] lg:w-[70%] rounded-xl shadow-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500">
//         <div className="hidden md:flex w-1/2 items-center justify-center p-6">
//           <img
//             src="/bank-img.png"
//             alt="Bank"
//             className="w-4/5 max-w-md object-contain drop-shadow-lg"
//           />
//         </div>
//         <div className="flex w-full md:w-1/2 items-center justify-center p-4 sm:p-6 bg-white">
//           <Card className="w-full max-w-sm sm:max-w-md shadow-none border-0">
//             <h2 className="text-xl sm:text-2xl font-semibold text-center text-blue-700 mb-3 sm:mb-4">
//               Bank Login
//             </h2>
//             <Form name="login" onFinish={onFinish} layout="vertical" className="space-y-2">
//               <Item name="email" label={<span className="text-sm sm:text-base">Username</span>} rules={[{ required: true }]}>
//                 <Input
//                   prefix={<UserOutlined />}
//                   placeholder="Enter your username"
//                   size="large"
//                   className="h-10 sm:h-12 text-sm sm:text-base"
//                 />
//               </Item>
//               <Item name="password" label={<span className="text-sm sm:text-base">Password</span>} rules={[{ required: true }]}>
//                 <Input.Password
//                   prefix={<LoginOutlined />}
//                   placeholder="Enter your password"
//                   size="large"
//                   className="h-10 sm:h-12 text-sm sm:text-base"
//                 />
//               </Item>
//               <Item>
//                 <Button
//                   type="text"
//                   htmlType="submit"
//                   block
//                   size="large"
//                   className="!bg-blue-500 !text-white !font-bold hover:!bg-blue-600 text-sm sm:text-base"
//                 >
//                   Login
//                 </Button>
//               </Item>
//               <div className="text-center mt-2">
//                 <Button
//                   type="link"
//                   className="!text-blue-500 hover:!text-blue-700 text-xs sm:text-sm"
//                   onClick={() => navigate("/forgot-password")}
//                 >
//                   Forgot Password?
//                 </Button>
//               </div>
//             </Form>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

