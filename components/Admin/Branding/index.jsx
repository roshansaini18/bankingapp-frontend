import { Button, Card, Form, Input, message } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { EditFilled } from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";
import { useState, useEffect } from "react";
const { Item } = Form;

const Branding = () => {
  const [bankForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();
  const [loading, setLoadig] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [brandings, setBrandings] = useState(null);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(false);

  // Get branding data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branding");
        bankForm.setFieldsValue(data?.data[0]);
        setBrandings(data?.data[0]);
        setEdit(true);
      } catch (err) {
        messageApi.error("Unable to fetch data!");
      }
    };
    fetcher();
  }, [no]);

  // Store bank details
  const onFinish = async (values) => {
    try {
      setLoadig(true);
      const finalObj = trimData(values);
      finalObj.xyz = photo ? photo : "bankImages/dummy.jpg";
      const userInfo = {
        email: finalObj.email,
        fullname: finalObj.fullname,
        password: finalObj.password,
        userType: "admin",
        isActive: true,
        profile: "bankImages/dummy.jpg",
      };

      const httpReq = http();
      await httpReq.post("/api/branding", finalObj);
      await httpReq.post("/api/users", userInfo);
      messageApi.success("Branding created successfully !");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to store branding !");
    } finally {
      setLoadig(false);
    }
  };

  // Update branding details
  const onUpdate = async (values) => {
    try {
      setLoadig(true);
      const finalObj = trimData(values);
      if (photo) {
        finalObj.bankLogo = photo;
      }
      const httpReq = http();
      await httpReq.put(`/api/branding/${brandings._id}`, finalObj);
      messageApi.success("Branding updated successfully !");
      bankForm.resetFields();
      setPhoto(null);
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to update branding !");
    } finally {
      setLoadig(false);
    }
  };

  // Handle file upload
  const handleUpload = async (e) => {
    try {
      let file = e?.target?.files?.[0];
      if (!file) {
        messageApi.error("Please choose a file to upload");
        return;
      }

      const formData = new FormData();
      formData.append("photo", file);

      const httpReq = http();
      const { data } = await httpReq.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhoto(data.filepath);
    } catch (err) {
      messageApi.error("Unable to upload");
    }
  };

  return (
    <Adminlayout>
      {context}
      <Card
        title="Bank Details"
        headStyle={{
          background: "linear-gradient(to right, #0a198b, #1e3a8a)", // blue gradient
          color: "#facc15", // yellow text
          fontWeight: "bold",
        }}
        extra={
          <Button
            onClick={() => {
              setEdit(!edit);
            }}
            style={{
              background: "linear-gradient(to right, #3b82f6, #2563eb)",
              color: "#fff",
            }}
            icon={<EditFilled />}
          />
        }
      >
        <Form
          form={bankForm}
          layout="vertical"
          onFinish={brandings ? onUpdate : onFinish}
          disabled={edit}
        >
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item
              label="Bank Name"
              name="bankName"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item
              label="Bank Tagline"
              name="bankTagline"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Bank Logo"
              name="xyz"
              rules={[{ required: brandings ? false : true }]}
            >
              <Input type="file" onChange={handleUpload} />
            </Item>
            <Item
              label="Bank Acount No"
              name="bankAccountNo"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item
              label="Bank Acount Transaction Id"
              name="bankTransactionId"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>
            <Item
              label="Bank Address"
              name="bankAddress"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            {/* Admin details only visible during first branding creation */}
            <div
              className={`${
                brandings
                  ? "hidden"
                  : "md:col-span-3 grid md:grid-cols-3 gap-x-3"
              }`}
            >
              <Item
                label="Admin Fullname"
                name="fullname"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>

              <Item
                label="Admin Email"
                name="email"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input />
              </Item>

              <Item
                label="Admin Password"
                name="password"
                rules={[{ required: brandings ? false : true }]}
              >
                <Input.Password />
              </Item>
            </div>

            <Item label="Bank Linkedin" name="bankLinkedIn">
              <Input type="url" />
            </Item>

            <Item label="Bank Twitter" name="bankTwitter">
              <Input type="url" />
            </Item>

            <Item label="Bank Facebook" name="bankFacebook">
              <Input type="url" />
            </Item>
          </div>

          <Item label="Bank description" name="bankDesc">
            <Input.TextArea />
          </Item>

          {brandings ? (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                style={{
                  background: "linear-gradient(to right, #f43f5e, #e11d48)", // red gradient
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Update
              </Button>
            </Item>
          ) : (
            <Item className="flex justify-end items-center">
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                style={{
                  background: "linear-gradient(to right, #3b82f6, #2563eb)", // blue gradient
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Submit
              </Button>
            </Item>
          )}
        </Form>
      </Card>
    </Adminlayout>
  );
};

export default Branding;
