import {
  Table,
  Button,
  Space,
  message,
  DatePicker,
  InputNumber,
  Typography,
} from "antd";
import {
  FilePdfOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  PrinterOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import Customerlayout from "../../Layout/Customerlayout";
import useSWR from "swr";
import { fetchData } from "../../../modules/modules";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

const { Text } = Typography;

const CustomerTransactions = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  const { data: trData, error: trError } = useSWR(
    userInfo?.accountNo
      ? `/api/transaction/account/${userInfo.accountNo}`
      : null,
    fetchData
  );

  const transactions = trData?.data || [];

  const canaraBlue = "#003f6b";
  const lightBlue = "#e6f0fa";
  const accent = "#0075c9";

  const finalBalance = transactions.reduce((currentBalance, transaction) => {
  // Make sure the transaction amount is a valid number
  const amount = Number(transaction.transactionAmount) || 0;

  if (transaction.transactionType === "cr") {
    // If it's a credit, add the amount to the running total
    return currentBalance + amount;
  } else if (transaction.transactionType === "dr") {
    // If it's a debit, subtract the amount
    return currentBalance - amount;
  }
  
  // If the transaction type is unknown, just return the current balance
  return currentBalance;
}, 0); // The '0' at the end is the starting balance.

  const columns = [
    {
      title: "Account No",
      dataIndex: "accountNo",
      key: "accountNo",
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#7c3aed" : "#999" }} />
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#00b894" : "#999" }} />
      ),
    },
    {
      title: "Transaction Amount",
      dataIndex: "transactionAmount",
      key: "transactionAmount",
      render: (text) => (
        <span style={{ color: accent, fontWeight: 600 }}>{text}</span>
      ),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
        const current = selectedKeys[0] || {};
        return (
          <div style={{ padding: 8 }}>
            <InputNumber
              placeholder="Min"
              value={current.min}
              onChange={(value) => {
                setSelectedKeys([{ ...current, min: value }]);
              }}
              style={{ width: 90, marginBottom: 8 }}
            />
            <InputNumber
              placeholder="Max"
              value={current.max}
              onChange={(value) => {
                setSelectedKeys([{ ...current, max: value }]);
              }}
              style={{ width: 90, marginBottom: 8 }}
            />
            <Space>
              <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 70 }}>
                Filter
              </Button>
              <Button
                onClick={() => {
                  clearFilters();
                  setSelectedKeys([]);
                }}
                size="small"
                style={{ width: 70 }}
              >
                Reset
              </Button>
            </Space>
          </div>
        );
      },
      onFilter: (value, record) => {
        const { min, max } = value || {};
        const amt = record.transactionAmount;
        return (
          (min === undefined || amt >= min) && (max === undefined || amt <= max)
        );
      },
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#ff9800" : "#999" }} />
      ),
    },
    {
      title: "Transaction Type",
      dataIndex: "transactionType",
      key: "transactionType",
      filters: [
        { text: "Deposit", value: "cr" },
        { text: "Withdrawal", value: "dr" },
      ],
      onFilter: (value, record) =>
        record.transactionType?.toLowerCase() === value.toLowerCase(),
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#e91e63" : "#999" }} />
      ),
    },
    {
      title: "Previous Balance",
      dataIndex: "currentBalance",
      key: "currentBalance",
      render: (text) => <span style={{ color: canaraBlue }}>{text}</span>,
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#2ecc71" : "#999" }} />
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <DatePicker.RangePicker
            value={selectedKeys[0]}
            onChange={(dates) => setSelectedKeys([dates])}
            style={{ marginBottom: 8 }}
            format="YYYY-MM-DD"
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small">
              Filter
            </Button>
            <Button onClick={clearFilters} size="small">
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => {
        const [start, end] = value || [];
        const date = dayjs(record.createdAt);
        return (
          (!start || date.isAfter(start, "day") || date.isSame(start, "day")) &&
          (!end || date.isBefore(end, "day") || date.isSame(end, "day"))
        );
      },
      filterIcon: (filtered) => (
        <FilterOutlined style={{ color: filtered ? "#2196f3" : "#999" }} />
      ),
    },
  ];

  const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(canaraBlue);

  // Add customer details
  doc.text("Customer Transaction Statement", 14, 20);
  doc.setFontSize(12);
  doc.text(`Name: ${userInfo?.fullName || "N/A"}`, 14, 30);
  doc.text(`Account No: ${userInfo?.accountNo || "N/A"}`, 14, 37);
  doc.text(`Email: ${userInfo?.email || "N/A"}`, 14, 44);

  // Table Data
  const tableData = transactions.map((t) => [
    t.accountNo,
    t.branch,
    t.transactionAmount,
    t.transactionType,
    t.currentBalance,
    new Date(t.createdAt).toLocaleString(),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [["Account No", "Branch", "Amount", "Type", "Balance", "Date"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: canaraBlue, textColor: "#fff" },
    styles: { fillColor: lightBlue },
  });

  doc.save("Transaction_Statement.pdf");
};

  const exportExcel = () => {
  // Add customer info row at top
  const headerData = [
    ["Customer Transaction Statement"],
    [`Name: ${userInfo?.fullName || "N/A"}`],
    [`Account No: ${userInfo?.accountNo || "N/A"}`],
    [`Email: ${userInfo?.email || "N/A"}`],
    [], // Empty row
  ];

  const dataRows = transactions.map((t) => ({
    AccountNo: t.accountNo,
    Branch: t.branch,
    Amount: t.transactionAmount,
    Type: t.transactionType,
    Balance: t.currentBalance,
    Date: new Date(t.createdAt).toLocaleString(),
  }));

  const ws = XLSX.utils.json_to_sheet(dataRows, { origin: headerData.length });
  XLSX.utils.sheet_add_aoa(ws, headerData, { origin: 0 });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, "Transaction_Statement.xlsx");
};

