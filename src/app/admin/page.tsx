"use client";
import { useState } from "react";
import {
  Form, Input, Button, Upload, Typography, Space,
  DatePicker, TimePicker, Switch, message, Divider
} from "antd";
import type { UploadProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title } = Typography;
const { Dragger } = Upload;

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
  const [token, setToken] = useState("");
  const [flyerUrl, setFlyerUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadProps: UploadProps = {
    name: "file",
    accept: "image/*",
    multiple: false,
    customRequest: async ({ file, onSuccess }) => {
      try {
        setUploading(true);
        const fd = new FormData();
        fd.set("file", file as File);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        const { url } = await res.json();
        setFlyerUrl(url);
        if (onSuccess) {
          onSuccess({ url }, new XMLHttpRequest());
        }
        message.success("Flyer uploaded");
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Upload error";
        message.error(errorMessage);
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
      message.success("Event created");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error creating event";
      message.error(errorMessage);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Title level={3}>Admin — New Event</Title>

        <Input.Password
          placeholder="Admin Token (ADMIN_TOKEN)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <Divider orientation="left">1) Upload Flyer</Divider>
        <Dragger {...uploadProps} disabled={!token}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag image to upload</p>
          <p className="ant-upload-hint">PNG/JPG, local or S3 depending on env</p>
        </Dragger>
        <Input
          placeholder="Or paste flyer URL"
          value={flyerUrl}
          onChange={(e) => setFlyerUrl(e.target.value)}
        />
        {flyerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flyerUrl} alt="preview" style={{ maxHeight: 320, borderRadius: 12 }} />
        )}

        <Divider orientation="left">2) Create Event</Divider>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ isPublished: true }}>
          <Form.Item label="Title" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Form.Item label="Date" name="date" rules={[{ required: true }]}> 
              <DatePicker />
            </Form.Item>
            <Form.Item label="Start Time" name="startTime">
              <TimePicker use12Hours format="h:mm A" />
            </Form.Item>
            <Form.Item label="End Time" name="endTime">
              <TimePicker use12Hours format="h:mm A" />
            </Form.Item>
          </div>
          <Form.Item label="Location" name="location" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Ticket URL" name="ticketUrl" rules={[{ required: true, type: "url" }]}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item label="Flyer URL" name="flyerUrl">
            <Input value={flyerUrl} onChange={(e)=>setFlyerUrl(e.target.value)} />
          </Form.Item>
          <Form.Item label="Published" name="isPublished" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>Create Event</Button>
          </Form.Item>
        </Form>
      </Space>
    </main>
  );
}
