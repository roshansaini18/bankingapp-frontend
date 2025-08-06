import { useState } from 'react';
import { Button, Card, Col, Form, InputNumber, message, Row, Skeleton, Switch, Tooltip, Typography, Divider } from 'antd';
import { CreditCardOutlined, EyeInvisibleOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import useSWR, { mutate } from 'swr';
import { fetchData, http } from '../../../modules/modules';
import Customerlayout from '../../Layout/Customerlayout';
import './index.css'; // We will create this CSS file next

const { Title, Text } = Typography;

const ManageCard = () => {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { data: cardData, error, isLoading } = useSWR('/api/cards', fetchData);
  const card = cardData?.data;

  const handleUpdate = async (payload) => {
    try {
      setLoading(true);
      const httpReq = http();
      await httpReq.put('/api/cards', payload);
      messageApi.success('Card settings updated!');
      mutate('/api/cards');
    } catch (err) {
      messageApi.error('Failed to update settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = (isChecked) => {
    handleUpdate({ status: isChecked ? 'active' : 'blocked' });
  };
  
  const onLimitsFinish = (values) => {
    handleUpdate({ spendingLimits: values });
  };
  
  if (isLoading) return <Customerlayout><div className='p-4'><Skeleton active paragraph={{ rows: 8 }} /></div></Customerlayout>;
  if (error || !card) return <Customerlayout><Card className="m-4"><p>Could not load card details. Please contact support.</p></Card></Customerlayout>;
  
  const maskedCardNumber = `**** **** **** ${card.cardNumber.slice(-4)}`;
  form.setFieldsValue(card.spendingLimits); // Set initial form values for limits

  return (
    <Customerlayout>
      {contextHolder}
      <div className="p-4">
        <Title level={3}>Manage Your Card</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            {/* Card Visual */}
            <div className={`card-visual ${card.status === 'blocked' ? 'blocked' : ''}`}>
              <div className="card-chip"></div>
              <div className="card-logo">S.O. Bank</div>
              <div className="card-number">{showDetails ? card.cardNumber.replace(/(.{4})/g, '$1 ').trim() : maskedCardNumber}</div>
              <div className="card-details">
                <div><span className="card-label">Card Holder</span><span className="card-value">{card.cardHolderName}</span></div>
                <div><span className="card-label">Expires</span><span className="card-value">{card.expiryDate}</span></div>
                <div><span className="card-label">CVV</span><span className="card-value">{showDetails ? card.cvv : '***'}</span></div>
              </div>
            </div>
             <Button icon={showDetails ? <EyeInvisibleOutlined /> : <EyeOutlined />} onClick={() => setShowDetails(!showDetails)} style={{ marginTop: 16 }}>
                {showDetails ? 'Hide Full Details' : 'Show Full Details'}
            </Button>
          </Col>
          <Col xs={24} md={12}>
            {/* Card Controls */}
            <Card title="Card Settings & Limits">
               <div className="setting-item">
                  <Text strong>Block Card</Text>
                  <Switch
                    checked={card.status === 'active'}
                    onChange={handleStatusToggle}
                    loading={loading}
                    checkedChildren={<UnlockOutlined />}
                    unCheckedChildren={<LockOutlined />}
                  />
               </div>
               <Divider />
                <div className="setting-item">
                   <Text>Online Payments</Text>
                   <Switch defaultChecked={card.enabledTransactions.online} onChange={checked => handleUpdate({enabledTransactions: { online: checked }})} />
                </div>
                <div className="setting-item">
                   <Text>ATM Withdrawals</Text>
                   <Switch defaultChecked={card.enabledTransactions.atm} onChange={checked => handleUpdate({enabledTransactions: { atm: checked }})} />
                </div>
                <div className="setting-item">
                   <Text>International Payments</Text>
                   <Switch defaultChecked={card.enabledTransactions.international} onChange={checked => handleUpdate({enabledTransactions: { international: checked }})} />
                </div>
              <Divider />
              <Form form={form} layout="vertical" onFinish={onLimitsFinish}>
                  <Title level={5}>Spending Limits</Title>
                  <Form.Item name="dailyOnline" label="Daily Online Limit">
                      <InputNumber min={0} step={1000} prefix="₹" style={{width: '100%'}} />
                  </Form.Item>
                  <Form.Item name="dailyAtm" label="Daily ATM Limit">
                      <InputNumber min={0} step={500} prefix="₹" style={{width: '100%'}} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>Save Limits</Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </Customerlayout>
  );
};
export default ManageCard;
