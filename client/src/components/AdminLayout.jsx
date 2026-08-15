import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  AppBar,
  Avatar,
  IconButton,
  Divider,
  Stack,
  alpha,
} from "@mui/material";

import {
  DashboardRounded,
  LocationOnRounded,
  GroupsRounded,
  HistoryRounded,
  BarChartRounded,
  NotificationsNone,
  Shield,
  Logout,
} from "@mui/icons-material";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 260;

const menu = [
  { text: "Tổng quan", icon: <DashboardRounded />, path: "/" },
  { text: "Điểm tuần tra", icon: <LocationOnRounded />, path: "/points" },
  { text: "Bảo vệ", icon: <GroupsRounded />, path: "/guards" },
  { text: "Lịch sử tuần tra", icon: <HistoryRounded />, path: "/history" },
  { text: "Thống kê tháng", icon: <BarChartRounded />, path: "/monthly" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Sidebar Navigation */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "#ffffff",
          },
        }}
      >
        {/* Brand Logo */}
        <Toolbar sx={{ px: 3, my: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              }}
            >
              <Shield fontSize="medium" />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                PATROL
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hệ thống giám sát
              </Typography>
            </Box>
          </Stack>
        </Toolbar>

        <Divider sx={{ my: 1, opacity: 0.6 }} />

        {/* Menu Items */}
        <List sx={{ px: 2, pt: 1, flexGrow: 1 }}>
          {menu.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  mb: 1,
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 2,
                  bgcolor: isActive ? alpha("#1976d2", 0.08) : "transparent",
                  color: isActive ? "primary.main" : "text.secondary",
                  fontWeight: isActive ? 600 : 500,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: isActive ? alpha("#1976d2", 0.12) : "action.hover",
                    transform: "translateX(4px)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: "0.925rem",
                    fontWeight: isActive ? 700 : 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Footer Admin User Info */}
        <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              alt="Admin"
              src=""
              sx={{ width: 40, height: 40, bgcolor: "primary.dark" }}
            >
              A
            </Avatar>
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <Typography variant="subtitle2" noWrap fontWeight={700}>
                Quản trị viên
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
              >
                admin@patrol.vn
              </Typography>
            </Box>
            <IconButton size="small" color="default">
              <Logout fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Drawer>

      {/* Main Container */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Top Header Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(8px)",
            borderBottom: "1px solid",
            borderColor: "divider",
            color: "text.primary",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {menu.find((m) => m.path === location.pathname)?.text ||
                "Bảng điều khiển"}
            </Typography>

            <Stack direction="row" spacing={1}>
              <IconButton color="inherit">
                <NotificationsNone />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content Rendered Here */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3.5,
            maxWidth: 1400,
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
