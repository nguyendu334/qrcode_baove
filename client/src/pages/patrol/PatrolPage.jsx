/* eslint-disable react-hooks/immutability */
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Alert,
  Stack,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  LocationOn,
  PhotoCamera,
  Delete,
  Shield,
  PersonPin,
  ReportProblem,
  PhoneInTalk,
  AddAPhoto,
  WbSunny,
  NightsStay,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import imageCompression from "browser-image-compression";
import api from "../../services/api";

// Danh sách sự cố hay gặp
const COMMON_INCIDENTS = [
  "Rò rỉ nước / Khí thải",
  "Nguy cơ cháy nổ / Khói",
  "Cửa / Khóa hỏng",
  "Đèn chiếu sáng hỏng",
  "Tài sản bị hỏng hóc",
  "Người lạ xuất hiện",
  "Sự cố khác",
];

// Số điện thoại liên hệ khẩn cấp
const EMERGENCY_CONTACTS = [
  { name: "Mai Trọng Tú", phone: "0988123456" },
  { name: "Trần Văn Tây", phone: "0912345678" },
];

export default function PatrolPage() {
  const [searchParams] = useSearchParams();
  const qrToken = searchParams.get("point");

  const [point, setPoint] = useState(null);
  const [guards, setGuards] = useState([]);
  const [guardId, setGuardId] = useState("");
  const [coords, setCoords] = useState(null);

  // State quản lý danh sách sự cố chọn qua Checkbox
  const [selectedIncidents, setSelectedIncidents] = useState([]);

  // Ảnh bắt buộc ban đầu
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Danh sách ảnh sự cố bổ sung
  const [incidentPhotos, setIncidentPhotos] = useState([]);
  const [incidentPreviews, setIncidentPreviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const [sosContact, setSosContact] = useState(null);

  const [currentRoundInfo, setCurrentRoundInfo] = useState({
    shiftText: "Đang tải...",
    shiftType: "day",
    currentRoundName: "--",
    nextRoundName: "--",
  });

  const { t } = useTranslation();

  useEffect(() => {
    loadData();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6),
          });
        },
        (err) => {
          console.warn("Lỗi lấy GPS:", err.message);
          setCoords(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchRoundInfo = async () => {
      try {
        const response = await api.get("/rounds");
        if (response.data.success && response.data.currentInfo) {
          setCurrentRoundInfo(response.data.currentInfo);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin vòng:", error);
      }
    };

    fetchRoundInfo();
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

  // Xử lý nén ảnh bắt buộc
  const handleCapturePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setPhoto(compressedFile);
      setPhotoPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Lỗi nén ảnh:", error);
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  // Xử lý thêm nhiều ảnh sự cố bổ sung
  const handleCaptureIncidentPhotos = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const options = {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1024,
      useWebWorker: true,
    };

    try {
      const compressedFiles = await Promise.all(
        files.map((file) => imageCompression(file, options)),
      );
      const newPreviews = compressedFiles.map((file) =>
        URL.createObjectURL(file),
      );

      setIncidentPhotos((prev) => [...prev, ...compressedFiles]);
      setIncidentPreviews((prev) => [...prev, ...newPreviews]);
    } catch (error) {
      console.error("Lỗi nén ảnh sự cố:", error);
    }
  };

  const handleRemoveIncidentPhoto = (index) => {
    setIncidentPhotos((prev) => prev.filter((_, i) => i !== index));
    setIncidentPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Xử lý Tích / Bỏ tích sự cố
  const handleCheckboxChange = (incident) => {
    if (selectedIncidents.includes(incident)) {
      setSelectedIncidents((prev) => prev.filter((item) => item !== incident));
    } else {
      setSelectedIncidents((prev) => [...prev, incident]);
    }
  };

  const handleCheck = async () => {
    if (!guardId) {
      setMessage("Vui lòng chọn tên bảo vệ");
      return;
    }

    if (!photo) {
      setMessage("Vui lòng chụp ảnh tại điểm tuần tra");
      return;
    }

    setChecking(true);
    setMessage("");

    const formData = new FormData();
    formData.append("guard_id", guardId);
    formData.append("patrol_point_id", point.id);
    formData.append("photo", photo); // Ảnh bắt buộc

    // Thêm các ảnh sự cố bổ sung
    incidentPhotos.forEach((file) => {
      formData.append("incident_photos", file);
    });

    if (sosContact) {
      formData.append("emergency_contacted", sosContact.name);
      formData.append("emergency_phone", sosContact.phone);
      formData.append("called_at", sosContact.called_at);
    }
    // Đóng gói mảng sự cố từ checkbox
    formData.append("incidents", JSON.stringify(selectedIncidents));

    if (coords?.lat) formData.append("latitude", coords.lat);
    if (coords?.lng) formData.append("longitude", coords.lng);

    try {
      const response = await api.post("/patrol/check", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message || t("patrol.success_message"));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || t("patrol.error_message"));
    } finally {
      setChecking(false);
    }
  };

  // Gọi khẩn cấp và lưu thông tin vào state để hiển thị
  const handleEmergencyCall = (contact) => {
    setSosContact({
      name: contact.name,
      phone: contact.phone,
      called_at: new Date().toISOString(),
    });
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
        <Card sx={{ borderRadius: 3, p: 2, maxWidth: 400, width: "100%" }}>
          <CardContent>
            <Typography color="error" fontWeight={700} align="center">
              {message || "Dữ liệu điểm tuần tra không hợp lệ"}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        py: 3,
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 4,
          bgcolor: "#ffffff",
          boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
        {/* HEADER HERO */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #20314d 0%, #162750 100%)",
            color: "#ffffff",
            p: 3,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <Chip
              icon={
                <Shield
                  sx={{
                    fontSize: "24px !important",
                    color: "#d9e5f3 !important",
                    p: 1,
                  }}
                />
              }
              label={point.point_code + " - " + point.point_name}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.1)",
                color: "#a9d0ff",
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: 1.5,
                height: "auto",
                py: 0.8,
                "& .MuiChip-label": {
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                },
              }}
            />
          </Box>

          {point.area && (
            <Typography
              variant="body2"
              sx={{ color: "#94a3b8", mt: 0.5, fontWeight: 500 }}
            >
              {t("patrol.area")}:{" "}
              <strong style={{ color: "#f8fafc" }}>{point.area}</strong>
            </Typography>
          )}

          <Box
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.06)",
              p: 1.2,
              px: 1.5,
              borderRadius: 2,
              border: "1px solid rgba(255, 255, 255, 0.08)",
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                alignSelf: "stretch",
                width: "100px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor:
                  currentRoundInfo.shiftType === "day"
                    ? "rgba(245, 158, 11, 0.12)"
                    : "rgba(56, 189, 248, 0.12)",
                border: `1px solid ${
                  currentRoundInfo.shiftType === "day"
                    ? "rgba(245, 158, 11, 0.3)"
                    : "rgba(56, 189, 248, 0.3)"
                }`,
                borderRadius: 1.5,
                px: 1,
                py: 0.5,
              }}
            >
              {currentRoundInfo.shiftType === "day" ? (
                <WbSunny sx={{ fontSize: 24, color: "#f59e0b", mb: 1 }} />
              ) : (
                <NightsStay sx={{ fontSize: 24, color: "#38bdf8", mb: 1 }} />
              )}
              <Typography
                variant="caption"
                sx={{
                  color:
                    currentRoundInfo.shiftType === "day"
                      ? "#fbbf24"
                      : "#38bdf8",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {t(`patrol.${currentRoundInfo.shiftText}`)}
              </Typography>
            </Box>

            {/* CỘT BÊN PHẢI: CHI TIẾT GIỜ TUẦN TRA */}
            <Box display="flex" flexDirection="column" gap={0.6} flexGrow={1}>
              {/* DÒNG 1: VÒNG HIỆN TẠI */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 2 }}
                >
                  {t("patrol.current_patrol_round")}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#4ade80",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    lineHeight: 1,
                  }}
                >
                  {currentRoundInfo.currentRoundTime}
                </Typography>
              </Box>

              {/* DÒNG 2: VÒNG TIẾP THEO */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography
                  variant="caption"
                  sx={{ color: "#94a3b8", fontSize: "0.85rem", lineHeight: 2 }}
                >
                  {t("patrol.next_patrol_round")}:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#cbd5e1",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    lineHeight: 1,
                  }}
                >
                  {currentRoundInfo.nextRoundTime}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Tần suất kiểm tra theo ca */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#fa6d6d",
                fontSize: "0.85rem",
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              {t("patrol.patrol_frequency")}:
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#f8fafc",
                fontWeight: 700,
                fontSize: "0.8rem",
                lineHeight: 1.5,
              }}
            >
              {t("patrol.shift_frequency_desc")}
            </Typography>
          </Box>

          {/* GPS */}
          {coords && (
            <Box
              component="a"
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
                textDecoration: "none",
                transition: "all 0.2s",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.15)" },
              }}
            >
              <LocationOn
                sx={{ fontSize: 14, color: "#ef4444", flexShrink: 0 }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: "#cbd5e1",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  lineHeight: 1,
                  fontFamily: "monospace, sans-serif",
                }}
              >
                {coords.lat}, {coords.lng}
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: 3 }}>
          {/* PHẦN 1: CHỌN BẢO VỆ */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#475569",
                fontWeight: 700,
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.8,
              }}
            >
              <PersonPin sx={{ fontSize: 16, color: "primary.main" }} />
              {t("patrol.guard_name")} *
            </Typography>
            <Select
              fullWidth
              value={guardId}
              displayEmpty
              onChange={(e) => setGuardId(e.target.value)}
              sx={{
                borderRadius: 2.5,
                fontSize: "0.95rem",
                bgcolor: "#f8fafc",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e2e8f0",
                },
                "& .MuiSelect-select": { py: 1.3 },
              }}
            >
              <MenuItem value="" disabled>
                <em>{t("patrol.select_guard")}</em>
              </MenuItem>
              {guards.map((guard) => (
                <MenuItem key={guard.id} value={guard.id}>
                  {guard.guard_code ? `${guard.guard_code} - ` : ""}
                  {guard.full_name}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* PHẦN 2: CHỤP ẢNH HIỆN TRƯỜNG BẮT BUỘC */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#475569",
                fontWeight: 700,
                fontSize: "0.78rem",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 0.8,
              }}
            >
              <PhotoCamera sx={{ fontSize: 16, color: "primary.main" }} />
              {t("patrol.scene_photo")} *
            </Typography>

            <input
              accept="image/*"
              id="camera-photo-input"
              type="file"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleCapturePhoto}
            />

            {!photoPreview ? (
              <label htmlFor="camera-photo-input">
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "#cbd5e1",
                    bgcolor: "#f8fafc",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(37, 99, 235, 0.02)",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      mx: "auto",
                      mb: 1,
                      bgcolor: "#e0f2fe",
                      color: "primary.main",
                    }}
                  >
                    <PhotoCamera />
                  </Avatar>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {t("patrol.take_photo_required")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {t("patrol.camera_tap_hint")}
                  </Typography>
                </Paper>
              </label>
            ) : (
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                }}
              >
                <img
                  src={photoPreview}
                  alt="Ảnh tuần tra"
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <label htmlFor="camera-photo-input">
                    <Button
                      variant="contained"
                      component="span"
                      size="small"
                      startIcon={<PhotoCamera />}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.75rem",
                        bgcolor: "rgba(15, 23, 42, 0.75)",
                        backdropFilter: "blur(4px)",
                        "&:hover": { bgcolor: "rgba(15, 23, 42, 0.9)" },
                      }}
                    >
                      {t("patrol.retake_photo")}
                    </Button>
                  </label>
                  <IconButton
                    size="small"
                    onClick={handleRemovePhoto}
                    sx={{
                      bgcolor: "rgba(239, 68, 68, 0.85)",
                      color: "#ffffff",
                      "&:hover": { bgcolor: "#ef4444" },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>

          {/* 3.1. DANH SÁCH SỰ CỐ DẠNG CHECKBOX XẾP DỌC + SỰ CỐ KHÁC */}
          <Box
            sx={{
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              backgroundColor: "#fff7f7",
              p: 2,
              mb: 3,
            }}
          >
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <ReportProblem
                  sx={{ fontSize: 18, color: "warning.main", mr: 1 }}
                />
                {t(`patrol.common_incidents`)}:
              </Typography>

              {/* FORM XẾP DỌC CÁC CHECKBOX SỰ CỐ */}
              <FormGroup sx={{ pl: 0.5, mb: 1.5 }}>
                {COMMON_INCIDENTS.map((item, idx) => (
                  <FormControlLabel
                    key={idx}
                    control={
                      <Checkbox
                        size="medium"
                        checked={selectedIncidents.includes(item)}
                        onChange={() => handleCheckboxChange(item)}
                        sx={{ py: 0.4 }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "1rem", color: "#334155" }}
                      >
                        {t(`patrol.${item}`)}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>

            {/* 3.2. KHU VỰC ẢNH SỰ CỐ BỔ SUNG NẰM HÀNG NGANG */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "#475569",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  display: "block",
                  mb: 0.8,
                }}
              >
                {t(`patrol.additional_photos`)} ({incidentPreviews.length}{" "}
                {t(`patrol_history.images`)}):
              </Typography>

              <input
                accept="image/*"
                id="camera-incident-photos-input"
                type="file"
                multiple
                capture="environment"
                style={{ display: "none" }}
                onChange={handleCaptureIncidentPhotos}
              />

              {/* CONTAINER DẠNG FLEX DỌC THEO HÀNG NGANG */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row", // Ép hiển thị nằm ngang 100%
                  alignItems: "center",
                  gap: 1.2,
                  overflowX: "auto", // Cho phép cuộn ngang mượt mà nếu có nhiều ảnh
                  pb: 1,
                }}
              >
                {/* Nút Thêm ảnh */}
                <label htmlFor="camera-incident-photos-input">
                  <Paper
                    variant="outlined"
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      borderStyle: "dashed",
                      borderWidth: 1.5,
                      borderColor: "#cbd5e1",
                      bgcolor: "#f8fafc",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "rgba(37, 99, 235, 0.02)",
                      },
                    }}
                  >
                    <AddAPhoto
                      sx={{ color: "primary.main", fontSize: 20, mb: 0.3 }}
                    />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="primary.main"
                      fontSize="0.65rem"
                    >
                      {t(`patrol.btn_add_photo`)}
                    </Typography>
                  </Paper>
                </label>

                {/* Danh sách ảnh thu nhỏ nằm ngay bên phải */}
                {incidentPreviews.map((src, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: "relative",
                      width: 72,
                      height: 72,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #e2e8f0",
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={src}
                      alt={`Ảnh sự cố ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveIncidentPhoto(index)}
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        bgcolor: "rgba(239, 68, 68, 0.85)",
                        color: "#ffffff",
                        p: 0.2,
                        "&:hover": { bgcolor: "#ef4444" },
                      }}
                    >
                      <Delete sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* 3.3. KHU VỰC LIÊN HỆ KHẨN CẤP (SOS) */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "#fff1f2",
                borderColor: "#ffe4e6",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#be123c",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <PhoneInTalk sx={{ fontSize: 15, color: "#e11d48" }} />
                {t("patrol.emergency_contact")}
              </Typography>

              <Stack direction="row" spacing={1}>
                {EMERGENCY_CONTACTS.map((contact, i) => (
                  <Button
                    key={i}
                    component="a"
                    href={`tel:${contact.phone}`}
                    onClick={() => handleEmergencyCall(contact)}
                    fullWidth
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<PhoneInTalk fontSize="small" />}
                    sx={{
                      borderRadius: 1.8,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "none",
                      bgcolor: "#e11d48",
                      py: 0.6,
                    }}
                  >
                    {contact.name}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Box>
          {/* THÔNG BÁO KẾT QUẢ API */}
          {message && (
            <Alert
              severity={success ? "success" : "error"}
              sx={{ mb: 2, borderRadius: 2.5, fontWeight: 600 }}
            >
              {message}
            </Alert>
          )}

          {/* NÚT XÁC NHẬN CHÍNH */}
          <Button
            fullWidth
            variant="contained"
            disabled={!guardId || !photo || checking || success}
            onClick={handleCheck}
            startIcon={
              checking ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckCircle />
              )
            }
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            }}
          >
            {checking
              ? "Đang xác nhận..."
              : success
                ? t("patrol.confirmed_status")
                : t("patrol.confirm_patrol")}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
