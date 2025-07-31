import React, { useEffect, useState } from "react";
import { Input, Button, Card, message } from "antd";
import { http } from "../../modules/modules";
import { useNavigate } from "react-router-dom";
import logo from "../../src/assets/main.logo.png";


const canaraBlue = "#003f6b";
const lightBlue = "#e6f0fa";
const accent = "#0075c9";

const ForgotPassword = () => {
  const [usersList, setUsersList] = useState([]);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const httpReq = http();
        const res = await httpReq.get("/api/users");
        setUsersList(res.data?.data || []);
      } catch (err) {}
    };
    fetchUsers();
  }, []);

  // Step 1: Verify user and send OTP
  const handleVerify = async () => {
    if (!userName || !email) {
      messageApi.error("Please enter both name and email!");
      return;
    }

    messageApi.info("Checking user details...");
    const found = usersList.find(
      (item) =>
        item.fullName?.toLowerCase().trim() === userName.toLowerCase().trim() &&
        item.email?.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!found) {
      messageApi.error("User not found!");
      return;
    }

    setUser(found);

    try {
      setLoading(true);
      const httpReq = http();
      await httpReq.post("/api/auth/send-otp", { email });
      messageApi.success("OTP has been sent to your email!");
    } catch (err) {
      messageApi.error("Failed to send OTP to your email!");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async () => {
    try {
      setLoading(true);
      const httpReq = http();
      const res = await httpReq.post("/api/auth/verify-otp", { email, otp });

      if (res.data.success) {
        messageApi.success("OTP verified successfully!");
        setOtpVerified(true);
      } else {
        messageApi.error(res.data.message || "Incorrect OTP");
      }
    } catch (err) {
      messageApi.error("Error verifying OTP with server.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      messageApi.error("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      messageApi.error("Passwords do not match!");
      return;
    }

    try {
      setLoading(true);
      const httpReq = http();

      await httpReq.put(`/api/users/${user._id}`, {
        password: newPassword,
      });

      messageApi.success("Password reset successful!");
      setResetDone(true);
    } catch (err) {
      messageApi.error("Error resetting password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
  style={{
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${canaraBlue}, ${accent})`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  }}
>
  {/* Logo */}
   <img
        src={logo}
        alt="S.O Bank Logo"
        style={{
          width: "90px",
          height: "90px",
          objectFit: "contain",
          marginBottom: "15px",
          background: "#fff",
          borderRadius: "50%", // fully rounded logo
          padding: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      />

  {/* Bank Name */}
  <h1
    style={{
      color: "#fff",
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "20px",
      textShadow: "1px 1px 4px rgba(0,0,0,0.3)",
    }}
  >
    S.O Bank
  </h1>

  {contextHolder}

  <Card
    style={{
      maxWidth: 400,
      width: "100%",
      background: lightBlue,
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      padding: "20px",
    }}
    title={
      <h2 style={{ textAlign: "center", color: canaraBlue }}>
        Forgot Password
      </h2>
    }
  >
        {/* Step 1: Verify User */}
        {!user && !resetDone && (
          <>
            <Input
              placeholder="Enter Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{
                marginBottom: 12,
                background: "#fff",
                borderRadius: "6px",
              }}
            />
            <Input
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                marginBottom: 12,
                background: "#fff",
                borderRadius: "6px",
              }}
            />
            <Button
              type="primary"
              block
              onClick={handleVerify}
              loading={loading}
              style={{
                background: accent,
                border: "none",
                fontWeight: "bold",
              }}
            >
              Verify
            </Button>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {user && !otpVerified && !resetDone && (
          <>
            <Input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{
                marginTop: 12,
                marginBottom: 12,
                background: "#fff",
                borderRadius: "6px",
              }}
            />
            <Button
              type="primary"
              block
              onClick={handleOtpSubmit}
              loading={loading}
              style={{
                background: accent,
                border: "none",
                fontWeight: "bold",
              }}
            >
              Submit OTP
            </Button>
          </>
        )}

        {/* Step 3: Reset Password */}
        {otpVerified && !resetDone && (
          <>
            <Input.Password
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                marginTop: 12,
                marginBottom: 12,
                background: "#fff",
                borderRadius: "6px",
              }}
            />
            <Input.Password
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                marginBottom: 12,
                background: "#fff",
                borderRadius: "6px",
              }}
            />
            <Button
              type="primary"
              block
              onClick={handleResetPassword}
              loading={loading}
              style={{
                background: accent,
                border: "none",
                fontWeight: "bold",
              }}
            >
              Reset Password
            </Button>
          </>
        )}

        {/* Show Login button after reset */}
        {resetDone && (
          <Button
            type="primary"
            block
            onClick={() => navigate("/")}
            style={{
              background: accent,
              border: "none",
              fontWeight: "bold",
              marginTop: "12px",
            }}
          >
            Go to Login
          </Button>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
