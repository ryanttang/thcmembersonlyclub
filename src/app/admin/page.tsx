"use client";
import { useState, useEffect } from "react";
import {
  Form, Input, Button, Upload, Typography, Space,
  DatePicker, TimePicker, Switch, Card, App, Alert, Table, Modal, Popconfirm, Tag
} from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined, PlusOutlined, UploadOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, LinkOutlined, PictureOutlined, InfoCircleOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
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

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location: string;
  ticketUrl: string;
  flyerUrl: string;
  isPublished: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const { message } = App.useApp();
  const [token, setToken] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm] = Form.useForm();
  const [createForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Log token changes for debugging
  useEffect(() => {
    console.log("Token changed to:", token); // Debug log
  }, [token]);

  // Initialize forms when component mounts
  useEffect(() => {
    // Small delay to ensure forms are properly initialized
    const timer = setTimeout(() => {
      if (editForm) {
        editForm.resetFields();
      }
      if (createForm) {
        createForm.resetFields();
      }
    }, 100);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (editForm) {
        editForm.resetFields();
      }
      if (createForm) {
        createForm.resetFields();
      }
    };
  }, [editForm, createForm]);

  // Filter events when events or search text changes
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.title.toLowerCase().includes(searchText.toLowerCase()) ||
        event.location.toLowerCase().includes(searchText.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredEvents(filtered);
    }
  }, [events, searchText]);

  // Set form values when editing event changes
  useEffect(() => {
    if (editingEvent && editModalVisible && editForm) {
      editForm.setFieldsValue({
        title: editingEvent.title,
        description: editingEvent.description,
        date: dayjs(editingEvent.date),
        startTime: editingEvent.startTime ? dayjs(editingEvent.startTime, "h:mm A") : undefined,
        endTime: editingEvent.endTime ? dayjs(editingEvent.endTime, "h:mm A") : undefined,
        location: editingEvent.location,
        ticketUrl: editingEvent.ticketUrl,
        flyerUrl: editingEvent.flyerUrl,
        isPublished: editingEvent.isPublished,
      });
    }
  }, [editingEvent, editModalVisible, editForm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log("Fetching events with token:", token); // Debug log
      const res = await fetch(`/api/events?admin=true`, {
        headers: { "x-admin-token": token },
      });
      console.log("Response status:", res.status); // Debug log
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText); // Debug log
        throw new Error(`Failed to fetch events: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      setEvents(data);
      if (data.length > 0) {
        message.success(`Successfully connected! Found ${data.length} event(s)`);
      } else {
        message.info("Connected successfully! No events found yet.");
      }
    } catch (error) {
      console.error("Fetch error:", error); // Debug log
      message.error("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      console.log("Deleting event with token:", token); // Debug log
      const res = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": token },
      });
      console.log("Delete response status:", res.status); // Debug log
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Delete error response:", errorText); // Debug log
        throw new Error(`Failed to delete event: ${res.status} ${errorText}`);
      }
      message.success("Event deleted successfully");
      fetchEvents();
    } catch (error) {
      console.error("Delete error:", error); // Debug log
      message.error("Failed to delete event");
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditModalVisible(true);
  };

  const handleUpdateEvent = async (values: EventFormValues) => {
    if (!editingEvent) return;
    
    try {
      console.log("Updating event with token:", token); // Debug log
      const res = await fetch(`/api/events?id=${editingEvent.id}`, {
        method: "PUT",
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
          flyerUrl: values.flyerUrl,
          isPublished: values.isPublished ?? true,
        }),
      });
      console.log("Update response status:", res.status); // Debug log
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Update error response:", errorText); // Debug log
        throw new Error(`Update failed: ${res.status} ${errorText}`);
      }
      message.success("Event updated successfully!");
      setEditModalVisible(false);
      setEditingEvent(null);
      if (editForm) {
        editForm.resetFields();
      }
      fetchEvents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error updating event";
      console.error("Update error:", error); // Debug log
      message.error(errorMessage);
    }
  };

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
      // Reset form and refresh events
      setFlyerUrl("");
      // Reset the create form
      if (createForm) {
        createForm.resetFields();
      }
      fetchEvents();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating event";
      message.error(errorMessage);
    }
  }

  // Table columns for event management
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <Text className="text-slate-500 dark:text-slate-400 text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
          {id.substring(0, 8)}...
        </Text>
      ),
      width: 80,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong className="text-slate-800 dark:text-slate-100">{text}</Text>,
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <Text className="text-slate-600 dark:text-slate-300 text-xs">
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : "-"}
        </Text>
      ),
      width: 200,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => (
        <div className="text-center">
          <div className="font-medium text-slate-700 dark:text-slate-200">
            {dayjs(date).format("MMM D")}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {dayjs(date).format("YYYY")}
          </div>
        </div>
      ),
      sorter: (a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      width: 100,
    },
    {
      title: "Time",
      key: "time",
      render: (record: Event) => {
        if (!record.startTime && !record.endTime) return "-";
        return (
          <div className="text-center text-sm">
            {record.startTime && <div className="text-slate-700 dark:text-slate-200">{record.startTime}</div>}
            {record.endTime && <div className="text-xs text-slate-500 dark:text-slate-400">{record.endTime}</div>}
          </div>
        );
      },
      width: 100,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (text: string) => <Text className="text-slate-700 dark:text-slate-200">{text}</Text>,
      width: 150,
    },
    {
      title: "Ticket URL",
      dataIndex: "ticketUrl",
      key: "ticketUrl",
      render: (url: string) => (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 text-xs truncate block max-w-[120px]"
          title={url}
        >
          {url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
        </a>
      ),
      width: 120,
    },
    {
      title: "Flyer",
      dataIndex: "flyerUrl",
      key: "flyerUrl",
      render: (url: string) => (
        url ? (
          <div className="flex justify-center">
            <img 
              src={url} 
              alt="Event flyer" 
              className="h-12 w-12 object-cover rounded border border-slate-200 dark:border-slate-600 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const modal = Modal.info({
                  title: "Event Flyer",
                  content: (
                    <div className="text-center">
                      <img 
                        src={url} 
                        alt="Event flyer" 
                        className="max-h-96 max-w-full object-contain rounded" 
                      />
                    </div>
                  ),
                  width: 600,
                });
              }}
            />
          </div>
        ) : (
          <div className="text-slate-400 text-center text-xs">No flyer</div>
        )
      ),
      width: 80,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => (
        <Text className="text-slate-500 dark:text-slate-400 text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
          {slug}
        </Text>
      ),
      width: 100,
    },
    {
      title: "Status",
      dataIndex: "isPublished",
      key: "isPublished",
      render: (published: boolean, record: Event) => (
        <div className="flex items-center gap-2">
          <Tag color={published ? "green" : "orange"} className="text-xs">
            {published ? "Published" : "Draft"}
          </Tag>
          <Switch
            size="small"
            checked={published}
            onChange={async (checked) => {
              try {
                const res = await fetch(`/api/events?id=${record.id}`, {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    "x-admin-token": token,
                  },
                  body: JSON.stringify({ isPublished: checked }),
                });
                if (!res.ok) throw new Error("Update failed");
                message.success(`Event ${checked ? 'published' : 'unpublished'} successfully`);
                fetchEvents();
              } catch (error) {
                message.error("Failed to update event status");
              }
            }}
          />
        </div>
      ),
      filters: [
        { text: "Published", value: true },
        { text: "Draft", value: false },
      ],
      onFilter: (value: any, record: Event) => record.isPublished === value,
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Event) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setEditingEvent(record);
              setEditModalVisible(true);
            }}
            title="View Event"
            className="text-green-600 hover:text-green-700"
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditEvent(record)}
            title="Edit Event"
            className="text-blue-600 hover:text-blue-700"
          />
          <Popconfirm
            title="Delete this event?"
            description="This action cannot be undone. Are you sure you want to continue?"
            onConfirm={() => handleDeleteEvent(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              title="Delete Event"
            />
          </Popconfirm>
        </Space>
      ),
      width: 150,
      fixed: 'right' as const,
    },
    {
      title: "Created",
      key: "created",
      render: (record: Event) => (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div>{dayjs(record.createdAt).format("MMM D, YYYY")}</div>
          <div>{dayjs(record.createdAt).format("h:mm A")}</div>
        </div>
      ),
      width: 100,
    },
    {
      title: "Updated",
      key: "updated",
      render: (record: Event) => (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div>{dayjs(record.updatedAt).format("MMM D, YYYY")}</div>
          <div>{dayjs(record.updatedAt).format("h:mm A")}</div>
        </div>
      ),
      width: 100,
    },
  ];

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
            <div className={`w-2 h-2 rounded-full ${events.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`}></div>
            <Text strong className="text-slate-700 dark:text-slate-200 text-sm">
              {events.length > 0 ? 'Connected' : 'Admin Token'}
            </Text>
          </div>
          <div className="mb-2">
            <Text className="text-slate-600 dark:text-slate-400 text-xs">
              {events.length > 0 
                ? `Connected successfully! Found ${events.length} event(s)`
                : 'Enter your admin token to access event management features'
              }
            </Text>
          </div>
          <div className="flex gap-2">
            <Input.Password
              placeholder="Enter your admin token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="!border-slate-200 dark:!border-slate-600 !bg-white dark:!bg-slate-700"
              size="middle"
            />
            {token && token.length >= 3 && (
              <Button
                type="primary"
                size="middle"
                onClick={fetchEvents}
                loading={loading}
                className="!bg-blue-500 hover:!bg-blue-600"
              >
                {events.length > 0 ? 'Refresh' : 'Connect'}
              </Button>
            )}
          </div>
        </Card>

        {/* Event Management Table */}
        {token && (
          <Card 
            title={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarOutlined className="text-blue-500" />
                  <span>Manage Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input.Search
                    placeholder="Search events..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    size="small"
                    style={{ width: 200 }}
                    allowClear
                  />
                  <Button
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={fetchEvents}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            }
            className="mb-4 shadow-sm border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            size="small"
          >
            {/* Event Summary */}
            <div className="mb-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>Total: {events.length} events</span>
                <span>Published: {events.filter(e => e.isPublished).length}</span>
                <span>Drafts: {events.filter(e => !e.isPublished).length}</span>
              </div>
              {searchText && (
                <span>Showing {filteredEvents.length} of {events.length} events</span>
              )}
            </div>
            
            <Table
              columns={columns}
              dataSource={filteredEvents}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              size="small"
              scroll={{ x: 800 }}
              locale={{
                emptyText: searchText ? `No events found matching "${searchText}"` : "No events found"
              }}
            />
          </Card>
        )}

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
              form={createForm}
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

      {/* Edit Event Modal */}
      {editingEvent && (
        <Modal
          title="Edit Event"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setEditingEvent(null);
            if (editForm) {
              editForm.resetFields();
            }
          }}
          afterClose={() => {
            setEditingEvent(null);
            if (editForm) {
              editForm.resetFields();
            }
          }}
          footer={null}
          width={800}
        >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateEvent}
          className="space-y-3"
        >
          {/* Title and Description Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item 
              label="Title" 
              name="title" 
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input placeholder="Event title" />
            </Form.Item>

            <Form.Item 
              label="Description" 
              name="description"
            >
              <Input.TextArea 
                rows={2} 
                placeholder="Brief description..."
              />
            </Form.Item>
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Form.Item 
              label="Date" 
              name="date" 
              rules={[{ required: true, message: 'Required' }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item 
              label="Start Time" 
              name="startTime"
            >
              <TimePicker 
                use12Hours 
                format="h:mm A"
                className="w-full"
              />
            </Form.Item>

            <Form.Item 
              label="End Time" 
              name="endTime"
            >
              <TimePicker 
                use12Hours 
                format="h:mm A"
                className="w-full"
              />
            </Form.Item>
          </div>

          {/* Location and Ticket URL Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Form.Item 
              label="Location" 
              name="location" 
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input placeholder="Event location" />
            </Form.Item>

            <Form.Item 
              label="Ticket URL" 
              name="ticketUrl" 
              rules={[{ required: true, type: "url", message: 'Valid URL required' }]}
            >
              <Input placeholder="https://tickets.example.com" />
            </Form.Item>
          </div>

          {/* Flyer URL and Published Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
            <Form.Item 
              label="Flyer URL" 
              name="flyerUrl"
            >
              <Input placeholder="https://example.com/flyer.jpg" />
            </Form.Item>

            <Form.Item 
              label="Published" 
              name="isPublished" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </div>

          {/* Flyer Preview */}
          <Form.Item label="Flyer Preview">
            <div className="flex justify-center">
              {editingEvent?.flyerUrl ? (
                <img 
                  src={editingEvent.flyerUrl} 
                  alt="Event flyer" 
                  className="max-h-48 max-w-full object-contain rounded border border-slate-200 dark:border-slate-600" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="text-slate-400 text-center py-8">
                  No flyer uploaded
                </div>
              )}
            </div>
          </Form.Item>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              onClick={() => {
                setEditModalVisible(false);
                setEditingEvent(null);
                if (editForm) {
                  editForm.resetFields();
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
            >
              Update Event
            </Button>
          </div>
        </Form>
        </Modal>
      )}
    </div>
  );
}
