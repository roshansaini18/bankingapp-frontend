import { useState } from 'react';
import { Button, Card, Form, Input, message, Select, Steps, Typography, Result } from 'antd';
import { ArrowRightOutlined, BankOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetchData, http } from '../../../modules/modules';
import Customerlayout from '../../Layout/Customerlayout';

const { Title, Text } = Typography;

const Transfer = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [transferDetails, setTransferDetails] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch beneficiaries to populate the dropdown
  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useSWR('/api/beneficiaries', fetchData);
  const beneficiaries = beneficiariesData?.data.map(b => ({
    label: `${b.payeeName} (${b.accountNo})`,
    value: b._id,
  })) || [];

  // Step 1: User selects payee and amount
  const handleStep1Finish = (values) => {
    const selectedBeneficiary = beneficiariesData?.data.find(b => b._id === values.beneficiaryId);
    setTransferDetails({ ...values, payeeName: selectedBeneficiary.payeeName });
    setCurrentStep(1);
  };

 // Step 2: User confirms and enters password
  const handleStep2Finish = async (values) => {
    const finalPayload = { ...transferDetails, ...values };

    // --- DEBUG LOG 1 ---
    console.log("Submitting to /api/transfers with this payload:", finalPayload);

    try {
      setLoading(true);
      messageApi.loading('Processing transfer...');
      const httpReq = http();
      await httpReq.post('/api/transfers', finalPayload);
      messageApi.success('Transfer successful!');

      // --- DEBUG LOG 2 ---
      // Let's see what transferDetails looks like right before we show the success screen.
      console.log("API call successful. Current transferDetails state:", transferDetails);
      
      setCurrentStep(2); // Move to success step

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Transfer failed.';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const resetFlow = () => {
      form.resetFields();
      setCurrentStep(0);
      setTransferDetails(null);
  }

   console.log("Component is rendering with state:", { currentStep, transferDetails });

  return (
    <Customerlayout>
      {contextHolder}
      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <Title level={3} style={{ textAlign: 'center', marginBottom: 24 }}>Fund Transfer</Title>
          <Steps current={currentStep} className="mb-8">
            <Steps.Step title="Details" />
            <Steps.Step title="Confirm" />
            <Steps.Step title="Success" />
          </Steps>

          {currentStep === 0 && (
            <Form form={form} layout="vertical" onFinish={handleStep1Finish}>
              <Form.Item name="beneficiaryId" label="Select Payee" rules={[{ required: true }]}>
                <Select
                  showSearch
                  placeholder="Select a payee"
                  options={beneficiaries}
                  loading={beneficiariesLoading}
                  prefix={<UserOutlined />}
                />
              </Form.Item>
              <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
                <Input type="number" min="1" prefix="₹" />
              </Form.Item>
              <Form.Item name="reference" label="Reference (Optional)">
                <Input.TextArea rows={2} placeholder="e.g., For monthly rent" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block icon={<ArrowRightOutlined />}>Proceed</Button>
            </Form>
          )}
          
          {currentStep === 1 && (
            <div>
              <Title level={5}>Confirm Transfer Details</Title>
              <p>To: <Text strong>{transferDetails.payeeName}</Text></p>
              <p>Amount: <Text strong>₹{Number(transferDetails.amount).toLocaleString()}</Text></p>
              <p>Reference: <Text>{transferDetails.reference || 'N/A'}</Text></p>
              <Divider />
              <Form form={form} layout="vertical" onFinish={handleStep2Finish}>
                <Form.Item name="password" label="Enter Your Password to Confirm" rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <div className='flex gap-2'>
                    <Button block onClick={() => setCurrentStep(0)}>Back</Button>
                    <Button type="primary" htmlType="submit" loading={loading} block icon={<BankOutlined />}>Confirm & Transfer</Button>
                </div>
              </Form>
            </div>
          )}

          {currentStep === 2 && (
              <Result
                status="success"
                title="Transfer Successful!"
                subTitle={`You have successfully sent ₹${Number(transferDetails.amount).toLocaleString()} to ${transferDetails.payeeName}.`}
                extra={[
                    <Button type="primary" key="new" onClick={resetFlow}>
                        Make Another Transfer
                    </Button>,
                    <Button key="dashboard" onClick={() => navigate('/customer/dashboard')}>
                        Go to Dashboard
                    </Button>,
                ]}
              />
          )}
        </Card>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
