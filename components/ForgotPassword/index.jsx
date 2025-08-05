import React, { useState } from "react";
import { Input, Button, Card, message } from "antd";
import { http } from "../../modules/modules";
import { useNavigate } from "react-router-dom";
import logo from "../../src/assets/main.logo.png";

const canaraBlue = "#003f6b";
const lightBlue = "#e6f0fa";
const accent = "#0075c9";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP, 3: Reset Pwd, 4: Done
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // Step 1: Send OTP to email
  const handleSendOtp = async () => {
    if (!email) {
      return messageApi.error("Please enter your email address!");
    }
    try {
      setLoading(true);
      const httpReq = http();
      await httpReq.post("/api/auth/forgot-password", { email });
      messageApi.success("If a user with this email exists, an OTP has been sent.");
      setStep(2);
    } catch (err) {
      // FIX: Show a more specific error from the server if available
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please try again.";
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async () => {
    if (!otp) {
        return messageApi.error("Please enter the OTP.");
    }
    try {
      setLoading(true);
      const httpReq = http();
      const res = await httpReq.post("/api/auth/verify-otp", { email, otp });
      if (res.data.success) {
        messageApi.success("OTP verified successfully!");
        setStep(3);
      } else {
        messageApi.error(res.data.message || "Incorrect OTP");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error verifying OTP.";
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return messageApi.error("Please fill in both password fields.");
    }
    if (newPassword.length < 6) {
        return messageApi.error("Password must be at least 6 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return messageApi.error("Passwords do not match!");
    }
    try {
      setLoading(true);
      const httpReq = http();
      await httpReq.post("/api/auth/reset-password", {
        email,
        otp,
        password: newPassword,
      });
      messageApi.success("Password reset successful!");
      setStep(4);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error resetting password.";
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${canaraBlue}, ${accent})`, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px" }}>
      <img src={logo} alt="S.O Bank Logo" style={{ width: "90px", height: "90px", objectFit: "contain", marginBottom: "15px", background: "#fff", borderRadius: "50%", padding: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }} />
      <h1 style={{ color: "#fff", fontSize: "2rem", fontWeight: "bold", marginBottom: "20px", textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}>
        S.O Bank
      </h1>
      {contextHolder}
      <Card style={{ maxWidth: 400, width: "100%", background: lightBlue, borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", padding: "20px" }} title={<h2 style={{ textAlign: "center", color: canaraBlue }}>Forgot Password</h2>}>
        {step === 1 && (
          <>
            <p style={{marginBottom: 12, color: canaraBlue}}>Enter your email to receive a verification code.</p>
            {/* FIX: Added type="email" and onPressEnter */}
            <Input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} onPressEnter={handleSendOtp} style={{ marginBottom: 12, background: "#fff", borderRadius: "6px" }} />
            <Button type="primary" block onClick={handleSendOtp} loading={loading} style={{ background: accent, border: "none", fontWeight: "bold" }}>
              Send OTP
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <p style={{marginBottom: 12, color: canaraBlue}}>An OTP has been sent to <strong>{email}</strong>.</p>
            {/* FIX: Added onPressEnter */}
            <Input placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} onPressEnter={handleOtpSubmit} style={{ marginTop: 12, marginBottom: 12, background: "#fff", borderRadius: "6px" }} />
            <Button type="primary" block onClick={handleOtpSubmit} loading={loading} style={{ background: accent, border: "none", fontWeight: "bold" }}>
              Submit OTP
            </Button>
          </>
        )}
        {step === 3 && (
          <>
             <p style={{marginBottom: 12, color: canaraBlue}}>OTP verified. Please enter your new password.</p>
            <Input.Password placeholder="Enter New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginTop: 12, marginBottom: 12, background: "#fff", borderRadius: "6px" }} />
            {/* FIX: Added onPressEnter */}
            <Input.Password placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onPressEnter={handleResetPassword} style={{ marginBottom: 12, background: "#fff", borderRadius: "6px" }} />
            <Button type="primary" block onClick={handleResetPassword} loading={loading} style={{ background: accent, border: "none", fontWeight: "bold" }}>
              Reset Password
            </Button>
          </>
        )}
        {step === 4 && (
            <>
             <p style={{marginBottom: 12, textAlign: 'center', color: canaraBlue, fontWeight: 'bold' }}>Your password has been reset successfully!</p>
            <Button type="primary" block onClick={() => navigate("/")} style={{ background: accent, border: "none", fontWeight: "bold", marginTop: "12px" }}>
                Go to Login
            </Button>
            </>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword;
