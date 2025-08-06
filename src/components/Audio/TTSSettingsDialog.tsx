import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Box,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SpeedIcon from "@mui/icons-material/Speed";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";
import { useDispatch, useSelector } from "react-redux";
import {
  setTtsSettings,
  selectTtsSettings,
  TTSSettingsState,
} from "@/lib/redux/slices/ttsSlice";

interface TTSSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

const AVAILABLE_VOICES = [
  { key: "fa_IR-amir-medium", label: "امیر (متوسط)" },
  { key: "fa_IR-ganji-medium", label: "گنجی (متوسط)" },
  { key: "fa_IR-ganji_adabi-medium", label: "گنجی ادبی (متوسط)" },
  { key: "fa_IR-gyro-medium", label: "ژیرو (متوسط)" },
  { key: "fa_IR-reza_ibrahim-medium", label: "رضا ابراهیم (متوسط)" },
  { key: "fa_IR-mana-medium", label: "مانا (متوسط)" },
];

export default function TTSSettingsDialog({
  open,
  onClose,
}: TTSSettingsDialogProps) {
  const dispatch = useDispatch();
  const settings = useSelector(selectTtsSettings);

  const handleSettingsChange = (newSettings: Partial<TTSSettingsState>) => {
    dispatch(setTtsSettings(newSettings));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "background.paper",
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            تنظیمات صوت
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <RecordVoiceOverIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                انتخاب صدا
              </Typography>
            </Box>
            <FormControl fullWidth>
              <InputLabel>صدای گوینده</InputLabel>
              <Select
                value={settings.voiceKey}
                label="صدای گوینده"
                onChange={(e) =>
                  handleSettingsChange({ voiceKey: e.target.value })
                }
              >
                {AVAILABLE_VOICES.map((voice) => (
                  <MenuItem key={voice.key} value={voice.key}>
                    {voice.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SpeedIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                سرعت پخش
              </Typography>
            </Box>
            <Box sx={{ px: 2 }}>
              <Slider
                value={settings.speed}
                onChange={(_, value) =>
                  handleSettingsChange({ speed: value as number })
                }
                min={0.5}
                max={2}
                step={0.1}
                marks={[
                  { value: 0.5, label: "آهسته" },
                  { value: 1, label: "معمولی" },
                  { value: 1.5, label: "سریع" },
                  { value: 2, label: "خیلی سریع" },
                ]}
                valueLabelDisplay="auto"
                sx={{ color: "primary.main" }}
              />
            </Box>
          </Box>

          <Divider />

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <VolumeUpIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                میزان صدا
              </Typography>
            </Box>
            <Box sx={{ px: 2 }}>
              <Slider
                value={settings.volume}
                onChange={(_, value) =>
                  handleSettingsChange({ volume: value as number })
                }
                min={0}
                max={1}
                step={0.1}
                marks={[
                  { value: 0, label: "بی‌صدا" },
                  { value: 0.5, label: "متوسط" },
                  { value: 1, label: "بلند" },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
                sx={{ color: "primary.main" }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          لغو
        </Button>
        <Button onClick={onClose} variant="contained">
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
