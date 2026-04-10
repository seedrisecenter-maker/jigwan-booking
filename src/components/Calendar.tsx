'use client';

import { useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Activity, ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_LABELS } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface CalendarViewProps {
  activities: Activity[];
}

export default function CalendarView({ activities }: CalendarViewProps) {
  const router = useRouter();
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      calendarRef.current?.getApi().updateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const events = activities.map(activity => {
    const locationName = activity.location?.name ?? '';
    const remaining = activity.max_participants - (activity.reservation_count ?? 0);
    const isFull = remaining <= 0;

    return {
      id: activity.id,
      title: activity.title,
      start: activity.start_date,
      end: activity.end_date,
      backgroundColor: isFull ? '#9CA3AF' : ACTIVITY_TYPE_COLORS[activity.activity_type],
      borderColor: isFull ? '#9CA3AF' : ACTIVITY_TYPE_COLORS[activity.activity_type],
      extendedProps: {
        activity,
        locationName,
        typeLabel: ACTIVITY_TYPE_LABELS[activity.activity_type],
        remaining,
        isFull,
      },
    };
  });

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
        eventContent={(arg) => {
          const { locationName, typeLabel, remaining, isFull } = arg.event.extendedProps;
          return (
            <div className="px-1 py-0.5 overflow-hidden cursor-pointer">
              <div className="text-[11px] font-bold truncate leading-tight">
                {arg.event.title}
              </div>
              <div className="text-[10px] opacity-80 truncate leading-tight">
                {locationName && <span>{locationName}</span>}
                {locationName && typeLabel && <span> · </span>}
                <span>{typeLabel}</span>
                {isFull
                  ? <span className="ml-1 font-bold">마감</span>
                  : <span className="ml-1">{remaining}석</span>
                }
              </div>
            </div>
          );
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
