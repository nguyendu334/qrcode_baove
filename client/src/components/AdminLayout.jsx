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
  Menu,
  MenuItem,
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

import LanguageIcon from "@mui/icons-material/Language";

import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { useState } from "react";

const drawerWidth = 260;

const menu = [
  { text: "sidebar.dashboard", icon: <DashboardRounded />, path: "/" },
  { text: "sidebar.point", icon: <LocationOnRounded />, path: "/points" },
  { text: "sidebar.guard", icon: <GroupsRounded />, path: "/guards" },
  { text: "sidebar.history", icon: <HistoryRounded />, path: "/history" },
  { text: "sidebar.month", icon: <BarChartRounded />, path: "/monthly" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const { i18n, t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleClose();
  };

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
                {t("sidebar.system")}
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
                  primary={t(item.text)}
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
              {t(
                menu.find((m) => m.path === location.pathname)?.text ||
                  "Bảng điều khiển",
              )}
            </Typography>

            <Stack direction="row" spacing={1}>
              <IconButton color="inherit" onClick={handleClick} size="small">
                <LanguageIcon fontSize="small" />
              </IconButton>

              <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem
                  selected={i18n.language === "vi"}
                  onClick={() => changeLanguage("vi")}
                >
                  <ListItemIcon>🇻🇳</ListItemIcon>
                  <ListItemText>Tiếng Việt</ListItemText>
                </MenuItem>

                <MenuItem
                  selected={i18n.language === "en"}
                  onClick={() => changeLanguage("en")}
                >
                  <ListItemIcon>🇺🇸</ListItemIcon>
                  <ListItemText>English</ListItemText>
                </MenuItem>

                <MenuItem
                  selected={i18n.language === "ko"}
                  onClick={() => changeLanguage("ko")}
                >
                  <ListItemIcon>🇰🇷</ListItemIcon>
                  <ListItemText>한국어</ListItemText>
                </MenuItem>

                <MenuItem
                  selected={i18n.language === "zh"}
                  onClick={() => changeLanguage("zh")}
                >
                  <ListItemIcon>🇨🇳</ListItemIcon>
                  <ListItemText>中文</ListItemText>
                </MenuItem>
              </Menu>

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
