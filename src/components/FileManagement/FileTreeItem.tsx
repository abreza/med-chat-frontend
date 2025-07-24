/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  MoreVert as MoreIcon,
  Psychology as AnalyzeIcon,
} from "@mui/icons-material";
import { FileItem } from "./types";
import FileIconComponent from "./FileIcon";
import FileAnalysisDisplay from "./FileAnalysisDisplay";

interface FileTreeItemProps {
  file: FileItem;
  isSelected: boolean;
  isExpanded?: boolean;
  isAnalysisExpanded?: boolean;
  children?: React.ReactNode;
  onSelect: (fileId: string) => void;
  onToggle?: (fileId: string) => void;
  onAnalysisToggle?: (fileId: string) => void;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, fileId: string) => void;
  onQuestionSelect?: (question: string) => void;
  getCategoryColor: (category: string) => any;
  getCategoryLabel: (category: string) => string;
  depth?: number;
}

export default function FileTreeItem({
  file,
  isSelected,
  isExpanded = false,
  isAnalysisExpanded = false,
  children,
  onSelect,
  onToggle,
  onAnalysisToggle,
  onMenuOpen,
  onQuestionSelect,
  getCategoryColor,
  getCategoryLabel,
  depth = 0,
}: FileTreeItemProps) {
  const handleClick = () => {
    if (file.isFolder) {
      onToggle?.(file.id);
    } else {
      onSelect(file.id);
    }
  };

  return (
    <div>
      <Paper
        elevation={0}
        sx={{
          mb: 1,
          ml: depth * 4,
          border: "1px solid",
          borderColor: isSelected ? "primary.main" : "grey.200",
          borderRadius: 2,
          bgcolor: isSelected ? "primary.light" : "background.paper",
          "&:hover": {
            bgcolor: isSelected ? "primary.light" : "grey.50",
          },
          transition: "all 0.2s",
        }}
      >
        <ListItem onClick={handleClick}>
          <ListItemIcon>
            {!file.isFolder && (
              <Checkbox
                checked={isSelected}
                onChange={() => onSelect(file.id)}
                onClick={(e) => e.stopPropagation()}
                size="small"
              />
            )}
          </ListItemIcon>

          <ListItemIcon>
            <Avatar
              sx={{
                bgcolor: file.isFolder
                  ? "primary.light"
                  : getCategoryColor(file.category) + ".light",
                color: file.isFolder
                  ? "primary.main"
                  : getCategoryColor(file.category) + ".main",
                width: 32,
                height: 32,
              }}
            >
              <FileIconComponent file={file} isExpanded={isExpanded} />
            </Avatar>
          </ListItemIcon>

          <ListItemText
            primary={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {file.name}
                </Typography>
                {!file.isFolder && (
                  <Chip
                    label={getCategoryLabel(file.category)}
                    size="small"
                    color={getCategoryColor(file.category)}
                    variant="outlined"
                  />
                )}
                {file.analysis?.status === "completed" && (
                  <Chip
                    label="تحلیل شده"
                    size="small"
                    color="success"
                    variant="filled"
                  />
                )}
              </Box>
            }
            secondary={
              !file.isFolder && (
                <Typography variant="caption" color="text.secondary">
                  {file.size} • {file.uploadDate}
                </Typography>
              )
            }
          />

          {!file.isFolder && (
            <ListItemSecondaryAction>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {file.analysis && (
                  <Tooltip title="مشاهده تحلیل">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAnalysisToggle?.(file.id);
                      }}
                      sx={{
                        color: isAnalysisExpanded
                          ? "primary.main"
                          : "text.secondary",
                      }}
                    >
                      <AnalyzeIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  onClick={(e) => onMenuOpen(e, file.id)}
                  size="small"
                >
                  <MoreIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          )}
        </ListItem>

        {!file.isFolder && file.analysis && isAnalysisExpanded && (
          <FileAnalysisDisplay
            analysis={file.analysis}
            onQuestionSelect={onQuestionSelect}
          />
        )}
      </Paper>

      {file.isFolder && (
        <Collapse in={isExpanded}>
          <Box sx={{ ml: 2, mt: 1 }}>{children}</Box>
        </Collapse>
      )}
    </div>
  );
}
