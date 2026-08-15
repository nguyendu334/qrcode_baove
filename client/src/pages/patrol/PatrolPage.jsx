import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import { CheckCircle, LocationOn } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";

export default function PatrolPage() {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("point");

  const [point, setPoint] = useState(null);
  const [guards, setGuards] = useState([]);
  const [guardId, setGuardId] = useState("");
  const [coords, setCoords] = useState(null);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadData();
    // Tự động lấy tọa độ GPS từ trình duyệt
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          });
        },
        () => setCoords(null),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [pointResponse, guardResponse] = await Promise.all([
        api.get(`/points/qr/${qrToken}`),
        api.get("/guards"),
      ]);

      setPoint(pointResponse.data.data);
      setGuards(guardResponse.data.data);
    } catch (error) {
      console.error(error);
      setMessage("Không thể tải thông tin điểm tuần tra");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!guardId) {
      setMessage("Vui lòng chọn tên bảo vệ");
      return;
    }

    setChecking(true);
    setMessage("");

    try {
      const response = await api.post("/patrol/check", {
        guard_id: guardId,
        patrol_point_id: point.id,
        latitude: coords?.lat,
        longitude: coords?.lng,
        note: note.trim() || null,
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message || "Xác nhận tuần tra thành công!");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể xác nhận tuần tra",
      );
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#f8fafc",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!point) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          bgcolor: "#f8fafc",
        }}
      >
        <Card sx={{ borderRadius: 3, p: 2 }}>
          <CardContent>
            <Typography color="error" fontWeight={700} align="center">
              {message}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "98vh",
        bgcolor: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif, system-ui, Roboto",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          bgcolor: "#ffffff",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <Box
              sx={{
                width: 5,
                height: 26,
                bgcolor: "primary.main",
                borderRadius: 1,
              }}
            />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ fontSize: "1.1rem", color: "text.primary" }}
            >
              Chấm điểm tuần tra
            </Typography>
          </Box>

          {/* Khung Thông tin Điểm */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: "#f8fafc",
              border: "1px solid",
              borderColor: "divider",
              textAlign: "left",
              mb: 2.5,
            }}
          >
            <Chip
              label={point.point_code}
              size="small"
              color="primary"
              sx={{
                fontWeight: 800,
                borderRadius: 1.5,
                mb: 1.5,
                fontSize: "0.75rem",
                height: 24,
              }}
            />

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                color: "text.primary",
                fontSize: "1.2rem",
                lineHeight: 1.3,
              }}
            >
              {point.point_name}
            </Typography>

            {point.area && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Khu vực: <b>{point.area}</b>
              </Typography>
            )}

            {coords && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 1.5,
                  fontSize: "0.78rem",
                }}
              >
                <LocationOn sx={{ fontSize: 14 }} /> GPS: {coords.lat},{" "}
                {coords.lng}
              </Typography>
            )}
          </Box>

          {/* Ô Chọn Bảo Vệ */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              mb: 0.8,
              display: "block",
              textAlign: "left",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            Tên bảo vệ:
          </Typography>

          <Select
            fullWidth
            value={guardId}
            displayEmpty
            onChange={(e) => setGuardId(e.target.value)}
            sx={{
              borderRadius: 2.5,
              fontSize: "0.95rem",
              mb: 3,
              "& .MuiSelect-select": {
                py: 1.3,
              },
            }}
          >
            <MenuItem value="" disabled>
              <em>Chọn tên bảo vệ</em>
            </MenuItem>
            {guards.map((guard) => (
              <MenuItem key={guard.id} value={guard.id}>
                {guard.guard_code ? `${guard.guard_code} - ` : ""}
                {guard.full_name}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            label="Nhập ghi chú nếu có sự cố bất thường..."
            multiline
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Nút Chấm Điểm */}
          <Button
            fullWidth
            variant="contained"
            disabled={!guardId || checking || success}
            onClick={handleCheck}
            startIcon={
              checking ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
            sx={{
              py: 1.4,
              mb: 1.5,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "none",
              },
            }}
          >
            {checking
              ? "Đang xác nhận..."
              : success
                ? "Đã xác nhận thành công ✓"
                : "Xác nhận tuần tra"}
          </Button>

          {/* Thông báo API */}
          {message && (
            <Typography
              align="center"
              variant="body2"
              sx={{
                mt: 2,
                mb: 1.5,
                fontWeight: 600,
              }}
              color={success ? "success.main" : "error.main"}
            >
              {message}
            </Typography>
          )}
          
        </CardContent>
      </Card>
    </Box>
  );
}
