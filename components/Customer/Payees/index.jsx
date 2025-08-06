import { useState } from 'react';
import { Button, Card, Form, Input, message, Popconfirm, Table, Empty } from 'antd';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import { fetchData, http } from '../../../modules/modules';
import Customerlayout from '../../Layout/Customerlayout';

const Payees = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const { data: beneficiariesData, error, isLoading } = useSWR('/api/beneficiaries', fetchData);
  const beneficiaries = beneficiariesData?.data || [];

  const handleAddPayee = async (values) => {
    try {
      setLoading(true);
      const httpReq = http();
      await httpReq.post('/api/beneficiaries', values);
      messageApi.success('Payee added successfully!');
      form.resetFields();
      mutate('/api/beneficiaries');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add payee.';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayee = async (id) => {
    try {
      const httpReq = http();
      await httpReq.delete(`/api/beneficiaries/${id}`);
      messageApi.success('Payee deleted successfully!');
      mutate('/api/beneficiaries');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete payee.';
      messageApi.error(errorMessage);
    }
  };

  const columns = [
    {
      title: 'Payee Name',
      dataIndex: 'payeeName',
      key: 'payeeName',
    },
    {
      title: 'Account Number',
      dataIndex: 'accountNo', // This should match the model
      key: 'accountNo',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete this payee?"
          description="Are you sure you want to remove this payee from your list?"
          onConfirm={() => handleDeletePayee(record._id)}
          okText="Yes, Delete"
          cancelText="No"
        >
          <Button type="primary" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Customerlayout>
      {contextHolder}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <Card title="Add New Payee" className="md:col-span-1">
          <Form form={form} layout="vertical" onFinish={handleAddPayee}>
            <Form.Item name="payeeName" label="Payee Nickname" rules={[{ required: true, message: 'Please enter a name for the payee' }]}>
              <Input placeholder="e.g., Landlord, John Doe" />
            </Form.Item>
            
            {/* FIX: Changed the name from 'accountNumber' to 'accountNo' */}
            <Form.Item name="accountNo" label="Account Number" rules={[{ required: true, message: 'Please enter the account number' }]}>
              <Input placeholder="Enter S.O. Bank account number" />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block icon={<UserAddOutlined />}>
                Add Payee
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Saved Payees" className="md:col-span-2">
          <Table
            columns={columns}
            dataSource={beneficiaries}
            loading={isLoading}
            rowKey="_id"
            locale={{ emptyText: <Empty description="You have not added any payees yet." /> }}
          />
          {error && <p className='text-red-500'>Failed to load payees.</p>}
        </Card>
      </div>
    </Customerlayout>
  );
};

export default Payees;
