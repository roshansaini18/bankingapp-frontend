import { useState } from 'react';
import { Button, Card, Form, Input, message, Select, Steps, Typography, Result } from 'antd';
import { ArrowRightOutlined, BankOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { fetchData, http } from '../../../modules/modules';
import Customerlayout from '../../Layout/Customerlayout';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Transfer = () => {
  const [step1Form] = Form.useForm();
  const [step2Form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [transferDetails, setTransferDetails] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const { data: beneficiariesData, isLoading: beneficiariesLoading } = useSWR('/api/beneficiaries', fetchData);
  const beneficiaries = beneficiariesData?.data.map(b => ({
    label: `${b.payeeName} (${b.accountNo})`,
    value: b._id,
  })) || [];

  const handleStep1Finish = (values) => {
    const selectedBeneficiary = beneficiariesData?.data.find(b => b._id === values.beneficiaryId);
    if (selectedBeneficiary) {
        setTransferDetails({ ...values, payeeName: selectedBeneficiary.payeeName });
        setCurrentStep(1);
    } else {
        messageApi.error("Could not find beneficiary details. Please try again.");
    }
  };

  const handleStep2Finish = async (values) => {
    // This is our original logic, it should run after manual validation
    console.log("Step B: handleStep2Finish function is now running.");
    const finalPayload = { ...transferDetails, ...values };
    try {
      setLoading(true);
      messageApi.loading('Processing transfer...');
      const httpReq = http();
      await httpReq.post('/api/transfers', finalPayload);
      messageApi.success('Transfer successful!');
      setCurrentStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Transfer failed.';
      messageApi.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // FIX: Create a new function to manually trigger the transfer
  const triggerTransfer = async () => {
    console.log("Step A: 'Confirm & Transfer' button clicked. Manually starting validation.");
    try {
      // 1. Manually validate the fields of the second form
      const values = await step2Form.validateFields();
      console.log("Manual validation successful. Form values:", values);
      
      // 2. If validation succeeds, call our original handler function
      await handleStep2Finish(values);

    } catch (errorInfo) {
      // This will catch any validation errors (e.g., empty password)
      console.log("Manual validation failed:", errorInfo);
      messageApi.error("Please check the form for errors.");
    }
  };
  
  const resetFlow = () => {
      step1Form.resetFields();
      step2Form.resetFields();
      setCurrentStep(0);
      setTransferDetails(null);
  }

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
            <Form form={step1Form} layout="vertical" onFinish={handleStep1Finish}>
              {/* This form remains the same */}
              <Form.Item name="beneficiaryId" label="Select Payee" rules={[{ required: true }]}>
                <Select showSearch placeholder="Select a payee" options={beneficiaries} loading={beneficiariesLoading} optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="amount" label="Amount" rules={[{ required: true, pattern: /^[1-9]\d*$/, message: "Please enter a valid amount." }]}>
                <Input type="number" min="1" prefix="₹" />
              </Form.Item>
              <Form.Item name="reference" label="Reference (Optional)">
                <Input.TextArea rows={2} placeholder="e.g., For monthly rent" />
              </Form.Item>
              <Button type="primary" htmlType="submit" block icon={<ArrowRightOutlined />}>Proceed</Button>
            </Form>
          )}
          
          {currentStep === 1 && transferDetails && (
            <div>
              <Title level={5}>Confirm Transfer Details</Title>
              <p>To: <Text strong>{transferDetails.payeeName}</Text></p>
              <p>Amount: <Text strong>₹{Number(transferDetails.amount).toLocaleString()}</Text></p>
              <p>Reference: <Text>{transferDetails.reference || 'N/A'}</Text></p>
              <Divider />
              {/* FIX: We removed onFinish from the form tag */}
              <Form form={step2Form} layout="vertical">
                <Form.Item name="password" label="Enter Your Password to Confirm" rules={[{ required: true, message: "Password is required to confirm." }]}>
                  <Input.Password prefix={<LockOutlined />} />
                </Form.Item>
                <div className='flex gap-2'>
                    <Button block onClick={() => setCurrentStep(0)}>Back</Button>
                    {/* FIX: The button is now a standard button that calls our new trigger function */}
                    <Button type="primary" htmlType="button" onClick={triggerTransfer} loading={loading} block icon={<BankOutlined />}>Confirm & Transfer</Button>
                </div>
              </Form>
            </div>
          )}

          {currentStep === 2 && transferDetails && (
              <Result
                status="success"
                title="Transfer Successful!"
                subTitle={`You have successfully sent ₹${Number(transferDetails.amount).toLocaleString()} to ${transferDetails.payeeName}.`}
                extra={[
                    <Button type="primary" key="new" onClick={resetFlow}>Make Another Transfer</Button>,
                    <Button key="dashboard" onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</Button>,
                ]}
              />
          )}
        </Card>
      </div>
    </Customerlayout>
  );
};

export default Transfer;