const exportCSV = () => {
  // Add customer info lines
  const headerLines = [
    "Customer Transaction Statement",
    `Name: ${userInfo?.fullName || "N/A"}`,
    `Account No: ${userInfo?.accountNo || "N/A"}`,
    `Email: ${userInfo?.email || "N/A"}`,
    "",
  ].join("\n");

  const ws = XLSX.utils.json_to_sheet(transactions);
  const csv = XLSX.utils.sheet_to_csv(ws);

  // Combine header + CSV data
  const finalCSV = `${headerLines}\n${csv}`;

  const blob = new Blob([finalCSV], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "Transaction_Statement.csv";
  link.click();
};


  const printStatement = () => {
    window.print();
  };

  return (
    <Customerlayout>
      {/* PRINT HEADER FOR USER DETAILS */}
      <div
        className="print-header"
        style={{
          display: "none",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ margin: 0, color: canaraBlue }}>Customer Transaction Statement</h2>
        <p style={{ margin: "4px 0" }}>
          <strong>Username:</strong> {userInfo?.fullName}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Account No:</strong> {userInfo?.accountNo}
        </p>
        <p style={{ margin: "4px 0" }}>
          <strong>Email:</strong> {userInfo?.email}
        </p>
      </div>

      <style>
        {`
          @media print {
            /* Show header on print */
            .print-header {
              display: block !important;
            }

            /* Hide layout sidebars/topbars */
            .ant-layout-sider,
            .ant-layout-header {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Export Area + Final Balance */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Space>
          <Button
            icon={<FilePdfOutlined />}
            style={{
              backgroundColor: canaraBlue,
              color: "#fff",
              borderRadius: 6,
            }}
            onClick={exportPDF}
          >
            PDF
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            style={{
              backgroundColor: accent,
              color: "#fff",
              borderRadius: 6,
            }}
            onClick={exportExcel}
          >
            Excel
          </Button>
          <Button
            icon={<FileTextOutlined />}
            style={{
              backgroundColor: "#17a2b8",
              color: "#fff",
              borderRadius: 6,
            }}
            onClick={exportCSV}
          >
            CSV
          </Button>
          <Button
            icon={<PrinterOutlined />}
            style={{
              backgroundColor: lightBlue,
              border: `1px solid ${canaraBlue}`,
              color: canaraBlue,
              borderRadius: 6,
            }}
            onClick={printStatement}
          >
            Print
          </Button>
        </Space>

        <Text strong style={{ fontSize: 16, color: "#4caf50" }}>
          Final Balance: ₹ {finalBalance}
        </Text>
      </div>

      {/* Transactions Table */}
      <div
        style={{
          background: lightBlue,
          padding: 16,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          style={{
            background: "#fff",
            border: `1px solid ${canaraBlue}`,
            borderRadius: 12,
          }}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
        />
      </div>

      {/* Row Styles */}
      <style>
        {`
          .table-row-light td {
            background-color: ${lightBlue};
          }
          .table-row-dark td {
            background-color: #fff;
          }
          .ant-table-thead > tr > th {
            background-color: ${canaraBlue} !important;
            color: #fff !important;
            font-weight: bold;
          }
          .ant-pagination-item-active {
            border-color: ${accent} !important;
          }
          .ant-pagination-item-active a {
            color: ${accent} !important;
          }
        `}
      </style>
    </Customerlayout>
  );
};

export default CustomerTransactions;
