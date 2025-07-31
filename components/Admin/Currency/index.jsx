import {
  Button,
  Card,
  Form,
  Input,
  message,
  Popconfirm,
  Table,
  Dropdown,
  Menu,
} from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { DeleteOutlined, EditOutlined, EllipsisOutlined } from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";
const { Item } = Form;
import { useEffect, useState } from "react";
import { useTheme } from "../../Layout/Theme/ThemeContext";

const Currency = () => {
  // state
  const [currencyFORM] = Form.useForm();
  const [loading, setLoadig] = useState(false);
  const [messageApi, context] = message.useMessage();
  const [allCurrency, setAllCurrency] = useState([]);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(null);

  // Theme
  const { darkMode } = useTheme();
  const theme = {
    background: darkMode ? "#141414" : "#fff",
    text: darkMode ? "#fff" : "#000",
    cardBg: darkMode ? "#1f1f1f" : "#fff",
    border: darkMode ? "1px solid #303030" : "1px solid #f0f0f0",
  };

  // fetch data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/currency");
        setAllCurrency(data.data);
      } catch (err) {
        messageApi.error("Unable to fetch data!");
      }
    };
    fetcher();
  }, [no]);

  // create currency
  const onFinish = async (values) => {
    try {
      setLoadig(true);
      let finalObj = trimData(values);
      finalObj.key = finalObj.currencyName;
      const httpReq = http();
      await httpReq.post(`/api/currency`, finalObj);
      messageApi.success("Currency created");
      currencyFORM.resetFields();
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        currencyFORM.setFields([
          {
            name: "currencyName",
            errors: ["Currency already exists!"],
          },
        ]);
      } else {
        messageApi.error("Try again later");
      }
    } finally {
      setLoadig(false);
    }
  };

  // edit currency
  const onEditCurrency = async (obj) => {
    setEdit(obj);
    currencyFORM.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoadig(false);
      let finalObj = trimData(values);
      const httpReq = http();
      await httpReq.put(`/api/currency/${edit._id}`, finalObj);
      messageApi.success("Currency updated successfully!");
      setNo(no + 1);
      setEdit(null);
      currencyFORM.resetFields();
    } catch (err) {
      messageApi.error("Unable to update currency!");
    } finally {
      setLoadig(false);
    }
  };

  // delete
  const onDeleteCurrency = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/currency/${id}`);
      messageApi.success("Currency deleted successfully!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete currency!");
    }
  };

  // Header style
  const headerStyle = {
    background: "linear-gradient(to right, #0a198b, #1e3a8a)",
    color: "#facc15",
    fontWeight: "bold",
  };

  // columns
  const columns = [
    {
      title: "Currency Name",
      dataIndex: "currencyName",
      key: "currencyName",
      render: (text) => (
        <span
          className="text-xs sm:text-sm md:text-base"
          style={{ color: theme.text, fontWeight: 500 }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Currency Description",
      dataIndex: "currencyDesc",
      key: "currencyDesc",
      render: (text) => (
        <span className="text-xs sm:text-sm md:text-base" style={{ color: theme.text }}>
          {text}
        </span>
      ),
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
              title="Are you sure?"
              onConfirm={() => onEditCurrency(obj)}
            >
              <Button
                type="text"
                size="small"
                style={{
                  background: "linear-gradient(to right, #3b82f6, #2563eb)",
                  color: "#fff",
                }}
                icon={<EditOutlined />}
              />
            </Popconfirm>

            <Popconfirm
              title="Are you sure?"
              onConfirm={() => onDeleteCurrency(obj._id)}
            >
              <Button
                type="text"
                size="small"
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
                  <Menu.Item key="edit" onClick={() => onEditCurrency(obj)}>
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    key="delete"
                    danger
                    onClick={() => onDeleteCurrency(obj._id)}
                  >
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
        {/* Add Currency */}
        <Card
          title="Add new currency"
          headStyle={headerStyle}
          className="text-xs sm:text-sm md:text-base p-2 sm:p-4"
          style={{
            background: theme.cardBg,
            border: theme.border,
            color: theme.text,
          }}
        >
          <Form
            form={currencyFORM}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="currencyName"
              label="Currency name"
              rules={[{ required: true }]}
            >
              <Input
                style={{ background: theme.cardBg, color: theme.text }}
                className="text-xs sm:text-sm md:text-base"
              />
            </Item>

            <Item label="Currency description" name="currencyDesc">
              <Input.TextArea
                style={{ background: theme.cardBg, color: theme.text }}
                className="text-xs sm:text-sm md:text-base"
              />
            </Item>
            <Item>
              {edit ? (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-rose-500 !text-white !font-bold !w-full text-xs sm:text-sm md:text-base"
                >
                  Update
                </Button>
              ) : (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  className="!bg-blue-500 !text-white !font-bold !w-full text-xs sm:text-sm md:text-base"
                >
                  Submit
                </Button>
              )}
            </Item>
          </Form>
        </Card>

        {/* Currency List */}
        <Card
          className="md:col-span-2 text-xs sm:text-sm md:text-base p-2 sm:p-4"
          title="Currency list"
          headStyle={headerStyle}
          style={{
            overflowX: "auto",
            background: theme.cardBg,
            border: theme.border,
            color: theme.text,
          }}
        >
          <Table
            columns={columns}
            dataSource={allCurrency}
            scroll={{ x: "max-content" }}
            pagination={false}
          />
        </Card>
      </h1>
    </Adminlayout>
  );
};

export default Currency;
