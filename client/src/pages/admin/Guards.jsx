/* eslint-disable react-hooks/set-state-in-effect */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  alpha,
} from "@mui/material";

import { Add, Delete, Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../services/api";
import GuardDialog from "../../components/GuardDialog";

export default function Guards() {
  const [guards, setGuards] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);

  const { t } = useTranslation();

  const loadGuards = async () => {
    try {
      const response = await api.get("/guards");
      setGuards(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadGuards();
  }, []);

  const handleDelete = async (guard) => {
    const ok = window.confirm(`Khóa bảo vệ ${guard.full_name}?`);
    if (!ok) return;

    try {
      await api.delete(`/guards/${guard.id}`);
      loadGuards();
    } catch (error) {
      alert(error.response?.data?.message || "Không thể khóa bảo vệ");
    }
  };

  const filtered = guards.filter((guard) => {
    const keyword = search.toLowerCase();
    return (
      guard.full_name?.toLowerCase().includes(keyword) ||
      guard.guard_code?.toLowerCase().includes(keyword) ||
      guard.phone?.toLowerCase().includes(keyword)
    );
  });

  return (
    <Box sx={{ width: "100%", pb: 4, bgcolor: "#f8fafc", p: { xs: 2, md: 3 } }}>
      {/* HEADER: Đẩy Nút Thêm sang góc phải ngang hàng với Tiêu đề */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          width: "100%",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={800} color="#0f172a">
            {t("guard_management.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("guard_management.subtitle")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          disableElevation
          onClick={() => {
            setEditingGuard(null);
            setOpen(true);
          }}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            textTransform: "uppercase",
            px: 2.5,
            py: 1,
            whiteSpace: "nowrap",
          }}
        >
          {t("guard_management.add_guard")}
        </Button>
      </Box>

      {/* CARD MAIN */}
      <Card
        elevation={0}
        sx={{
          width: "100%",
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          {/* Ô TÌM KIẾM */}
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm kiếm mã bảo vệ, họ tên, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2.5 }}
          />

          {/* BẢNG BẢO VỆ */}
          <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <TableCell sx={{ fontWeight: 800, color: "#0f172a", py: 2 }}>
                    {t("guard_management.guard_code")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {t("guard_management.full_name")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {t("guard_management.phone")}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#0f172a" }}>
                    {t("guard_management.status")}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, color: "#0f172a" }}
                  >
                    {t("guard_management.actions")}
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary" fontWeight={500}>
                        Không tìm thấy thông tin bảo vệ
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((guard) => (
                    <TableRow key={guard.id} hover>
                      <TableCell>
                        <Typography
                          fontWeight={600}
                          fontSize="0.875rem"
                          color="#0f172a"
                        >
                          {guard.guard_code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500} fontSize="0.875rem">
                          {guard.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {guard.phone || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={
                            guard.is_active !== false ? "Hoạt động" : "Đã khóa"
                          }
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor:
                              guard.is_active !== false ? "#1e7e34" : "#d32f2f",
                            color: "#ffffff",
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingGuard(guard);
                            setOpen(true);
                          }}
                          sx={{ color: "#475569", mr: 0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(guard)}
                          sx={{ color: "#ef4444" }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <GuardDialog
        open={open}
        onClose={() => setOpen(false)}
        guard={editingGuard}
        onSaved={() => {
          setOpen(false);
          loadGuards();
        }}
      />
    </Box>
  );
}
