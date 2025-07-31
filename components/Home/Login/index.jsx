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

        // Save token in cookie
        cookies.set("authToken", token, { path: "/", expires });

        // Save user info safely in localStorage
        if (user) {
          localStorage.setItem("userInfo", JSON.stringify(user));
        }

        // Redirect based on userType
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
<div className="flex items-center justify-center min-h-[80vh] py-6 bg-gray-100">
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
    <div className="flex w-full md:w-1/2 items-center justify-center p-6 bg-white">
      <Card className="w-[90%] md:max-w-sm shadow-none border-0">
        <h2 className="text-2xl font-semibold text-center text-blue-700 mb-4">
          Bank Login
        </h2>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Item name="email" label="Username" rules={[{ required: true }]}>
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your username"
              size="large"
            />
          </Item>
          <Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password
              prefix={<LoginOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Item>
          <Item>
            <Button
              type="text"
              htmlType="submit"
              block
              size="large"
              className="!bg-blue-500 !text-white !font-bold hover:!bg-blue-600"
            >
              Login
            </Button>
          </Item>

          {/* Forgot Password link */}
          <div className="text-center mt-2">
            <Button
              type="link"
              className="!text-blue-500 hover:!text-blue-700"
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
