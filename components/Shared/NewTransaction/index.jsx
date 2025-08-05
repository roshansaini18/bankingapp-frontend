import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Form, Image, Input, message, Select } from "antd";
import { useState } from "react";
import { http, trimData } from "../../../modules/modules";

const NewTransaction = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const [transactionForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const [accountNo, setAccountNo] = useState("");
  const [accountDetails, setAccountDetails] = useState(null);

  // Submit transaction
  const onFinish = async (values) => {
    try {
      const finalObj = trimData(values);
      let balance = 0;

      if (finalObj.transactionType === "cr") {
        balance =
          Number(accountDetails.finalBalance) +
          Number(finalObj.transactionAmount);
      } else if (finalObj.transactionType === "dr") {
        if (
          Number(finalObj.transactionAmount) >
          Number(accountDetails.finalBalance)
        ) {
          return messageApi.warning("Insufficient balance");
        }
        balance =
          Number(accountDetails.finalBalance) -
          Number(finalObj.transactionAmount);
      }

      finalObj.currentBalance = accountDetails.finalBalance;
      finalObj.customerId = accountDetails._id;
      finalObj.accountNo = accountDetails.accountNo;
      finalObj.branch = userInfo.branch;

      const httpReq = http();
      await httpReq.post("/api/transaction", finalObj);
      await httpReq.put(`/api/customers/${accountDetails._id}`, {
        finalBalance: balance,
      });

      messageApi.success("Transaction created successfully!");
      transactionForm.resetFields();
      setAccountDetails(null);
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
      const obj = {
        accountNo,
        branch: userInfo?.branch,
      };

      const httpReq = http();
      const { data } = await httpReq.post("/api/find-by-account", obj);

      if (data?.data) {
        setAccountDetails(data?.data);
      } else {
        messageApi.warning("There is no record of this account");
        setAccountDetails(null);
      }
    } catch (error) {
      messageApi.error("There is no record of this account");
    }
  };

  return (
    <div className="p-2 md:p-4">
      {contextHolder}
      <Card
        title={
          <span className="text-base md:text-lg font-bold text-yellow-400">
            New Transaction
          </span>
        }
        headStyle={{
          background:
            "linear-gradient(90deg, #1e1b4b 0%, #312e81 50%, #3b82f6 100%)",
        }}
        extra={
          <Input
            placeholder="Enter account number"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            className="w-full sm:w-64"
            style={{
              borderColor: "#6366f1",
              boxShadow: "0 0 6px rgba(99, 102, 241, 0.4)",
              borderRadius: "6px",
            }}
            addonAfter={
              <SearchOutlined
                style={{
                  cursor: "pointer",
                  color: "#3b82f6",
                  fontSize: "18px",
                  transition: "0.2s",
                }}
                onClick={searchByAccountNo}
              />
            }
          />
        }
      >
        {accountDetails ? (
          <div>
            {/* Profile & Signature */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
              <Image
                src={`${import.meta.env.VITE_BASEURL}/${accountDetails?.profile}`}
                width={90}
                className="rounded-full border-2 border-indigo-400 shadow-lg"
              />
              <Image
                src={`${import.meta.env.VITE_BASEURL}/${accountDetails?.signature}`}
                width={90}
                className="rounded-full border-2 border-emerald-400 shadow-lg"
              />
            </div>

            {/* Details + Form Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Account Details */}
              <div
                className="flex flex-col gap-3 p-4 rounded-lg"
                style={{
                  background: "rgba(243, 244, 246, 0.6)",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <b>Name:</b>
                  <b className="text-gray-900">{accountDetails?.fullName || "N/A"}</b>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <b>Mobile:</b>
                  <b className="text-gray-900">{accountDetails?.mobile || "N/A"}</b>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <b>Balance:</b>
                  <b
                    style={{
                      background:
                        accountDetails?.currency === "inr"
                          ? "linear-gradient(to right, #10b981, #059669)"
                          : "linear-gradient(to right, #8b5cf6, #7c3aed)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    {accountDetails?.currency === "inr" ? "₹" : "$"}
                    {accountDetails?.finalBalance}
                  </b>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <b>DOB:</b>
                  <b className="text-gray-900">{accountDetails?.dob || "N/A"}</b>
                </div>
                <div className="flex justify-between text-sm md:text-base text-gray-700">
                  <b>Currency:</b>
                  <b className="text-gray-900">{accountDetails?.currency || "N/A"}</b>
                </div>
              </div>

              {/* Spacer column for desktop, hidden on mobile */}
              <div className="hidden md:block"></div>

              {/* Transaction Form */}
              <Form
                form={transactionForm}
                onFinish={onFinish}
                layout="vertical"
                className="w-full"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                  <Form.Item
                    label="Transaction Type"
                    name="transactionType"
                    rules={[{ required: true, message: "Please select type" }]}
                  >
                    <Select
                      placeholder="Transaction Type"
                      style={{
                        borderColor: "#6366f1",
                        boxShadow: "0 0 4px rgba(99, 102, 241, 0.3)",
                      }}
                      options={[
                        { value: "cr", label: "Credit (CR)" },
                        { value: "dr", label: "Debit (DR)" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Transaction Amount"
                    name="transactionAmount"
                    rules={[{ required: true, message: "Please enter amount" }]}
                  >
                    <Input
                      placeholder="500000"
                      type="number"
                      min="0"
                      style={{
                        borderColor: "#6366f1",
                      }}
                    />
                  </Form.Item>

                  <Form.Item label="Reference" name="refrence" className="sm:col-span-2">
                    <Input.TextArea
                      rows={3}
                      style={{
                        borderColor: "#6366f1",
                      }}
                    />
                  </Form.Item>
                </div>

                <Form.Item>
                  <Button
                    htmlType="submit"
                    type="primary"
                    className="!w-full !font-semibold"
                    style={{
                      background:
                        "linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
                      color: "#fff",
                      fontSize: "16px",
                      boxShadow: "0 2px 6px rgba(34, 197, 94, 0.4)",
                    }}
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        ) : (
          <Empty description="Search an account to start a transaction" />
        )}
      </Card>
    </div>
  );
};

export default NewTransaction;
