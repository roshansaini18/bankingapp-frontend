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
import dayjs from "dayjs"; // Import dayjs for date formatting

const { Item } = Form;

const baseUrl = "https://ik.imagekit.io/gr14ysun7";

const NewAccount = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [accountForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [no, setNo] = useState(0);
  const [allCustomer, setAllCustomer] = useState(null);
  const [finalCustomer, setFinalCustomer] = useState(null);
  const [edit, setEdit] = useState(null);

  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    if (brandings?.data?.[0]?.bankAccountNo) {
      const newAccountNo = Number(brandings.data[0].bankAccountNo) + 1;
      accountForm.setFieldValue("accountNo", newAccountNo);
    }
  }, [brandings, accountModal]); // Rerun when modal opens

  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        const filteredData = data?.data.filter((item) => item.branch === userInfo.branch) || [];
        setAllCustomer(filteredData);
        setFinalCustomer(filteredData);
      } catch (err) {
        messageApi.error("Unable to fetch data!");
      }
    };
    if (userInfo.branch) {
      fetcher();
    }
  }, [no, userInfo.branch]);

  // FIX: This is the corrected onFinish function
  const onFinish = async (values) => {
    const brandingId = brandings?.data?.[0]?._id;
    if (!brandingId) {
        messageApi.error("Branding info not available. Cannot create account.");
        return;
    }

    try {
      setLoading(true);
      messageApi.info("Uploading files, please wait...");

      let profilePath = photoFile ? (await uploadFile(photoFile, "customerPhoto")).filePath : "/customerPhoto/dummy.png";
      let signaturePath = signatureFile ? (await uploadFile(signatureFile, "customerSignature")).filePath : "/customerPhoto/dummy.png";
      let documentPath = documentFile ? (await uploadFile(documentFile, "customerDocument")).filePath : "/customerPhoto/dummy.png";
      
      messageApi.success("Files uploaded. Creating account...");

      let finalObj = trimData(values);
      
      // FIX: Format the date object from DatePicker into a string
      if (finalObj.dob) {
        finalObj.dob = dayjs(finalObj.dob).format("YYYY-MM-DD");
      }

      finalObj.profile = profilePath;
      finalObj.signature = signaturePath;
      finalObj.document = documentPath;
      finalObj.key = finalObj.email;
      finalObj.userType = "customer";
      finalObj.branch = userInfo?.branch;
      finalObj.createdBy = userInfo?.email;
      
      const httpReq = http();
      // This is the call that was failing
      const { data } = await httpReq.post(`/api/users`, finalObj);

      finalObj.customerLoginId = data?.data._id;
      const emailObj = {
        emailType: "new_credentials",
        to: finalObj.email,
        email: finalObj.email,
        password: finalObj.password,
      };

      await httpReq.post(`/api/customers`, finalObj);
      await httpReq.post(`/api/send-email`, emailObj);
      await httpReq.put(`/api/branding/${brandingId}`, { bankAccountNo: values.accountNo });
      
      onCloseModal();
      mutate("/api/branding");
      setNo((prev) => prev + 1);
      messageApi.success("Account created!");
    } catch (err) {
      console.error("Account creation failed:", err);
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([{ name: "email", errors: ["Email already exists!"] }]);
      } else {
        const errorMessage = err.response?.data?.message || "An error occurred. Please check console.";
        messageApi.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // All other functions (onUpdate, onDelete, etc.) remain the same...

  // ... (handlePhoto, handleSignature, etc.)
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
       setNo((prev) => prev + 1);
     } catch (err) {
       messageApi.error("Unable to update isActive!");
     }
   };
  const onSearch = (e) => {
    let val = e.target.value.toLowerCase();
    let filter =
      finalCustomer?.filter((customer) => {
        return Object.values(customer).some(item => 
            String(item).toLowerCase().includes(val)
        )
      });
    setAllCustomer(filter);
  };
  const onDeleteCustomer = async (id, customerLoginId) => {
     try {
       const httpReq = http();
       await httpReq.delete(`/api/customers/${id}`);
       await httpReq.delete(`/api/users/${customerLoginId}`);
       messageApi.success("Customer deleted successfully!");
       setNo((prev) => prev + 1);
     } catch (err) {
       messageApi.error("Unable to delete user!");
     }
   };
  const onEditCustomer = (obj) => {
     // Convert string date back to a dayjs object for the DatePicker
     const formData = {
         ...obj,
         dob: obj.dob ? dayjs(obj.dob) : null,
     };
     setEdit(obj);
     setAccountModal(true);
     accountForm.setFieldsValue(formData);
   };
   const onUpdate = async (values) => {
     try {
       setLoading(true);
       let finalObj = trimData(values);
       
       if (finalObj.dob) {
           finalObj.dob = dayjs(finalObj.dob).format('YYYY-MM-DD');
       }

       delete finalObj.password;
       delete finalObj.email;
       delete finalObj.accountNo;
       if (photoFile) {
         finalObj.profile = (await uploadFile(photoFile, "customerPhoto")).filePath;
       }
       if (signatureFile) {
         finalObj.signature = (await uploadFile(signatureFile, "customerSignature")).filePath;
       }
       if (documentFile) {
         finalObj.document = (await uploadFile(documentFile, "customerDocument")).filePath;
       }
       const httpReq = http();
       await httpReq.put(`/api/customers/${edit._id}`, finalObj);
       messageApi.success("Customer updated successfully!");
       setNo((prev) => prev + 1);
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

  const columns = [
      { title: "Photo", key: "photo", render: (_, obj) => <Image src={`${baseUrl}${obj?.profile}?tr=w-40,h-40`} className="rounded-full" width={40} height={40} preview={{ src: `${baseUrl}${obj?.profile}` }} /> },
      { title: "Signature", key: "signature", render: (_, obj) => <Image src={`${baseUrl}${obj?.signature}?tr=w-80,h-40`} width={80} height={40} preview={{ src: `${baseUrl}${obj?.signature}` }} /> },
      { title: "Document", key: "document", render: (_, obj) => <a href={`${baseUrl}${obj?.document}`} target="_blank" rel="noopener noreferrer"><Button type="text" shape="circle" className="!bg-blue-100 !text-blue-500" icon={<DownloadOutlined />} /></a> },
      { title: "Branch", dataIndex: "branch", key: "branch" },
      { title: "User type", dataIndex: "userType", key: "userType" },
      { title: "Account No", dataIndex: "accountNo", key: "accountNo" },
      { title: "Balance", dataIndex: "finalBalance", key: "finalBalance", render: (val) => `₹ ${Number(val).toLocaleString()}` },
      { title: "Fullname", dataIndex: "fullName", key: "fullName" },
      { title: "DOB", dataIndex: "dob", key: "dob", render: (val) => dayjs(val).format('DD-MMM-YYYY') },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Mobile", dataIndex: "mobile", key: "mobile" },
      { title: "Address", dataIndex: "address", key: "address" },
      { title: "Created By", dataIndex: "createdBy", key: "createdBy" },
      {
        title: "Action", key: "action", fixed: "right",
        render: (_, obj) => (
          <div className="flex gap-1">
            <Popconfirm title="Are you sure?" onConfirm={() => updateIsActive(obj._id, obj.isActive, obj.customerLoginId)}>
                <Button type="text" style={{ background: obj.isActive ? "linear-gradient(to right, #14b8a6, #0d9488)" : "#6b7280", color: "#fff" }} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
            </Popconfirm>
            <Popconfirm title="Are you sure?" onConfirm={() => onEditCustomer(obj)}>
                <Button type="text" style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)", color: "#fff" }} icon={<EditOutlined />} />
            </Popconfirm>
            <Popconfirm title="Are you sure?" onConfirm={() => onDeleteCustomer(obj._id, obj.customerLoginId)}>
                <Button type="text" style={{ background: "linear-gradient(to right, #f43f5e, #e11d48)", color: "#fff" }} icon={<DeleteOutlined />} />
            </Popconfirm>
          </div>
        ),
      },
    ];

  return (
    <div>
      {context}
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
      
      <Modal open={accountModal} onCancel={onCloseModal} width={820} footer={null} title={edit ? "Update details" : "Open New Account"}>
        <Form layout="vertical" onFinish={edit ? onUpdate : onFinish} form={accountForm}>
          {!edit && (
            <div className="grid md:grid-cols-3 gap-x-3">
              <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                <Input disabled placeholder="Account no" />
              </Item>
              <Item label="Email" name="email" rules={[{ required: !edit, type: 'email'}]}>
                <Input disabled={!!edit} placeholder="Enter your email" />
              </Item>
              <Item label="Password" name="password" rules={[{ required: !edit }]}>
                <Input placeholder="Enter password" />
              </Item>
            </div>
          )}
          <div className="grid md:grid-cols-3 gap-x-3">
            <Item label="Fullname" name="fullName" rules={[{ required: true }]}>
              <Input placeholder="Enter full name" />
            </Item>
            <Item label="Mobile" name="mobile" rules={[{ required: true }]}>
              <Input placeholder="Enter mobile no" />
            </Item>
            <Item label="Father Name" name="fatherName" rules={[{ required: true }]}>
              <Input placeholder="Enter father name" />
            </Item>
            {/* FIX: Use the correct Ant Design DatePicker component */}
            <Item label="DOB" name="dob" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Item>
            <Item label="Gender" name="gender" rules={[{ required: true }]}>
              <Select placeholder="Select Gender" options={[{ label: "Male", value: "male" }, { label: "Female", value: "female" }]} />
            </Item>
            <Item label="Currency" name="currency" rules={[{ required: true }]}>
              <Select placeholder="Select Currency" options={[{ label: "INR", value: "inr" }, { label: "USD", value: "usd" }]} />
            </Item>
            <Item label="Photo"><Input type="file" onChange={handlePhoto} /></Item>
            <Item label="Signature"><Input type="file" onChange={handleSignature} /></Item>
            <Item label="Document"><Input type="file" onChange={handleDocument} /></Item>
          </div>
          <Item label="Address" name="address" rules={[{ required: true }]}>
            <Input.TextArea />
          </Item>
          <Item className="flex justify-end items-center">
            <Button loading={loading} type="primary" htmlType="submit" style={{ width: "100%" }}>
              {edit ? "Update" : "Submit"}
            </Button>
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
