"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { Row, Col, Typography } from "antd";
import { Event } from "@prisma/client";

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events");
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Paragraph>Loading events...</Paragraph>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Events</Title>
        <Paragraph type="secondary">Upcoming and recent shows.</Paragraph>
      </header>
      {events.length === 0 ? (
        <Paragraph type="secondary">No events yet.</Paragraph>
      ) : (
        <Row gutter={[16, 16]}>
          {events.map((e) => (
            <Col key={e.id} xs={24} sm={12} lg={8}>
              <EventCard event={e} />
            </Col>
          ))}
        </Row>
      )}
    </main>
  );
}
