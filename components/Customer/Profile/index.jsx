import {
  Card,
  Descriptions,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Button,
  Modal,
} from "antd";
import { UserOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import Customerlayout from "../../Layout/Customerlayout";
import { useEffect, useState } from "react";
import { http } from "../../../modules/modules";
import dayjs from "dayjs";

const { Title } = Typography;

// FIX: Define the ImageKit base URL once at the top
const imageKitBaseUrl = "https://ik.imagekit.io/gr14ysun7";

const Profile = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};
  const [customer, setCustomer] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Colors
  const canaraBlue = "#003f6b";
  const lightBlue = "#e6f0fa";
  const accent = "#0075c9";

  // Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Handle preview button click
  const handlePreview = (imagePath) => {
    if (!imagePath) {
      messageApi.error("No image available to preview");
      return;
    }
    // FIX: Use the ImageKit base URL
    setPreviewImage(`${imageKitBaseUrl}/${imagePath}`);
    setIsPreviewOpen(true);
  };

  // Handle print (passbook)
  const handlePrintPassbook = () => {
    window.print();
  };

  // Fetch customer details (Original data fetching logic)
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        const match = data?.data.find(
          (item) => item.accountNo === userInfo.accountNo
        );
        setCustomer(match);
      } catch (err) {
        messageApi.error("Unable to fetch customer data!");
      }
    };
    fetcher();
  }, []); // The empty dependency array means this runs only once on mount

  if (!customer) return <div>Loading...</div>;

  return (
    <Customerlayout>
      {contextHolder}
      <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; background: white !important; box-shadow: none !important; }
            .ant-layout-sider, .ant-layout-header, .no-print { display: none !important; }
            .print-area h3 { color: black !important; text-align: center; margin-bottom: 16px; }
          }
        `}</style>
      <div style={{ padding: 24 }}>
        <Card
          style={{
            background: lightBlue,
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          {/* PRINTABLE SECTION */}
          <div className="print-area">
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Title level={3} style={{ color: canaraBlue, marginBottom: 0 }}>
                  Customer Profile - S.O Bank
                </Title>
                <Divider />
              </Col>

              {/* Left section - Avatar & Meta Info */}
              <Col xs={24} md={8} style={{ textAlign: "center" }}>
                <Avatar
                  size={150}
                  // FIX: Use ImageKit URL with optimization for fast-loading thumbnails
                  src={`${imageKitBaseUrl}/${customer?.profile}?tr=w-150,h-150`}
                  icon={<UserOutlined />}
                  style={{
                    border: `4px solid ${accent}`,
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                />
                <div style={{ marginTop: 18, fontWeight: 600, color: canaraBlue }}>
                  {customer?.fullName.toUpperCase()}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>{customer?.email}</div>

                {/* Forgot Password Link */}
                <div style={{ marginTop: 8 }}>
                  <a
                    href="/forgot-password"
                    style={{
                      fontSize: 14,
                      color: accent,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Change Your Password
                  </a>
                </div>

                {/* Meta Info below profile */}
                <div style={{ marginTop: 20, fontSize: 12, color: "#444", backgroundColor: "#9ec2d2ff", padding: "10px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", textAlign: "left", display: "inline-block", marginBottom: "10px" }}>
                  <div><strong>User Type:</strong> {customer?.userType}</div>
                  <div><strong>Created By:</strong> {customer?.createdBy}</div>
                  <div><strong>Created At:</strong>{" "}{dayjs(customer?.createdAt).format("DD-MM-YYYY HH:mm")}</div>
                  <div><strong>Updated At:</strong>{" "}{dayjs(customer?.updatedAt).format("DD-MM-YYYY HH:mm")}</div>
                </div>
              </Col>

              {/* Right section - Details */}
              <Col xs={24} md={16}>
                <Descriptions title="Details" bordered column={1} labelStyle={{ fontWeight: "bold", color: canaraBlue }}>
                  <Descriptions.Item label="Account No">{customer?.accountNo}</Descriptions.Item>
                  <Descriptions.Item label="Branch">{customer?.branch}</Descriptions.Item>
                  <Descriptions.Item label="Final Balance">₹ {customer?.finalBalance}</Descriptions.Item>
                  <Descriptions.Item label="Mobile">{customer?.mobile}</Descriptions.Item>
                  <Descriptions.Item label="Father's Name">{customer?.fatherName}</Descriptions.Item>
                  <Descriptions.Item label="DOB">{dayjs(customer?.dob).format("DD-MM-YYYY")}</Descriptions.Item>
                  <Descriptions.Item label="Gender">{customer?.gender}</Descriptions.Item>
                  <Descriptions.Item label="Currency">{customer?.currency?.toUpperCase()}</Descriptions.Item>
                  <Descriptions.Item label="Address">{customer?.address}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Signature, Document & Passbook */}
          <Row gutter={16}>
            <Col xs={24} md={8} className="no-print">
              <Card title="Signature" bordered={false} style={{ textAlign: "center" }}>
                <Button icon={<EyeOutlined />} type="primary" style={{ backgroundColor: accent, borderColor: accent, fontWeight: "600" }} onClick={() => handlePreview(customer?.signature)}>
                  Preview Signature
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8} className="no-print">
              <Card title="Document" bordered={false} style={{ textAlign: "center" }}>
                <Button icon={<EyeOutlined />} type="primary" style={{ backgroundColor: accent, borderColor: accent, fontWeight: "600" }} onClick={() => handlePreview(customer?.document)}>
                  Preview Document
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={8} className="no-print">
              <Card title="Passbook" bordered={false} style={{ textAlign: "center" }}>
                <Button icon={<DownloadOutlined />} type="primary" style={{ backgroundColor: canaraBlue, borderColor: canaraBlue, fontWeight: "600" }} onClick={handlePrintPassbook}>
                  Print Passbook
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>

      {/* Modal for Preview */}
      <Modal open={isPreviewOpen} footer={null} onCancel={() => setIsPreviewOpen(false)} centered>
        <img
          src={previewImage}
          alt="Preview"
          style={{ width: "100%", borderRadius: 8, objectFit: "contain", maxHeight: "70vh" }}
        />
      </Modal>
    </Customerlayout>
  );
};

export default Profile;
