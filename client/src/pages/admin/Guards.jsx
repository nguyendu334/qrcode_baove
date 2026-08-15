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
} from "@mui/material";

import { Add, Delete, Edit } from "@mui/icons-material";

import { useEffect, useState } from "react";

import api from "../../services/api";

import GuardDialog from "../../components/GuardDialog";

export default function Guards() {
  const [guards, setGuards] = useState([]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [editingGuard, setEditingGuard] = useState(null);

  const loadGuards = async () => {
    try {
      const response = await api.get("/guards");

      setGuards(response.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGuards();
  }, []);

  const handleDelete = async (guard) => {
    const ok = window.confirm(`Khóa bảo vệ ${guard.full_name}?`);

    if (!ok) {
      return;
    }

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
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Quản lý bảo vệ
          </Typography>

          <Typography color="text.secondary">
            Danh sách nhân viên bảo vệ
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingGuard(null);

            setOpen(true);
          }}
        >
          Thêm bảo vệ
        </Button>
      </Box>

      <Card
        sx={{
          borderRadius: 4,
        }}
      >
        <CardContent>
          <TextField
            fullWidth
            placeholder="Tìm kiếm bảo vệ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã</TableCell>

                  <TableCell>Họ tên</TableCell>

                  <TableCell>Điện thoại</TableCell>

                  <TableCell>Trạng thái</TableCell>

                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filtered.map((guard) => (
                  <TableRow key={guard.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {guard.guard_code}
                      </Typography>
                    </TableCell>

                    <TableCell>{guard.full_name}</TableCell>

                    <TableCell>{guard.phone || "-"}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={guard.is_active ? "Hoạt động" : "Đã khóa"}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <IconButton
                        onClick={() => {
                          setEditingGuard(guard);

                          setOpen(true);
                        }}
                      >
                        <Edit />
                      </IconButton>

                      <IconButton onClick={() => handleDelete(guard)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
