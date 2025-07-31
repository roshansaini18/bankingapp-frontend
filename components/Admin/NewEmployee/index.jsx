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
import { useEffect, useState } from "react";
import useSWR from "swr";

const NewEmployee = () => {
  // state
  const [empForm] = Form.useForm();
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
    if (branches) {
      let filter =
        branches &&
        branches?.data.map((item) => ({
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
        setAllEmployee(data?.data.filter((item) => item.userType != "customer"));
        setFinalEmployee(data.data);
      } catch (err) {
        messageApi.error("Unable to fetch data!");
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
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        empForm.setFields([
          {
            name: "email",
            errors: ["Email already exists!"],
          },
        ]);
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
      setNo(no + 1);
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
      setNo(no + 1);
    } catch {
      messageApi.error("Unable to delete user!");
    }
  };

  // edit
  const onEditUser = async (obj) => {
    setEdit(obj);
    empForm.setFieldsValue(obj);
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
      setNo(no + 1);
      setEdit(null);
      setPhoto(null);
      empForm.resetFields();
    } catch {
      messageApi.error("Unable to update employee!");
    } finally {
      setLoading(false);
    }
  };

  // upload photo
  const handleUpload = async (e) => {
    let file = e.target.files[0];
    const folderName = "employeePhoto";
    try {
      const result = await uploadFile(file, folderName);
      setPhoto(result.filePath);
    } catch {
      messageApi.error("Unable to upload");
    }
  };

  // search
  const onSearch = (e) => {
    let val = e.target.value.toLowerCase();
    let filter =
      finalEmployee &&
      finalEmployee.filter((emp) => {
        if (
          emp?.email.toLowerCase().includes(val) ||
          emp?.mobile.toLowerCase().includes(val) ||
          emp?.userType.toLowerCase().includes(val) ||
          emp?.address.toLowerCase().includes(val) ||
          emp?.branch.toLowerCase().includes(val) ||
          emp?.fullname.toLowerCase().includes(val)
        ) {
          return emp;
        }
      });
    setAllEmployee(filter);
  };

  const headerStyle = {
    background: "linear-gradient(to right, #0a198b, #1e3a8a)",
    color: "#facc15",
    fontWeight: "bold",
  };

  // columns
  const columns = [
    {
      title: "Profile",
      key: "profile",
      render: (src, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`}
          className="rounded-full"
          width={32}
          height={32}
        />
      ),
    },
    {
      title: "User type",
      dataIndex: "userType",
      key: "userType",
      render: (text) => (
        <span
          className={`font-semibold ${
            text === "admin"
              ? "text-orange-500"
              : text === "employee"
              ? "text-green-500"
              : "text-blue-500"
          } text-xs sm:text-sm md:text-base`}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span>,
    },
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
      render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span>,
    },
    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span>,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (text) => <span className="text-xs sm:text-sm md:text-base">{text}</span>,
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <>
          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-1">
            <Popconfirm
              title="Toggle active?"
              onConfirm={() => updateIsActive(obj._id, obj.isActive)}
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

            <Popconfirm
              title="Edit Employee?"
              onConfirm={() => onEditUser(obj)}
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

            <Popconfirm
              title="Delete Employee?"
              onConfirm={() => onDeleteUser(obj._id)}
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

          {/* Mobile Dropdown */}
          <div className="flex md:hidden">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="toggle"
                    onClick={() => updateIsActive(obj._id, obj.isActive)}
                  >
                    {obj.isActive ? "Deactivate" : "Activate"}
                  </Menu.Item>
                  <Menu.Item key="edit" onClick={() => onEditUser(obj)}>
                    Edit
                  </Menu.Item>
                  <Menu.Item key="delete" danger onClick={() => onDeleteUser(obj._id)}>
                    Delete
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
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
      <h1 className="grid md:grid-cols-3 gap-1 sm:gap-3 px-0">
        {/* Add Employee */}
        <Card title="Add new employee" headStyle={headerStyle} className="text-xs sm:text-sm md:text-base p-2 sm:p-4">
          <Form form={empForm} onFinish={edit ? onUpdate : onFinish} layout="vertical">
            <Item name="branch" label="Select Branch" rules={[{ required: true }]}>
              <Select placeholder="Select Branch" options={allBranch} />
            </Item>

            <Item label="Profile" name="photo">
              <Input onChange={handleUpload} type="file" />
            </Item>
            <div className="grid md:grid-cols-2 gap-2">
              <Item name="fullname" label="Fullname" rules={[{ required: true }]}>
                <Input />
              </Item>

              <Item name="mobile" label="Mobile" rules={[{ required: true }]}>
                <Input type="number" />
              </Item>
              <Item name="email" label="Email" rules={[{ required: true }]}>
                <Input disabled={edit ? true : false} />
              </Item>

              <Item name="password" label="Password" rules={[{ required: true }]}>
                <Input disabled={edit ? true : false} />
              </Item>
            </div>
            <Item label="Address" name="address">
              <Input.TextArea />
            </Item>
            <Item>
              {edit ? (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-rose-500 !text-white !font-bold !w-full"
                >
                  Update
                </Button>
              ) : (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-blue-500 !text-white !font-bold !w-full"
                >
                  Submit
                </Button>
              )}
            </Item>
          </Form>
        </Card>

        {/* Employee List */}
        <Card
          className="md:col-span-2 text-xs sm:text-sm md:text-base p-2 sm:p-4"
          title="Employee list"
          headStyle={headerStyle}
          style={{ overflowX: "auto" }}
          extra={
            <div>
              <Input
                placeholder="Search by all"
                prefix={<SearchOutlined />}
                onChange={onSearch}
              />
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={allEmployee}
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </Card>
      </h1>
    </Adminlayout>
  );
};

export default NewEmployee;
