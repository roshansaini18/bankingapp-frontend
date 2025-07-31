import { Button, Card, Form, Input, message, Popconfirm, Table } from "antd";
import Adminlayout from "../../Layout/Adminlayout";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { trimData, http } from "../../../modules/modules";
const { Item } = Form;
import { useEffect, useState } from "react";

const Branch = () => {
  // State
  const [branchFORM] = Form.useForm();
  const [loading, setLoadig] = useState(false);
  const [messageApi, context] = message.useMessage();
  const [allBranch, setAllBranch] = useState([]);
  const [no, setNo] = useState(0);
  const [edit, setEdit] = useState(null);

  // Fetch branch data
  useEffect(() => {
    const fetcher = async () => {
      try {
        const httpReq = http();
        const { data } = await httpReq.get("/api/branch");
        setAllBranch(data.data);
      } catch (err) {
        messageApi.error("Unable to fetch data!");
      }
    };
    fetcher();
  }, [no]);

  // Create new branch
  const onFinish = async (values) => {
    try {
      setLoadig(true);
      let finalObj = trimData(values);
      finalObj.key = finalObj.branchName;
      const httpReq = http();
      await httpReq.post(`/api/branch`, finalObj);
      messageApi.success("Branch created");
      branchFORM.resetFields();
      setNo(no + 1);
    } catch (err) {
      if (err?.response?.data?.error?.code === 11000) {
        branchFORM.setFields([
          {
            name: "branchName",
            errors: ["Branch already exists!"],
          },
        ]);
      } else {
        messageApi.error("Try again later");
      }
    } finally {
      setLoadig(false);
    }
  };

  // Delete branch
  const onDeleteBranch = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/branch/${id}`);
      messageApi.success("Branch deleted successfully!");
      setNo(no + 1);
    } catch (err) {
      messageApi.error("Unable to delete branch!");
    }
  };

  // Edit branch
  const onEditBranch = async (obj) => {
    setEdit(obj);
    branchFORM.setFieldsValue(obj);
  };

  const onUpdate = async (values) => {
    try {
      setLoadig(true);
      let finalObj = trimData(values);
      const httpReq = http();
      await httpReq.put(`/api/branch/${edit._id}`, finalObj);
      messageApi.success("Branch updated successfully!");
      setNo(no + 1);
      setEdit(null);
      branchFORM.resetFields();
    } catch (err) {
      messageApi.error("Unable to update branch!");
    } finally {
      setLoadig(false);
    }
  };

  // Columns for table
  const columns = [
    {
      title: "Branch Name",
      dataIndex: "branchName",
      key: "branchName",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Branch Address",
      dataIndex: "branchAddress",
      key: "branchAddress",
      ellipsis: true, // truncate long addresses on small screens
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      render: (_, obj) => (
        <div className="flex gap-1">
          {/* Edit Button */}
          <Popconfirm
            title="Are you sure?"
            description="Once you update, you can also re-update!"
            onCancel={() => messageApi.info("No changes occur!")}
            onConfirm={() => onEditBranch(obj)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #3b82f6, #2563eb)",
                color: "#fff",
              }}
              icon={<EditOutlined />}
              size="small"
            />
          </Popconfirm>

          {/* Delete Button */}
          <Popconfirm
            title="Are you sure?"
            description="Once you delete, you cannot restore it!"
            onCancel={() => messageApi.info("Your data is safe!")}
            onConfirm={() => onDeleteBranch(obj._id)}
          >
            <Button
              type="text"
              style={{
                background: "linear-gradient(to right, #f43f5e, #e11d48)",
                color: "#fff",
              }}
              icon={<DeleteOutlined />}
              size="small"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <Adminlayout>
      {context}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Add New Branch Card */}
        <Card
          title="Add new branch"
          headStyle={{
            background: "linear-gradient(to right, #0a198b, #1e3a8a)",
            color: "#facc15",
            fontWeight: "bold",
          }}
        >
          <Form
            form={branchFORM}
            onFinish={edit ? onUpdate : onFinish}
            layout="vertical"
          >
            <Item
              name="branchName"
              label="Branch name"
              rules={[{ required: true }]}
            >
              <Input />
            </Item>

            <Item label="Branch address" name="branchAddress">
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} />
            </Item>
            <Item>
              {edit ? (
                <Button
                  loading={loading}
                  type="text"
                  htmlType="submit"
                  style={{
                    background: "linear-gradient(to right, #f43f5e, #e11d48)",
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
                    background: "linear-gradient(to right, #3b82f6, #2563eb)",
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
        </Card>

        {/* Branch List Card */}
        <Card
          className="md:col-span-2"
          title="Branch list"
          headStyle={{
            background: "linear-gradient(to right, #0a198b, #1e3a8a)",
            color: "#facc15",
            fontWeight: "bold",
          }}
          bodyStyle={{
            overflowX: "auto",
            padding: "0.5rem",
          }}
        >
          <Table
            columns={columns}
            dataSource={allBranch}
            scroll={{ x: 600 }} // enable horizontal scroll for small screens
            pagination={false}
            size="small"
            rowKey="_id"
            style={{
              border: "1px solid #e5e7eb",
            }}
          />
        </Card>
      </div>
    </Adminlayout>
  );
};

export default Branch;
