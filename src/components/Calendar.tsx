'use client';

import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Activity, ACTIVITY_TYPE_COLORS } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface CalendarViewProps {
  activities: Activity[];
}

export default function CalendarView({ activities }: CalendarViewProps) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    // Force resize on mount for iframe compatibility
    const timer = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const events = activities.map(activity => ({
    id: activity.id,
    title: activity.title,
    start: activity.start_date,
    end: activity.end_date,
    backgroundColor: ACTIVITY_TYPE_COLORS[activity.activity_type],
    borderColor: ACTIVITY_TYPE_COLORS[activity.activity_type],
    extendedProps: { activity },
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        locale="ko"
        events={events}
        dateClick={(info) => {
          router.push(`/activities/new?date=${info.dateStr}`);
        }}
        eventClick={(info) => {
          router.push(`/activities/${info.event.id}`);
        }}
        height="auto"
        dayMaxEvents={3}
        buttonText={{
          today: '오늘',
          month: '월',
          week: '주',
        }}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
      />
    </div>
  );
}
