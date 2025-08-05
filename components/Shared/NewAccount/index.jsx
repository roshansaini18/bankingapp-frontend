import {
  Button,
  Card,
  message,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Image,
  Popconfirm,
  DatePicker, // FIX: Import DatePicker from antd
} from "antd";
import {
  SearchOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import {
  http,
  uploadFile,
  trimData,
  fetchData,
} from "../../../modules/modules";
import useSWR, { mutate } from "swr";

const { Item } = Form;

// Define the ImageKit base URL once
const baseUrl = "https://ik.imagekit.io/gr14ysun7";

const NewAccount = () => {
  //getInfo from localStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [accountForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  //states collections
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [no, setNo] = useState(0);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);

  //get branding details using SWR
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // FIX: Use an effect to safely set the account number ONLY when branding data is available
  useEffect(() => {
    // Check if the branding data and the specific field exist
    if (brandings?.data?.[0]?.bankAccountNo) {
      const newAccountNo = Number(brandings.data[0].bankAccountNo) + 1;
      accountForm.setFieldValue("accountNo", newAccountNo);
    }
  }, [brandings, accountForm]); // This effect runs when `brandings` data changes

  // get all customer data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        const filteredData =
          data?.data.filter((item) => item.branch === userInfo.branch) || [];
        setAllCustomer(filteredData);
        setFinalCustomer(filteredData);
      } catch (err) {
        // FIX: Add console.error to see the detailed error in the browser console
        console.error("Failed to fetch customer data:", err);
        messageApi.error("Unable to fetch data! Check console for details.");
      }
    };
    fetcher();
  }, [no, userInfo.branch]); // Add userInfo.branch to dependency array

  // create new account
  const onFinish = async (values) => {
    // Safely get brandingId inside the function
    const brandingId = brandings?.data?.[0]?._id;
    if (!brandingId) {
      messageApi.error("Branding information not found. Cannot proceed.");
      return;
    }

    try {
      setLoading(true);
      messageApi.info("Uploading files, please wait...");

      let profilePath = photoFile
        ? (await uploadFile(photoFile, "customerPhoto")).filePath
        : "/customerPhoto/dummy.png";

      let signaturePath = signatureFile
        ? (await uploadFile(signatureFile, "customerSignature")).filePath
        : "/customerPhoto/dummy.png";

      let documentPath = documentFile
        ? (await uploadFile(documentFile, "customerDocument")).filePath
        : "/customerPhoto/dummy.png";

      messageApi.success("Files uploaded. Creating account...");

      let finalObj = trimData(values);
      finalObj.profile = profilePath;
      finalObj.signature = signaturePath;
      finalObj.document = documentPath;
      finalObj.key = finalObj.email;
      finalObj.userType = "customer";
      finalObj.branch = userInfo?.branch;
      finalObj.createdBy = userInfo?.email;

      const httpReq = http();
      const { data } = await httpReq.post(`/api/users`, finalObj);
      finalObj.customerLoginId = data?.data._id;
      const emailObj = {
        email: finalObj.email,
        password: finalObj.password,
      };
      await httpReq.post(`/api/customers`, finalObj);
      await httpReq.post(`/api/send-email`, emailObj);
      await httpReq.put(`/api/branding/${brandingId}`, {
        bankAccountNo: values.accountNo,
      });

      onCloseModal();
      mutate("/api/branding");
      setNo((prevNo) => prevNo + 1);
      messageApi.success("Account created!");
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([
          { name: "email", errors: ["Email already exists!"] },
        ]);
      } else {
        console.error("Account creation failed:", err);
        messageApi.error("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = (e) => setPhotoFile(e.target.files[0]);
  const handleSignature = (e) => setSignatureFile(e.target.files[0]);
  const handleDocument = (e) => setDocumentFile(e.target.files[0]);

  const updateIsActive = async (id, isActive, customerLoginId) => {
    try {
      const obj = { isActive: !isActive };
      const httpReq = http();
      await httpReq.put(`/api/customers/${id}`, obj);
      await httpReq.put(`/api/users/${customerLoginId}`, obj);
      messageApi.success("Record updated successfully!");
      setNo((prevNo) => prevNo + 1);
    } catch (err) {
      messageApi.error("Unable to update isActive!");
    }
  };

  const onSearch = (e) => {
    const val = e.target.value.toLowerCase();
    if (!val) {
      setAllCustomer(finalCustomer); // Reset to full list if search is empty
      return;
    }
    const filter = finalCustomer?.filter((customer) =>
      Object.values(customer).some((field) =>
        String(field).toLowerCase().includes(val)
      )
    );
    setAllCustomer(filter);
  };

  const onDeleteCustomer = async (id, customerLoginId) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/customers/${id}`);
      await httpReq.delete(`/api/users/${customerLoginId}`);
      messageApi.success("Customer deleted successfully!");
      setNo((prevNo) => prevNo + 1);
    } catch (err) {
      messageApi.error("Unable to delete user!");
    }
  };

  const onEditCustomer = (obj) => {
    setEdit(obj);
    setAccountModal(true);
    accountForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      delete finalObj.email;
      delete finalObj.accountNo;

      if (photoFile) {
        messageApi.info("Uploading new photo...");
        finalObj.profile = (await uploadFile(photoFile, "customerPhoto")).filePath;
      }
      if (signatureFile) {
        messageApi.info("Uploading new signature...");
        finalObj.signature = (await uploadFile(signatureFile, "customerSignature")).filePath;
      }
      if (documentFile) {
        messageApi.info("Uploading new document...");
        finalObj.document = (await uploadFile(documentFile, "customerDocument")).filePath;
      }

      const httpReq = http();
      await httpReq.put(`/api/customers/${edit._id}`, finalObj);
      messageApi.success("Customer updated successfully!");
      setNo((prevNo) => prevNo + 1);
      onCloseModal();
    } catch (err) {
      messageApi.error("Unable to update customer!");
    } finally {
      setLoading(false);
    }
  };

  const onCloseModal = () => {
    setAccountModal(false);
    setEdit(null);
    setPhotoFile(null);
    setSignatureFile(null);
    setDocumentFile(null);
    accountForm.resetFields();
  };
  
  // Define columns array for the table
  const columns = [
    // ... your columns definitions here, they appear correct
    {
      title: "Photo",
      key: "photo",
      render: (_, obj) => <Image src={`${baseUrl}${obj?.profile}?tr=w-40,h-40`} className="rounded-full" width={40} height={40} preview={{ src: `${baseUrl}${obj?.profile}` }} />,
    },
    {
      title: "Signature",
      key: "signature",
      render: (_, obj) => <Image src={`${baseUrl}${obj?.signature}?tr=w-80,h-40`} width={80} height={40} preview={{ src: `${baseUrl}${obj?.signature}` }}/>,
    },
    {
      title: "Document",
      key: "document",
      render: (_, obj) => <a href={`${baseUrl}${obj?.document}`} target="_blank" rel="noopener noreferrer"><Button type="text" shape="circle" className="!bg-blue-100 !text-blue-500" icon={<DownloadOutlined />} /></a>,
    },
    { title: "Branch", dataIndex: "branch", key: "branch" },
    { title: "User type", dataIndex: "userType", key: "userType", render: (text) => <span style={{ color: text === "admin" ? "#f97316" : text === "employee" ? "#22c55e" : "#3b82f6", fontWeight: 600 }}>{text}</span> },
    { title: "Account No", dataIndex: "accountNo", key: "accountNo" },
    { title: "Balance", dataIndex: "finalBalance", key: "finalBalance" },
    { title: "Fullname", dataIndex: "fullName", key: "fullName" },
    { title: "DOB", dataIndex: "dob", key: "dob" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Address", dataIndex: "address", key: "address" },
    { title: "Created By", dataIndex: "createdBy", key: "craetedBy" },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm title="Are you sure?" description="Toggle active status." onConfirm={() => updateIsActive(obj._id, obj.isActive, obj.customerLoginId)}>
            <Button type="text" style={{ background: obj.isActive ? "linear-gradient(to right, #14b8a6, #0d9488)" : "#6b7280", color: "#fff" }} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}/>
          </Popconfirm>
          <Popconfirm title="Are you sure?" description="This will open the edit form." onConfirm={() => onEditCustomer(obj)}>
            <Button type="text" style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)", color: "#fff" }} icon={<EditOutlined />}/>
          </Popconfirm>
          <Popconfirm title="Are you sure?" description="This action cannot be undone!" onConfirm={() => onDeleteCustomer(obj._id, obj.customerLoginId)}>
            <Button type="text" style={{ background: "linear-gradient(to right, #f43f5e, #e11d48)", color: "#fff" }} icon={<DeleteOutlined />}/>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {context}
      <div className="grid">
        <Card
          title="Account list"
          headStyle={{ background: "linear-gradient(to right, #0a198b, #1e3a8a)", color: "#facc15", fontWeight: "bold" }}
          style={{ overflowX: "auto" }}
          extra={
            <div className="flex gap-x-3">
              <Input placeholder="Search..." prefix={<SearchOutlined />} onChange={onSearch} style={{ borderColor: "#0a198b" }} />
              <Button onClick={() => setAccountModal(true)} type="text" className="font-bold" style={{ background: "linear-gradient(to right, #0a198b, #1e3a8a)", color: "#fff" }}>
                Add new account
              </Button>
            </div>
          }
        >
          <Table columns={columns} dataSource={allCustomer} scroll={{ x: "max-content" }} rowKey="_id" />
        </Card>
      </div>
      <Modal open={accountModal} onCancel={onCloseModal} width={820} footer={null} title={edit ? "Update details" : "Open New Account"}>
        <Form layout="vertical" onFinish={edit ? onUpdate : onFinish} form={accountForm}>
          {!edit && (
            <div className="grid md:grid-cols-3 gap-x-3">
              <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                <Input disabled placeholder="Account no" style={{ borderColor: "#0a198b" }} />
              </Item>
              <Item label="Email" name="email" rules={[{ required: !edit, type: 'email' }]}>
                <Input disabled={!!edit} placeholder="Enter customer's email" style={{ borderColor: "#0a198b" }} />
              </Item>
              <Item label="Password" name="password" rules={[{ required: !edit }]}>
                <Input disabled={!!edit} placeholder="Enter password" style={{ borderColor: "#0a198b" }} />
              </Item>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item label="Fullname" name="fullName" rules={[{ required: true }]}>
              <Input placeholder="Enter full name" style={{ borderColor: "#0a198b" }} />
            </Item>
            <Item label="Mobile" name="mobile" rules={[{ required: true }]}>
              <Input placeholder="Enter mobile no" style={{ borderColor: "#0a198b" }} />
            </Item>
            <Item label="Father Name" name="fatherName" rules={[{ required: true }]}>
              <Input placeholder="Enter father name" style={{ borderColor: "#0a198b" }} />
            </Item>
            {/* FIX: Use Ant Design's DatePicker */}
            <Item label="DOB" name="dob" rules={[{ required: true }]}>
              <DatePicker style={{ width: "100%", borderColor: "#0a198b" }} />
            </Item>
            <Item label="Gender" name="gender" rules={[{ required: true }]}>
              <Select placeholder="Select Gender" options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]} />
            </Item>
            <Item label="Currency" name="currency" rules={[{ required: true }]}>
              <Select placeholder="Select Currency" options={[{ label: "INR", value: "inr" }, { label: "USD", value: "usd" }]} />
            </Item>
            {/* FIX: Removed meaningless name attributes */}
            <Item label="Photo">
              <Input type="file" onChange={handlePhoto} style={{ borderColor: "#0a198b" }} />
            </Item>
            <Item label="Signature">
              <Input type="file" onChange={handleSignature} style={{ borderColor: "#0a198b" }} />
            </Item>
            <Item label="Document">
              <Input type="file" onChange={handleDocument} style={{ borderColor: "#0a198b" }} />
            </Item>
          </div>
          <Item label="Address" name="address" rules={[{ required: true }]}>
            <Input.TextArea style={{ borderColor: "#0a198b" }} />
          </Item>
          <Item className="flex justify-end items-center">
            <Button loading={loading} type="text" htmlType="submit" style={{ background: edit ? "linear-gradient(to right, #be123c, #e11d48)" : "linear-gradient(to right, #0a198b, #1e3a8a)", color: "#fff", fontWeight: "bold", width: "100%" }}>
              {edit ? "Update" : "Submit"}
            </Button>
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
