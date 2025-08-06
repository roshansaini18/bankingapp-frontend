import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Loader from "../components/Loader";
import Guard from "../components/Gaurd";
import { AppProvider } from "../components/Layout/Theme/ThemeContext";
import GlobalLoader from "../components/GlobalLoader";

// Lazy loaded components
const Homepage = lazy(() => import("../components/Home"));
const Dashboard = lazy(() => import("../components/Admin"));
const NewEmployee = lazy(() => import("../components/Admin/NewEmployee"));
const PageNotFound = lazy(() => import("../components/PageNotFound"));
const Branding = lazy(() => import("../components/Admin/Branding"));
const Branch = lazy(() => import("../components/Admin/Branch"));
const Currency = lazy(() => import("../components/Admin/Currency"));
const AdminNewAccount = lazy(() => import("../components/Admin/AdminNewAccount"));
const AdminTransaction = lazy(() => import("../components/Admin/AdminTransaction"));

const EmployeeDashboard = lazy(() => import("../components/Employee"));
const EmpNewAccount = lazy(() => import("../components/Employee/EmpNewAccount"));
const EmpTransaction = lazy(() => import("../components/Employee/EmpTransaction"));

const CustomerDashboard = lazy(() => import("../components/Customer"));
const CustomerTransactions = lazy(() => import("../components/Customer/Transactions"));
const Profile = lazy(() => import("../components/Customer/Profile"));

const ForgotPassword = lazy(() => import("../components/ForgotPassword")); 
const Payees  = lazy(() => import("../components/Customer/Payees"));
const Transfer  = lazy(() => import("../components/Customer/Transfer"));
const ManageCard  = lazy(() => import("../components/Customer/ManageCard"));

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
         <GlobalLoader />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Homepage />} />

            {/* Admin routes */}
            <Route
              path="/admin/"
              element={<Guard endpoint="/api/verify-token" role="admin" />}
            >
              <Route index element={<Dashboard />} />
              <Route path="new-employee" element={<NewEmployee />} />
              <Route path="branding" element={<Branding />} />
              <Route path="branch" element={<Branch />} />
              <Route path="currency" element={<Currency />} />
              <Route path="new-account" element={<AdminNewAccount />} />
              <Route path="new-transaction" element={<AdminTransaction />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>

            {/* Employee routes */}
            <Route
              path="/employee/"
              element={<Guard endpoint="/api/verify-token" role="employee" />}
            >
              <Route index element={<EmployeeDashboard />} />
              <Route path="new-account" element={<EmpNewAccount />} />
              <Route path="new-transaction" element={<EmpTransaction />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>

            {/* Customer routes */}
            <Route
              path="/customer/"
              element={<Guard endpoint="/api/verify-token" role="customer" />}
            >
              <Route index element={<CustomerDashboard />} />
              <Route path="transaction" element={<CustomerTransactions />} />
               <Route path="payees" element={<Payees  />} />
               <Route path="transfer" element={<Transfer   />} />
              <Route path="card" element={<ManageCard    />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<PageNotFound />} />
            </Route>

            {/* Forgot Password Routes */}
            <Route path="/forgot-password" element={<ForgotPassword />} /> 

            {/* Fallback */}
            <Route path="/*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;


