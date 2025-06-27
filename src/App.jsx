import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from './Pages/Login';
import ProtectedRoute from "./ProtectedRoute";
import Admin from './Pages/admin';
import User from './Pages/user';
import AdDailyReports from "./Adminboard/DailyReport";
import AdMonReports from "./Adminboard/MonthlyReport";
import UserDailyReports from "./Usersboard/DailyReport";
import UserMonReports from "./Usersboard/MonthlyReport";
import Unauthorized from './Pages/unauthorized';
import UserMeterReports from "./Usersboard/MeterReport";
import AdMeterReports from "./Adminboard/MeterReport";
import Userinfo from "./Adminboard/User";
import AdTestjig from "./Adminboard/TestJig";

const App = () => {
return (
<BrowserRouter>
<Routes>
<Route path="/" element={<Login />} />
<Route path="/unauthorized" element={<Unauthorized />} />

<Route element={<ProtectedRoute allowedRoles={['admin','planthead']} />}>
<Route path="/admin" element={<Admin />} />
<Route path="/pages/Daily" element={<AdDailyReports />} />
<Route path="/pages/Monthly" element={<AdMonReports />} />
<Route path="/pages/Meter" element={<AdMeterReports />} />
<Route path="/user" element={<Userinfo />} />
<Route path="/testJig" element={<AdTestjig />} />
</Route>

<Route element={<ProtectedRoute allowedRoles={['user','linehead','testingengineer']} />}>
<Route path="/users" element={<User />} />
<Route path="/userpages/Daily" element={<UserDailyReports />} />
<Route path="/userpages/Monthly" element={<UserMonReports />} />
<Route path="/userpages/Meter" element={<UserMeterReports />} />
</Route>
</Routes>
</BrowserRouter>
);
};

export default App;
