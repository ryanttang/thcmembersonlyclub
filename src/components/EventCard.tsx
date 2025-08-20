import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Clock, ExternalLink, Ticket } from "lucide-react";
import { fmtDate } from "@/lib/utils";
import { Event } from "@prisma/client";

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-soft hover:shadow-large transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700 w-full max-w-sm mx-auto h-full flex flex-col card-hover">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0">
        <Image
          src={event.flyerUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 300px"
          priority={false}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Date Badge */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {new Date(event.date).getDate()}
          </div>
        </div>

        {/* Ticket Button Overlay */}
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Link 
            href={event.ticketUrl} 
            target="_blank"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-medium focus-ring"
          >
            <Ticket className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Get Tickets</span>
            <span className="sm:hidden">Tickets</span>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
          {event.title}
        </h3>

        {/* Event Details */}
        <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 mb-3 sm:mb-4 flex-1">
          {/* Date */}
          <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
            <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">{fmtDate(new Date(event.date))}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs sm:text-sm line-clamp-1">{event.location}</span>
          </div>

          {/* Time */}
          {event.startTime && (
            <div className="flex items-center gap-2 sm:gap-3 text-gray-600 dark:text-gray-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{event.startTime}</span>
            </div>
          )}
        </div>

        {/* Ticket Button - Mobile */}
        <div className="md:hidden mt-auto">
          <Link 
            href={event.ticketUrl} 
            target="_blank"
            className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 hover:shadow-medium active:scale-95 focus-ring"
          >
            <Ticket className="w-3 h-3 sm:w-4 sm:h-4" />
            Get Tickets
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-colors duration-300 pointer-events-none"></div>
      
      {/* Gradient Corner Accent */}
      <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-bl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
}
