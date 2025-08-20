import Image from "next/image";
import Link from "next/link";
import { Card, Button, Space, Typography } from "antd";
import { fmtDate } from "@/lib/utils";
import { Event } from "@prisma/client";

const { Text } = Typography;

export default function EventCard({ event }: { event: Event }) {
  return (
    <Card
      hoverable
      cover={
        <div className="relative aspect-[4/5]">
          <Image
            src={event.flyerUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      }
      styles={{ body: { padding: 16 } }}
    >
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Text strong className="line-clamp-1">{event.title}</Text>
        <Text type="secondary">{fmtDate(new Date(event.date))}</Text>
        <Text className="line-clamp-2">
          {event.location}
          {event.startTime ? ` • ${event.startTime}` : ""}
        </Text>
        <Link href={event.ticketUrl} target="_blank">
          <Button block type="primary">Get Tickets</Button>
        </Link>
      </Space>
    </Card>
  );
}
