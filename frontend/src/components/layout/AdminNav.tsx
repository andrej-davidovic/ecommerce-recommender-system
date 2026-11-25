import { Tab, Tabs } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import InsightsIcon from "@mui/icons-material/Insights";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useT } from "@/i18n";

const TABS = [
  { path: "/admin", icon: <DashboardIcon fontSize="small" /> },
  { path: "/admin/users", icon: <PeopleIcon fontSize="small" /> },
  { path: "/admin/products", icon: <InventoryIcon fontSize="small" /> },
  { path: "/admin/metrics", icon: <InsightsIcon fontSize="small" /> },
] as const;

export default function AdminNav() {
  const t = useT();
  const { pathname } = useLocation();

  const labels = [
    t.admin.overview,
    t.admin.users,
    t.admin.products,
    t.admin.metrics,
  ];

  const currentTab = TABS.findIndex(
    (tab) =>
      tab.path === pathname ||
      (tab.path !== "/admin" && pathname.startsWith(tab.path)),
  );

  return (
    <Tabs
      value={currentTab === -1 ? 0 : currentTab}
      sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
    >
      {TABS.map((tab, i) => (
        <Tab
          key={tab.path}
          icon={tab.icon}
          iconPosition="start"
          label={labels[i]}
          component={RouterLink}
          to={tab.path}
        />
      ))}
    </Tabs>
  );
}
