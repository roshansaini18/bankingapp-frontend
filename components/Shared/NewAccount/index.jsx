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
  //getInfo from sessionStorage
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [accountForm] = Form.useForm();
  const [messageApi, context] = message.useMessage();

  //states collections
  const [accountModal, setAccountModal] = useState(false);
  const [loading, setLoading] = useState(false);
  // These states will now store the raw File object until submission
  const [photoFile, setPhotoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [no, setNo] = useState(0);
  const [allCustomer, setAllCustome] = useState(null);
  const [finalCustomer, setFinalCustome] = useState(null);
  const [edit, setEdit] = useState(null);

  //get branding details
  const { data: brandings } = useSWR("/api/branding", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  // get all customer data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/customers");
        setAllCustome(
          data?.data.filter((item) => item.branch == userInfo.branch)
        );
        setFinalCustome(
          data?.data.filter((item) => item.branch == userInfo.branch)
        );
      } catch (err) {
        messageApi.error("Unable to fetch data!");
      }
    };
    fetcher();
  }, [no]);

  let bankAccountNo = Number(brandings?.data[0]?.bankAccountNo) + 1;
  let brandingId = brandings && brandings?.data[0]?._id;
  accountForm.setFieldValue("accountNo", bankAccountNo);

  // cretae new account
  const onFinish = async (values) => {
    try {
      setLoading(true);
      messageApi.info("Uploading files, please wait...");

      // Upload files if they exist
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
      const obj = {
        email: finalObj.email,
        password: finalObj.password,
      };
      await httpReq.post(`/api/customers`, finalObj);
      await httpReq.post(`/api/send-email`, obj);
      await httpReq.put(`/api/branding/${brandingId}`, { bankAccountNo });
      
      onCloseModal(); // Use the close modal function to reset everything
      mutate("/api/branding");
      setNo(no + 1);
      messageApi.success("Account created !");
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        accountForm.setFields([
          {
            name: "email",
            errors: ["Email already exists!"],
          },
        ]);
      } else {
        messageApi.error("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Store the selected file object in state
  const handlePhoto = (e) => {
    setPhotoFile(e.target.files[0]);
  };

  const handleSignature = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  const handleDocument = (e) => {
    setDocumentFile(e.target.files[0]);
  };

  // update isActive
  const updateIsActive = async (id, isActive, customerLoginId) => {
    try {
      const obj = {
        isActive: !isActive,
      };
      const httpReq = http();
      await httpReq.put(`/api/customers/${id}`, obj);
      await httpReq.put(`/api/users/${customerLoginId}`, obj);
      messageApi.success("Record updated successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to update isActive !");
    }
  };

  //search codding
  const onSearch = (e) => {
    let val = e.target.value.toLowerCase();
    let filter =
      finalCustomer &&
      finalCustomer.filter((customer) => {
        if (customer?.fullName.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (customer?.userType.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (customer?.email.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (customer?.mobile.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (customer?.address.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (customer?.branch.toLowerCase().indexOf(val) != -1) {
          return customer;
        } else if (
          customer?.accountNo.toString().toLowerCase().indexOf(val) != -1
        ) {
          return customer;
        }
      });
    setAllCustome(filter);
  };

  //delete employee
  const onDeleteCustomer = async (id, customerLoginId) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/customers/${id}`);
      await httpReq.delete(`/api/users/${customerLoginId}`);
      messageApi.success("Customer deleted successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete user !");
    }
  };

  //update employee
  const onEditCustomer = async (obj) => {
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
      messageApi.success("Employee updated successfully !");
      setNo(no + 1);
      onCloseModal(); // Use the close modal function to reset everything
    } catch (err) {
      messageApi.error("Unable to update customer !");
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
    {
      title: "Photo",
      key: "photo",
      render: (_, obj) => (
        <Image
          // Construct the full URL using the baseUrl and the stored filePath
          src={`${baseUrl}${obj?.profile}?tr=w-40,h-40`}
          className="rounded-full"
          width={40}
          height={40}
          preview={{
            src: `${baseUrl}${obj?.profile}`, // Preview shows the full-resolution image
          }}
        />
      ),
    },
    {
      title: "Signature",
      key: "signature",
      render: (_, obj) => (
        <Image
          // Construct the full URL and append transformations
          src={`${baseUrl}${obj?.signature}?tr=w-80,h-40`}
          width={80}
          height={40}
          preview={{
            src: `${baseUrl}${obj?.signature}`,
          }}
        />
      ),
    },
    {
      title: "Document",
      key: "document",
      render: (_, obj) => (
        <a href={`${baseUrl}${obj?.document}`} target="_blank" rel="noopener noreferrer">
          <Button
            type="text"
            shape="circle"
            className="!bg-blue-100 !text-blue-500"
            icon={<DownloadOutlined />}
          ></Button>
        </a>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "User type",
      dataIndex: "userType",
      key: "userType",
      render: (text) => {
        if (text === "admin") {
          return <span style={{ color: "#f97316", fontWeight: 600 }}>{text}</span>;
        } else if (text === "employee") {
          return <span style={{ color: "#22c55e", fontWeight: 600 }}>{text}</span>;
        } else {
          return <span style={{ color: "#3b82f6", fontWeight: 600 }}>{text}</span>;
        }
      },
    },
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
    },
    {
      title: "Balance",
      dataIndex: "finalBalance",
      key: "finalBalance",
    },
    {
      title: "Fullname",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "DOB",
      dataIndex: "dob",
      key: "dob",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "craetedBy",
    },

    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          {/* Active / Inactive */}
          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update!"
            onCancel={() => messageApi.info("No changes occur !")}
            onConfirm={() =>
              updateIsActive(obj._id, obj.isActive, obj.customerLoginId)
            }
          >
            <Button
              type="text"
              style={{
                background: obj.isActive
                  ? "linear-gradient(to right, #14b8a6, #0d9488)"
                  : "#6b7280",
                color: "#fff",
              }}
              icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            />
          </Popconfirm>

          {/* Edit */}
          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update!"
            onCancel={() => messageApi.info("No changes occur !")}
            onConfirm={() => onEditCustomer(obj)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
                color: "#fff",
              }}
              icon={<EditOutlined />}
            />
          </Popconfirm>

          {/* Delete */}
          <Popconfirm
            title="Are you sure ?"
            description="Once you delete, you cannot restore!"
            onCancel={() => messageApi.info("Your data is safe!")}
            onConfirm={() => onDeleteCustomer(obj._id, obj.customerLoginId)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #f43f5e, #e11d48)",
                color: "#fff",
              }}
              icon={<DeleteOutlined />}
            />
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
          headStyle={{
            background: "linear-gradient(to right, #0a198b, #1e3a8a)",
            color: "#facc15",
            fontWeight: "bold",
          }}
          style={{ overflowX: "auto" }}
          extra={
            <div className="flex gap-x-3">
              <Input
                placeholder="Search by all"
                prefix={<SearchOutlined />}
                onChange={onSearch}
                style={{
                  borderColor: "#0a198b",
                }}
              />
              <Button
                onClick={() => setAccountModal(true)}
                type="text"
                className="font-bold"
                style={{
                  background: "linear-gradient(to right, #0a198b, #1e3a8a)",
                  color: "#fff",
                }}
              >
                Add new account
              </Button>
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={allCustomer}
            scroll={{ x: "max-content" }}
          ></Table>
        </Card>
      </div>
      <Modal
        open={accountModal}
        onCancel={onCloseModal}
        width={820}
        footer={null}
        title={edit ? " Update details" : "Open New Account"}
      >
        <Form
          layout="vertical"
          onFinish={edit ? onUpdate : onFinish}
          form={accountForm}
        >
          {!edit && (
            <div className="grid md:grid-cols-3 gap-x-3">
              <Item label="Account No" name="accountNo" rules={[{ required: true }]}>
                <Input disabled placeholder="Account no" style={{ borderColor: "#0a198b" }} />
              </Item>
              <Item label="Email" name="email" rules={[{ required: edit ? false : true }]}>
                <Input
                  disabled={edit ? true : false}
                  placeholder="Enter your email"
                  style={{ borderColor: "#0a198b" }}
                />
              </Item>

              <Item label="Password" name="password" rules={[{ required: edit ? false : true }]}>
                <Input
                  disabled={edit ? true : false}
                  placeholder="Enter password"
                  style={{ borderColor: "#0a198b" }}
                />
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

            <Item label="DOB" name="dob" rules={[{ required: true }]}>
              <input type="date" className="border p-1 rounded" style={{ borderColor: "#0a198b" }} />
            </Item>

            <Item label="Gender" name="gender" rules={[{ required: true }]}>
              <Select
                placeholder="Select Gender"
                options={[
                  { label: "Male", value: "male" },
                  { label: "Female", value: "female" },
                ]}
                style={{ borderColor: "#0a198b" }}
              />
            </Item>

            <Item label="Currency" name="currency" rules={[{ required: true }]}>
              <Select
                placeholder="Select Currency"
                options={[
                  { label: "INR", value: "inr" },
                  { label: "USD", value: "usd" },
                ]}
                style={{ borderColor: "#0a198b" }}
              />
            </Item>

            <Item label="Photo" name="xyz">
              <Input type="file" onChange={handlePhoto} style={{ borderColor: "#0a198b" }} />
            </Item>

            <Item label="Signature" name="fghdfg">
              <Input type="file" onChange={handleSignature} style={{ borderColor: "#0a198b" }} />
            </Item>

            <Item label="Document" name="dgdfsgg">
              <Input type="file" onChange={handleDocument} style={{ borderColor: "#0a198b" }} />
            </Item>
          </div>

          <Item label="Address" name="address" rules={[{ required: true }]}>
            <Input.TextArea style={{ borderColor: "#0a198b" }} />
          </Item>

          <Item className="flex justify-end items-center">
            {edit ? (
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                style={{
                  background: "linear-gradient(to right, #be123c, #e11d48)",
                  color: "#fff",
                  fontWeight: "bold",
                  width: "100%",
                }}
              >
                Update
              </Button>
            ) : (
              <Button
                loading={loading}
                type="text"
                htmlType="submit"
                style={{
                  background: "linear-gradient(to right, #0a198b, #1e3a8a)",
                  color: "#fff",
                  fontWeight: "bold",
                  width: "100%",
                }}
              >
                Submit
              </Button>
            )}
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NewAccount;
