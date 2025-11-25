import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Infomation from "@/pages/Infomation";
import AboutUs from "@/pages/AboutUs";
import Blogs from "@/pages/Blogs";
import NotFound from "@/pages/NotFound";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/information" element={<Infomation />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/blogs" element={<Blogs />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
