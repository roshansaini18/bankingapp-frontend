import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Image, Input, message, Select, Carousel, Slider } from "antd";
import { useState, useRef, useEffect } from "react";
import { http, trimData } from "../../../modules/modules";

// FIX: Define the ImageKit base URL once at the top
const imageKitBaseUrl = "https://ik.imagekit.io/gr14ysun7";

const NewTransaction = () => {
  // FIX: Use localStorage, not sessionStorage, to be consistent with your login flow
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [transactionForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [accountNo, setAccountNo] = useState("");
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // States for horizontal scroll slider
  const [scrollValue, setScrollValue] = useState(0);
  const [showSlider, setShowSlider] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowSlider(scrollWidth > clientWidth);
      }
    };
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [accountDetails]);

  const handleSliderChange = (value) => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollLeft = (value / 100) * (scrollWidth - clientWidth);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 0) {
        setScrollValue((scrollLeft / maxScroll) * 100);
      }
    }
  };

  // Submit transaction
  const onFinish = async (values) => {
    try {
      const finalObj = trimData(values);
      let balance = 0;

      if (finalObj.transactionType === "cr") {
        balance = Number(accountDetails.finalBalance) + Number(finalObj.transactionAmount);
      } else if (finalObj.transactionType === "dr") {
        if (Number(finalObj.transactionAmount) > Number(accountDetails.finalBalance)) {
          return messageApi.warning("Insufficient balance");
        }
        balance = Number(accountDetails.finalBalance) - Number(finalObj.transactionAmount);
      }

      finalObj.currentBalance = accountDetails.finalBalance;
      finalObj.customerId = accountDetails._id;
      finalObj.accountNo = accountDetails.accountNo;
      finalObj.branch = userInfo.branch;
      
      const httpReq = http();
      // FIX: The first API call should be to create the transaction record itself
      await httpReq.post("/api/transaction", finalObj);
      
      // The second API call updates the customer's balance
      await httpReq.put(`/api/customers/${accountDetails._id}`, { finalBalance: balance });

      messageApi.success("Transaction created successfully!");

      // Try to send email notification after transaction is successful
      try {
        messageApi.loading("Sending transaction email...");
        const emailData = {
          to: accountDetails.email,
          fullName: accountDetails.fullName,
          accountNo: accountDetails.accountNo,
          transactionType: finalObj.transactionType,
          transactionAmount: finalObj.transactionAmount,
          newBalance: balance,
          currency: accountDetails.currency,
          reference: finalObj.reference, // FIX: Corrected typo from 'refrence'
        };
        await httpReq.post("/api/send-email/transaction", emailData);
        messageApi.success("Transaction details sent to customer's email!");
      } catch (emailError) {
        console.error("Transaction succeeded, but email failed to send:", emailError);
        messageApi.warning("Transaction successful, but failed to send email alert.");
      }

      // Reset form and state
      transactionForm.resetFields();
      setAccountDetails(null);
      setAccountNo("");
      setScrollValue(0);
    } catch (error) {
      messageApi.error("Unable to process transaction!");
    }
  };

  // Search account by account no
  const searchByAccountNo = async () => {
    if (!accountNo) {
      return messageApi.warning("Please enter an account number");
    }
    try {
      setLoading(true);
      const obj = { accountNo, branch: userInfo?.branch };
      const httpReq = http();
      const { data } = await httpReq.post("/api/find-by-account", obj);
      if (data?.data) {
        setAccountDetails(data.data);
      } else {
        messageApi.warning("No account found with this number.");
        setAccountDetails(null);
      }
    } catch (error) {
      messageApi.error("An error occurred while searching for the account.");
      setAccountDetails(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 md:p-4 max-w-full overflow-hidden">
      {contextHolder}
      <Card
        title={<span className="text-base md:text-lg font-bold text-yellow-400">New Transaction</span>}
        headStyle={{ background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #3b82f6 100%)" }}
        extra={
          <Input
            placeholder="Enter account number"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            onPressEnter={searchByAccountNo}
            className="w-full sm:w-64"
            addonAfter={
              loading ? <LoadingOutlined /> : <SearchOutlined style={{ cursor: "pointer", color: "#3b82f6", fontSize: "18px" }} onClick={searchByAccountNo} />
            }
          />
        }
      >
        {accountDetails ? (
          <div className="w-full">
            <div className="flex justify-center mb-6">
              <Carousel autoplay dots className="w-24 sm:w-32 md:w-40">
                <div>
                  <Image
                    src={`${imageKitBaseUrl}/${accountDetails?.profile}?tr=w-160,h-160`}
                    preview={{ src: `${imageKitBaseUrl}/${accountDetails?.profile}` }}
                    className="rounded-full border-2 border-indigo-400 shadow-lg mx-auto aspect-square object-cover"
                  />
                </div>
                <div>
                  <Image
                    src={`${imageKitBaseUrl}/${accountDetails?.signature}?tr=w-160,h-160`}
                    preview={{ src: `${imageKitBaseUrl}/${accountDetails?.signature}` }}
                    className="rounded-full border-2 border-emerald-400 shadow-lg mx-auto aspect-square object-cover"
                  />
                </div>
              </Carousel>
            </div>
            <div className="w-full">
              <div ref={scrollContainerRef} onScroll={handleScroll} className="hide-scrollbar flex gap-4 overflow-x-auto pb-2 md:flex-nowrap">
                <div className="flex flex-col gap-3 p-4 rounded-lg flex-1 min-w-[280px] sm:min-w-[300px] shrink-0 border bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">Account Details</h3>
                    <div className="flex justify-between text-sm md:text-base py-1"><span className="font-medium">Name:</span><span className="font-semibold">{accountDetails?.fullName || "N/A"}</span></div>
                    <div className="flex justify-between text-sm md:text-base py-1"><span className="font-medium">Mobile:</span><span className="font-semibold">{accountDetails?.mobile || "N/A"}</span></div>
                    <div className="flex justify-between text-sm md:text-base py-1"><span className="font-medium">Balance:</span><span style={{ background: accountDetails?.currency === "inr" ? "linear-gradient(to right, #10b981, #059669)" : "linear-gradient(to right, #8b5cf6, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "bold", fontSize: "16px" }}>{accountDetails?.currency === "inr" ? "₹" : "$"}{Number(accountDetails?.finalBalance).toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm md:text-base py-1"><span className="font-medium">DOB:</span><span className="font-semibold">{accountDetails?.dob || "N/A"}</span></div>
                    <div className="flex justify-between text-sm md:text-base py-1"><span className="font-medium">Currency:</span><span className="font-semibold uppercase">{accountDetails?.currency || "N/A"}</span></div>
                </div>
                <div className="p-4 rounded-lg flex-1 min-w-[320px] sm:min-w-[350px] shrink-0 border bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Transaction Form</h3>
                    <Form form={transactionForm} onFinish={onFinish} layout="vertical">
                      <Form.Item label="Transaction Type" name="transactionType" rules={[{ required: true, message: "Please select type" }]}>
                        <Select placeholder="Select Transaction Type" size="large" options={[{ value: "cr", label: "💰 Credit (CR)" }, { value: "dr", label: "💸 Debit (DR)" }]} />
                      </Form.Item>
                      <Form.Item label="Transaction Amount" name="transactionAmount" rules={[{ required: true, message: "Please enter amount" }, { type: "number", min: 1, message: "Amount must be greater than 0", transform: (value) => Number(value) }]}>
                        <Input placeholder="Enter amount" type="number" prefix={accountDetails?.currency === "inr" ? "₹" : "$"} />
                      </Form.Item>
                      {/* FIX: Corrected typo from 'refrence' to 'reference' */}
                      <Form.Item label="Reference (Optional)" name="reference">
                        <Input.TextArea rows={3} placeholder="Enter transaction reference..." />
                      </Form.Item>
                      <Button htmlType="submit" type="primary" size="large" className="!w-full !font-semibold mt-4" style={{ background: "linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)" }}>
                        💳 Submit Transaction
                      </Button>
                    </Form>
                </div>
              </div>
              {showSlider && (
                <div className="mt-4 px-2">
                  <Slider min={0} max={100} value={scrollValue} onChange={handleSliderChange} />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Empty description={<span className="text-gray-500">Search an account to start a transaction</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default NewTransaction;
