import {
  Button,
  Card,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Select,
  Table,
  Dropdown,
  Menu,
} from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  EllipsisOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { trimData, http, fetchData, uploadFile } from "../../../modules/modules";
const { Item } = Form;
import { useEffect, useState, useRef } from "react";
import useSWR from "swr";

// FIX: Define the ImageKit base URL once at the top
const imageKitBaseUrl = "https://ik.imagekit.io/gr14ysun7";

const NewEmployee = () => {
  // state
  const [empForm] = Form.useForm();
  const formCardRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [messageApi, context] = message.useMessage();
  const [finalEmployee, setFinalEmployee] = useState(null);
  const [allEmployee, setAllEmployee] = useState(null);
  const [allBranch, setAllBranch] = useState([]);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(null);

  // branches
  const { data: branches } = useSWR("/api/branch", fetchData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 1200000,
  });

  useEffect(() => {
    if (branches?.data) {
      let filter = branches.data.map((item) => ({
        label: item.branchName,
        value: item.branchName,
        key: item.key,
      }));
      setAllBranch(filter);
    }
  }, [branches]);

  // employees
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/users");
        const filteredEmployees = data?.data.filter(
          (item) => item.userType !== "customer"
        );
        setAllEmployee(filteredEmployees);
        setFinalEmployee(filteredEmployees); // Keep a master copy for searching
      } catch (err) {
        messageApi.error("Unable to fetch employee data!");
      }
    };
    fetcher();
  }, [no]);

  // create employee
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.profile = photo ? photo : "bankImages/dummy.jpg";
      finalObj.key = finalObj.email;
      finalObj.userType = "employee";
      const httpReq = http();
      await httpReq.post(`/api/users`, finalObj);
      await httpReq.post(`/api/send-email`, {
        email: finalObj.email,
        password: finalObj.password,
      });
      messageApi.success("Employee created");
      empForm.resetFields();
      setPhoto(null);
      setNo((prev) => prev + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        empForm.setFields([{ name: "email", errors: ["Email already exists!"] }]);
      } else {
        messageApi.error("Try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  // toggle active
  const updateIsActive = async (id, isActive) => {
    try {
      const obj = { isActive: !isActive };
      const httpReq = http();
      await httpReq.put(`/api/users/${id}`, obj);
      messageApi.success("Record updated successfully!");
      setNo((prev) => prev + 1);
    } catch {
      messageApi.error("Unable to update isActive!");
    }
  };

  // delete
  const onDeleteUser = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${id}`);
      messageApi.success("Employee deleted successfully!");
      setNo((prev) => prev + 1);
    } catch {
      messageApi.error("Unable to delete user!");
    }
  };

  const onEditUser = (obj) => {
    setEdit(obj);
    empForm.setFieldsValue(obj);
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onCancelEdit = () => {
    setEdit(null);
    empForm.resetFields();
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      if (photo) finalObj.profile = photo;
      const httpReq = http();
      await httpReq.put(`/api/users/${edit._id}`, finalObj);
      messageApi.success("Employee updated successfully!");
      setNo((prev) => prev + 1);
      onCancelEdit(); // Reset form after update
    } catch {
      messageApi.error("Unable to update employee!");
    } finally {
      setLoading(false);
    }
  };

  // upload photo
  const handleUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;
    const folderName = "employeePhoto";
    try {
      setLoading(true);
      messageApi.loading("Uploading photo...");
      const result = await uploadFile(file, folderName);
      setPhoto(result.filePath);
      messageApi.success("Photo uploaded!");
    } catch {
      messageApi.error("Unable to upload");
    } finally {
      setLoading(false);
    }
  };

  // search
  const onSearch = (e) => {
    const val = e.target.value.toLowerCase();
    if (!val) {
        setAllEmployee(finalEmployee);
        return;
    }
    const filter =
      finalEmployee?.filter((emp) => {
        return (
          emp?.email?.toLowerCase().includes(val) ||
          emp?.mobile?.toLowerCase().includes(val) ||
          emp?.userType?.toLowerCase().includes(val) ||
          emp?.address?.toLowerCase().includes(val) ||
          emp?.branch?.toLowerCase().includes(val) ||
          emp?.fullName?.toLowerCase().includes(val)
        );
      });
    setAllEmployee(filter);
  };

  const headerStyle = {
    background: "linear-gradient(to right, #0a198b, #1e3a8a)",
    color: "#facc15",
    fontWeight: "bold",
  };

  const columns = [
    {
      title: "Profile",
      key: "profile",
      render: (_, obj) => (
        <Image
          // FIX: Use ImageKit URL with optimization for fast-loading thumbnails
          src={`${imageKitBaseUrl}/${obj.profile}?tr=w-32,h-32`}
          // FIX: Add a preview prop to show the full-size image on click
          preview={{
            src: `${imageKitBaseUrl}/${obj.profile}`,
          }}
          className="rounded-full object-cover"
          width={32}
          height={32}
        />
      ),
    },
    { title: "User type", dataIndex: "userType", key: "userType", render: (text) => <span className={`font-semibold ${text === "admin" ? "text-orange-500" : "text-green-500"} text-xs sm:text-sm md:text-base`}>{text}</span> },
    { title: "Branch", dataIndex: "branch", key: "branch", render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span> },
    { title: "Fullname", dataIndex: "fullName", key: "fullName", render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span> },
    { title: "Email", dataIndex: "email", key: "email", render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span> },
    { title: "Mobile", dataIndex: "mobile", key: "mobile", render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span> },
    { title: "Address", dataIndex: "address", key: "address", render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span> },
    {
      title: "Action", key: "action", fixed: "right",
      render: (_, obj) => (
        <>
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-1">
            <Popconfirm title="Toggle active?" onConfirm={() => updateIsActive(obj._id, obj.isActive)}><Button type="text" style={{ background: obj.isActive ? "linear-gradient(to right, #14b8a6, #0d9488)" : "#6b7280", color: "#fff" }} icon={obj.isActive ? <EyeOutlined /> : <EyeInvisibleOutlined />} /></Popconfirm>
            <Popconfirm title="Edit Employee?" onConfirm={() => onEditUser(obj)}><Button type="text" style={{ background: "linear-gradient(to right, #3b82f6, #2563eb)", color: "#fff" }} icon={<EditOutlined />} /></Popconfirm>
            <Popconfirm title="Delete Employee?" onConfirm={() => onDeleteUser(obj._id)}><Button type="text" style={{ background: "linear-gradient(to right, #f43f5e, #e11d48)", color: "#fff" }} icon={<DeleteOutlined />} /></Popconfirm>
          </div>
          {/* Mobile Dropdown */}
          <div className="flex md:hidden">
            <Dropdown overlay={<Menu><Menu.Item key="toggle" onClick={() => updateIsActive(obj._id, obj.isActive)}>{obj.isActive ? "Deactivate" : "Activate"}</Menu.Item><Menu.Item key="edit" onClick={() => onEditUser(obj)}>Edit</Menu.Item><Menu.Item key="delete" danger onClick={() => onDeleteUser(obj._id)}>Delete</Menu.Item></Menu>} trigger={["click"]}>
              <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 20 }} />} />
            </Dropdown>
          </div>
        </>
      ),
    },
  ];

  return (
    <Adminlayout>
      {context}
      <div ref={formCardRef} className="grid md:grid-cols-3 gap-1 sm:gap-3 px-0">
        <Card
          title={edit ? "Edit Employee" : "Add New Employee"}
          headStyle={headerStyle}
          className="text-xs sm:text-sm md:text-base p-2 sm:p-4"
        >
          <Form form={empForm} onFinish={edit ? onUpdate : onFinish} layout="vertical" initialValues={{ branch: null, fullName: '', mobile: '', email: '', password: '', address: '' }}>
            <Item name="branch" label="Select Branch" rules={[{ required: true }]}>
              <Select placeholder="Select Branch" options={allBranch} />
            </Item>
            <Item label="Profile" name="photo">
              <Input onChange={handleUpload} type="file" />
            </Item>
            <div className="grid md:grid-cols-2 gap-2">
              <Item name="fullName" label="Fullname" rules={[{ required: true }]}>
                <Input placeholder="Enter full name" />
              </Item>
              <Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                <Input type="number" placeholder="Enter mobile number"/>
              </Item>
              <Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="Enter email" disabled={!!edit} />
              </Item>
              <Item name="password" label="Password" rules={[{ required: !edit }]}>
                <Input placeholder="Enter password" disabled={!!edit} />
              </Item>
            </div>
            <Item label="Address" name="address">
              <Input.TextArea placeholder="Enter full address"/>
            </Item>
            <Item>
              <div className="flex w-full gap-2">
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                  className="!font-bold !w-full"
                  style={{ background: edit ? "linear-gradient(to right, #f43f5e, #e11d48)" : "linear-gradient(to right, #3b82f6, #2563eb)" }}
                >
                  {edit ? "Update Employee" : "Submit"}
                </Button>
                {edit && (
                  <Button onClick={onCancelEdit} className="!w-full">
                    Cancel
                  </Button>
                )}
              </div>
            </Item>
          </Form>
        </Card>

        <Card
          className="md:col-span-2 text-xs sm:text-sm md:text-base p-2 sm:p-4"
          title="Employee list"
          headStyle={headerStyle}
          style={{ overflowX: "auto" }}
          extra={
            <div>
              <Input placeholder="Search..." prefix={<SearchOutlined />} onChange={onSearch} />
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={allEmployee}
            scroll={{ x: "max-content" }}
            pagination={false}
            rowKey="_id"
          />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default NewEmployee;
