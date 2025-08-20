"use client";
import { useState } from "react";
import {
  Form, Input, Button, Upload, Typography, Space,
  DatePicker, TimePicker, Switch, Card, App, Alert
} from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined, PlusOutlined, UploadOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, PictureOutlined, InfoCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// Upload restrictions (matching server-side)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_DIMENSIONS = 1920; // Max width/height in pixels
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

interface EventFormValues {
  title: string;
  description?: string;
  date: dayjs.Dayjs;
  startTime?: dayjs.Dayjs;
  endTime?: dayjs.Dayjs;
  location: string;
  ticketUrl: string;
  flyerUrl?: string;
  isPublished: boolean;
}

export default function AdminPage() {
  const { message } = App.useApp();
  const [token, setToken] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  // Client-side validation function
  const validateFile = (file: File): boolean => {
    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error(`Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.`);
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      message.error(`File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return false;
    }

    return true;
  };

  // Get image dimensions from file
  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  };



  // Helper function to validate URL format
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return /\.(jpg|jpeg|png|webp|gif)$/i.test(urlObj.pathname);
    } catch {
      return false;
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    accept: "image/*",
    multiple: false,
    beforeUpload: async (file) => {
      // Client-side validation
      if (!validateFile(file)) {
        return false;
      }

      // Check dimensions
      try {
        const dimensions = await getImageDimensions(file);
        if (dimensions.width > MAX_IMAGE_DIMENSIONS || dimensions.height > MAX_IMAGE_DIMENSIONS) {
          message.error(`Image dimensions too large. Maximum dimensions are ${MAX_IMAGE_DIMENSIONS}x${MAX_IMAGE_DIMENSIONS} pixels.`);
          return false;
        }
      } catch {
        message.error("Failed to validate image dimensions.");
        return false;
      }

      return true;
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setUploading(true);
        const fd = new FormData();
        fd.set("file", file as File);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd,
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Upload failed");
        }
        
        const { url } = await res.json();
        setFlyerUrl(url);
        if (onSuccess) {
          onSuccess({ url }, new XMLHttpRequest());
        }
        message.success("Flyer uploaded successfully!");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload error";
        message.error(errorMessage);
        if (onError) {
          onError(error as Error);
        }
      } finally {
        setUploading(false);
      }
    },
    showUploadList: false,
  };

  async function onFinish(values: EventFormValues) {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": token,
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description || null,
          date: values.date?.format("YYYY-MM-DD"),
          startTime: values.startTime ? values.startTime.format("h:mm A") : null,
          endTime: values.endTime ? values.endTime.format("h:mm A") : null,
          location: values.location,
          ticketUrl: values.ticketUrl,
          flyerUrl: flyerUrl || values.flyerUrl,
          isPublished: values.isPublished ?? true,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      message.success("Event created successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating event";
      message.error(errorMessage);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Compact Header */}
        <div className="mb-4 text-center">
          <Title level={3} className="!mb-1 !text-slate-800 dark:!text-slate-100">
            Event Management
          </Title>
          <Text className="text-slate-600 dark:text-slate-400 text-sm">
            Create and manage your events with ease
          </Text>
        </div>

        {/* Admin Token - Compact */}
        <Card className="mb-4 shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <Text strong className="text-slate-700 dark:text-slate-200 text-sm">Admin Token</Text>
          </div>
          <Input.Password
            placeholder="Enter your admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="!border-slate-200 dark:!border-slate-600 !bg-white dark:!bg-slate-700"
            size="middle"
          />
        </Card>

        {/* Main Content Grid - 3 Columns */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Upload Section - Left Column */}
          <Card 
            title={
              <div className="flex items-center gap-2 text-sm">
                <UploadOutlined className="text-blue-500" />
                <span>Upload Flyer</span>
              </div>
            }
            className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            size="small"
          >
            <Space direction="vertical" size={12} className="w-full">
              {/* Upload Restrictions Info */}
              <Alert
                message="Upload Requirements"
                description={
                  <div className="text-xs space-y-1">
                    <div>• Max file size: 5MB</div>
                    <div>• Max dimensions: 1920×1920 pixels</div>
                    <div>• Supported formats: JPEG, PNG, WebP, GIF</div>
                  </div>
                }
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                className="!text-xs"
              />
              
              <Dragger {...uploadProps} disabled={!token} className="!h-24">
                <div className="p-3 text-center">
                  <p className="ant-upload-drag-icon text-xl text-blue-500 !mb-1">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text text-slate-700 dark:text-slate-200 text-xs">
                    Click or drag image
                  </p>
                  <p className="ant-upload-hint text-slate-500 dark:text-slate-400 text-xs mt-1">
                    Max 5MB, 1920×1920px
                  </p>
                </div>
              </Dragger>
              
              {/* File Info Display */}
              {uploading && (
                <div className="text-center">
                  <Text className="text-blue-500 text-xs">Uploading...</Text>
                </div>
              )}
              
              <div className="space-y-2">
                <Text className="text-slate-600 dark:text-slate-400 text-xs">Or paste URL:</Text>
                <Input
                  placeholder="https://example.com/flyer.jpg"
                  value={flyerUrl}
                  onChange={(e) => setFlyerUrl(e.target.value)}
                  className="!border-slate-200 dark:!border-slate-600"
                  size="small"
                  onBlur={(e) => {
                    const url = e.target.value.trim();
                    if (url && !isValidImageUrl(url)) {
                      message.warning("URL should point to a valid image file (JPG, PNG, WebP, or GIF)");
                    }
                  }}
                />
              </div>

              {flyerUrl && (
                <div className="mt-2">
                  <Text className="text-slate-600 dark:text-slate-400 text-xs block mb-1">Preview:</Text>
                  <img 
                    src={flyerUrl} 
                    alt="Flyer preview" 
                    className="max-h-32 w-full object-cover rounded border border-slate-200 dark:border-slate-600" 
                  />
                  <div className="mt-2 text-center">
                    <Text className="text-green-600 dark:text-green-400 text-xs">
                      ✓ Flyer ready
                    </Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>

          {/* Event Form - Middle Column */}
          <Card 
            title={
              <div className="flex items-center gap-2 text-sm">
                <PlusOutlined className="text-green-500" />
                <span>Event Details</span>
              </div>
            }
            className="shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm lg:col-span-2"
            size="small"
          >
            <Form 
              layout="vertical" 
              onFinish={onFinish} 
              initialValues={{ isPublished: true }}
              className="space-y-3"
              size="small"
            >
              {/* Title and Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Title</span>
                      <span className="text-red-500">*</span>
                    </div>
                  } 
                  name="title" 
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-2"
                >
                  <Input 
                    placeholder="Event title"
                    className="!border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>

                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Description</span>
                    </div>
                  } 
                  name="description"
                  className="!mb-2"
                >
                  <Input.TextArea 
                    rows={2} 
                    placeholder="Brief description..."
                    className="!border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <CalendarOutlined className="text-blue-500 text-xs" />
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Date</span>
                      <span className="text-red-500">*</span>
                    </div>
                  } 
                  name="date" 
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-2"
                >
                  <DatePicker 
                    className="w-full !border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>

                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="text-green-500 text-xs" />
                      <span className="text-slate-200 text-xs">Start</span>
                    </div>
                  } 
                  name="startTime"
                  className="!mb-2"
                >
                  <TimePicker 
                    use12Hours 
                    format="h:mm A"
                    className="w-full !border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>

                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="text-red-500 text-xs" />
                      <span className="text-slate-200 text-xs">End</span>
                    </div>
                  } 
                  name="endTime"
                  className="!mb-2"
                >
                  <TimePicker 
                    use12Hours 
                    format="h:mm A"
                    className="w-full !border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Location and Ticket URL Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <EnvironmentOutlined className="text-purple-500 text-xs" />
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Location</span>
                      <span className="text-red-500">*</span>
                    </div>
                  } 
                  name="location" 
                  rules={[{ required: true, message: 'Required' }]}
                  className="!mb-2"
                >
                  <Input 
                    placeholder="Event location"
                    className="!border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>

                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <LinkOutlined className="text-orange-500 text-xs" />
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Ticket URL</span>
                      <span className="text-red-500">*</span>
                    </div>
                  } 
                  name="ticketUrl" 
                  rules={[{ required: true, type: "url", message: 'Valid URL required' }]}
                  className="!mb-2"
                >
                  <Input 
                    placeholder="https://tickets.example.com"
                    className="!border-slate-200 dark:!border-slate-600"
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Flyer URL and Published Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <PictureOutlined className="text-pink-500 text-xs" />
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Flyer URL</span>
                    </div>
                  } 
                  name="flyerUrl"
                  className="!mb-2"
                >
                  <Input 
                    value={flyerUrl} 
                    onChange={(e) => setFlyerUrl(e.target.value)}
                    placeholder="https://example.com/flyer.jpg"
                    className="!border-slate-200 dark:!border-slate-600"
                    size="small"
                    onBlur={(e) => {
                      const url = e.target.value.trim();
                      if (url && !isValidImageUrl(url)) {
                        message.warning("URL should point to a valid image file (JPG, PNG, WebP, or GIF)");
                      }
                    }}
                  />
                </Form.Item>

                <Form.Item 
                  label={
                    <div className="flex items-center gap-1">
                      <span className="text-slate-700 dark:text-slate-200 text-xs">Published</span>
                    </div>
                  } 
                  name="isPublished" 
                  valuePropName="checked"
                  className="!mb-2"
                >
                  <Switch 
                    defaultChecked 
                    className="!bg-slate-200 dark:!bg-slate-600"
                    size="small"
                  />
                </Form.Item>
              </div>

              {/* Submit Button */}
              <Form.Item className="!mb-0 !mt-4">
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={uploading}
                  size="middle"
                  className="w-full !bg-blue-500 hover:!bg-blue-600 !border-0 !shadow-md hover:!shadow-lg transition-all duration-200"
                  icon={<PlusOutlined />}
                >
                  {uploading ? 'Creating...' : 'Create Event'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* Compact Footer */}
        <div className="mt-4 text-center">
          <Text className="text-slate-500 dark:text-slate-400 text-xs">
            All events are automatically saved and can be managed from the admin dashboard
          </Text>
        </div>
      </div>
    </div>
  );
}
