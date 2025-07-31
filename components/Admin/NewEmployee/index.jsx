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
} from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import {
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { trimData, http, fetchData, uploadFile } from "../../../modules/modules";
const { Item } = Form;
import { useEffect, useState } from "react";
import useSWR from "swr";

const NewEmployee = () => {
  //state collection
  const [empForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [messageApi, context] = message.useMessage();
  const [finalEmployee, setFinalEmployee] = useState(null);
  const [allEmployee, setAllEmployee] = useState(null);
  const [allBranch, setAllBranch] = useState([]);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(null);

  // get branch data
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

  // get all employee data
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

  // create new employee
  const onFinish = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      finalObj.profile = photo ? photo : "bankImages/dummy.jpg";
      finalObj.key = finalObj.email;
      finalObj.userType = "employee";
      const httpReq = http();
      const { data } = await httpReq.post(`/api/users`, finalObj);
      const obj = {
        email: finalObj.email,
        password: finalObj.password,
      };
      await httpReq.post(`/api/send-email`, obj);
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

  // update isActive
  const updateIsActive = async (id, isActive) => {
    try {
      const obj = {
        isActive: !isActive,
      };
      const httpReq = http();
      await httpReq.put(`/api/users/${id}`, obj);
      messageApi.success("Record updated successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to update isActive !");
    }
  };

  //delete employee
  const onDeleteUser = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/users/${id}`);
      messageApi.success("Employee deleted successfully !");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete user !");
    }
  };

  //update employee
  const onEditUser = async (obj) => {
    setEdit(obj);
    empForm.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoading(true);
      let finalObj = trimData(values);
      delete finalObj.password;
      if (photo) {
        finalObj.profile = photo;
      }
      const httpReq = http();
      await httpReq.put(`/api/users/${edit._id}`, finalObj);
      messageApi.success("Employee updated successfully !");
      setNo(no + 1);
      setEdit(null);
      setPhoto(null);
      empForm.resetFields();
    } catch (err) {
      messageApi.error("Unable to update employee !");
    } finally {
      setLoading(false);
    }
  };

  //handle upload
  const handleUpload = async (e) => {
    let file = e.target.files[0];
    const folderName = "employeePhoto";
    try {
      const result = await uploadFile(file, folderName);
      setPhoto(result.filePath);
    } catch (err) {
      messageApi.error("Unable to upload");
    }
  };

  //search
  const onSearch = (e) => {
    let val = e.target.value.toLowerCase();
    let filter =
      finalEmployee &&
      finalEmployee.filter((emp) => {
        if (emp?.email.toLowerCase().indexOf(val) != -1) {
          return emp;
        } else if (emp?.mobile.toLowerCase().indexOf(val) != -1) {
          return emp;
        } else if (emp?.userType.toLowerCase().indexOf(val) != -1) {
          return emp;
        } else if (emp?.address.toLowerCase().indexOf(val) != -1) {
          return emp;
        } else if (emp?.branch.toLowerCase().indexOf(val) != -1) {
          return emp;
        } else if (emp?.fullname.toLowerCase().indexOf(val) != -1) {
          return emp;
        }
      });
    setAllEmployee(filter);
  };



  const headerStyle = {
  background: "linear-gradient(to right, #0a198b, #1e3a8a)", // Blue gradient
  color: "#facc15", // Yellow text
  fontWeight: "bold",
};


  // columns for table
  const columns = [
    {
      title: "Profile",
      key: "profile",
      render: (src, obj) => (
        <Image
          src={`${import.meta.env.VITE_BASEURL}/${obj.profile}`}
          className="rounded-full"
          width={40}
          height={40}
        />
      ),
    },
    {
      title: "User type",
      dataIndex: "userType",
      key: "userType",
      render: (text) => {
        if (text == "admin") {
          return <span style={{ color: "#f97316", fontWeight: 600 }}>{text}</span>;
        } else if (text == "employee") {
          return <span style={{ color: "#22c55e", fontWeight: 600 }}>{text}</span>;
        } else {
          return <span style={{ color: "#3b82f6", fontWeight: 600 }}>{text}</span>;
        }
      },
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
    },
    {
      title: "Fullname",
      dataIndex: "fullname",
      key: "fullname",
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
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update !"
            onCancel={() => messageApi.info("No changes occur !")}
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
            ></Button>
          </Popconfirm>

          <Popconfirm
            title="Are you sure ?"
            description="Once you update, you can also re-update !"
            onCancel={() => messageApi.info("No changes occur !")}
            onConfirm={() => onEditUser(obj)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
                color: "#fff",
              }}
              icon={<EditOutlined />}
            ></Button>
          </Popconfirm>

          <Popconfirm
            title="Are you sure ?"
            description="Once you deleted, you cannot re-store !"
            onCancel={() => messageApi.info("your data is safe !")}
            onConfirm={() => onDeleteUser(obj._id)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #f43f5e, #e11d48)",
                color: "#fff",
              }}
              icon={<DeleteOutlined />}
            ></Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Adminlayout>
      {context}
      <h1 className="grid md:grid-cols-3 gap-3">
      <Card title="Add new employee" headStyle={headerStyle}>
          <Form
            form={empForm}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item name="branch" label="Select Branch" rules={[{ required: true }]}>
              <Select placeholder="Select Branch" options={allBranch}></Select>
            </Item>

            <Item label="Profile" name="photo">
              <Input onChange={handleUpload} type="file" />
            </Item>
            <div className="grid md:grid-cols-2 gap-x-2">
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

        <Card
  className="md:col-span-2"
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
  />
</Card>
      </h1>
    </Adminlayout>
  );
};

export default NewEmployee;
