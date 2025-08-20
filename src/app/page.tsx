"use client";
import { useEffect, useState } from "react";
import EventCard from "@/components/EventCard";
import { Event } from "@prisma/client";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Hero Section Skeleton */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
            <div className="animate-pulse">
              <div className="h-16 md:h-20 w-80 md:w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-6"></div>
              <div className="h-6 md:h-8 w-96 md:w-[32rem] bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8"></div>
              <div className="flex flex-wrap justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Events Grid Skeleton */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4"></div>
              <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-soft h-full flex flex-col">
                  <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700 flex-shrink-0"></div>
                  <div className="p-4 sm:p-6 space-y-2 sm:space-y-3 flex-1 flex flex-col">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mt-auto"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-float-delayed"></div>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gradient mb-6 animate-fade-in">
            Live Events
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover amazing shows, concerts, and performances happening near you
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 group cursor-default">
              <CalendarDays className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" />
              <span className="group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Upcoming Events</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <MapPin className="w-4 h-4 text-red-500 group-hover:text-red-600 transition-colors" />
              <span className="group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Local Venues</span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <Ticket className="w-4 h-4 text-green-500 group-hover:text-green-600 transition-colors" />
              <span className="group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">Easy Booking</span>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {events.length === 0 ? "No Events Yet" : "Upcoming Events"}
          </h2>
          {events.length > 0 && (
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Don&apos;t miss out on these incredible experiences
            </p>
          )}
        </div>

        {events.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <CalendarDays className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No events scheduled yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for upcoming shows and performances
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr justify-items-center">
            {events.map((event, index) => (
              <div 
                key={event.id} 
                className="animate-slide-in-up w-full max-w-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      {events.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
              <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white rounded-full translate-x-8 -translate-y-8"></div>
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready for an amazing night out?
              </h3>
              <p className="text-lg text-blue-100 mb-6 max-w-2xl mx-auto">
                Book your tickets now and get ready to experience unforgettable live entertainment
              </p>
              <button className="group bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-large hover:shadow-xl transform hover:-translate-y-1 active:scale-95 focus-ring">
                <span className="inline-flex items-center gap-2">
                  Browse All Events
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
