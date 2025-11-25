"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

type CalendarProps = {
  bike: string;
  onSelectDate: (date: Date) => void;
  onMonthChange?: () => void;
  bookedExternal?: Set<string>; // optional preloaded booked ISO dates for this bike
};

function Calendar({ bike, onSelectDate, onMonthChange, bookedExternal }: CalendarProps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth()); // 0-11
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Limit navigation to current month up to current month + 2
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth();
  const maxRef = new Date(nowYear, nowMonth + 2, 1);
  const maxYear = maxRef.getFullYear();
  const maxMonth = maxRef.getMonth();

  const firstOfMonth = new Date(displayYear, displayMonth, 1);
  const monthName = firstOfMonth.toLocaleString(undefined, { month: "long" });
  const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
  const firstWeekday = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  const prevMonth = () => {
    // prevent going earlier than current month
    if (displayYear === nowYear && displayMonth === nowMonth) return;
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
    setSelectedDay(null);
    if (onMonthChange) onMonthChange();
  };

  const nextMonth = () => {
    // prevent going beyond current month + 2
    if (displayYear === maxYear && displayMonth === maxMonth) return;
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
    setSelectedDay(null);
    if (onMonthChange) onMonthChange();
  };

  const handleSelect = (day: number) => {
    const selected = new Date(displayYear, displayMonth, day);
    if (selected < startOfToday) return; // block past dates
    setSelectedDay(day);
    onSelectDate(selected);
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Initialize from external preloaded set if provided; otherwise fetch per-month
  useEffect(() => {
    if (bookedExternal) {
      setBookedSet(bookedExternal);
      if (onMonthChange) onMonthChange();
      return;
    }
    const y = displayYear;
    const m = displayMonth + 1;
    fetch(`/api/availability?bike=${encodeURIComponent(bike)}&year=${y}&month=${m}`)
      .then((r) => r.json())
      .then((json) => {
        const s = new Set<string>();
        if (json?.bookedDays) {
          for (const d of json.bookedDays as string[]) s.add(d);
        }
        setBookedSet(s);
        if (onMonthChange) onMonthChange();
      })
      .catch(() => setBookedSet(new Set()));
  }, [bike, displayYear, displayMonth, bookedExternal]);

  const atMin = displayYear === nowYear && displayMonth === nowMonth;
  const atMax = displayYear === maxYear && displayMonth === maxMonth;

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={prevMonth}
          aria-label="Previous month"
          disabled={atMin}
      style={{
            appearance: "none",
            border: "none",
            backgroundImage: atMin ? "none" : "linear-gradient(75deg, #172554 0%, #435078 100%)",
            backgroundColor: atMin ? "rgba(0,0,0,0.06)" : "transparent",
            color: atMin ? "rgba(0,0,0,0.45)" : "#ffffff",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: atMin ? "not-allowed" : "pointer",
            opacity: 1,
            fontFamily: "inherit",
          }}
        >
          ‹
        </button>
        <div style={{ fontWeight: 600 }}>{monthName} {displayYear}</div>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="Next month"
          disabled={atMax}
          style={{
            appearance: "none",
            border: "none",
            backgroundImage: atMax ? "none" : "linear-gradient(75deg, #172554 0%, #435078 100%)",
            backgroundColor: atMax ? "rgba(0,0,0,0.06)" : "transparent",
            color: atMax ? "rgba(0,0,0,0.45)" : "#ffffff",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: atMax ? "not-allowed" : "pointer",
            opacity: 1,
            fontFamily: "inherit",
          }}
        >
          ›
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {weekdayLabels.map((w) => (
          <div key={w} style={{ textAlign: "center", opacity: 0.9, fontSize: 12, color: "#000" }}>{w}</div>
        ))}
        {/* leading blanks */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(displayYear, displayMonth, day);
          const isPast = dateObj < startOfToday;
          const iso = new Date(Date.UTC(displayYear, displayMonth, day)).toISOString().slice(0, 10);
          const isAvailable = !bookedSet.has(iso);
          const isSelected = selectedDay === day && !isPast && isAvailable;
          return (
            <button
              key={day}
              type="button"
              onClick={() => !isPast && isAvailable && handleSelect(day)}
              disabled={isPast || !isAvailable}
              style={{
                height: 34,
                borderRadius: 6,
                border: "none",
                backgroundImage: isPast || !isAvailable
                  ? "none"
                  : (isSelected
                      ? "none"
                      : "linear-gradient(75deg, #172554 0%, #435078 100%)"),
                backgroundColor: isPast || !isAvailable
                  ? "rgba(0,0,0,0.06)"
                  : (isSelected ? "rgba(0,0,0,0.30)" : "transparent"),
                color: isPast || !isAvailable ? "rgba(0,0,0,0.45)" : "#ffffff",
                cursor: isPast || !isAvailable ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: 1,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Card({
  title,
  onBook,
  imageUrl,
  thirdContent,
  isExpanded,
}: {
  title: string;
  onBook: () => void;
  imageUrl?: string;
  thirdContent?: ReactNode;
  isExpanded?: boolean;
}) {
  return (
    <article
          style={{
            width: 350,
        minHeight: 160,
        backgroundImage: "none",
        backgroundColor: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
            border: "1px solid #f0f0f0f0",
            borderRadius: 8,
        boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
            padding: 12,
            boxSizing: "border-box",
            display: "grid",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
          gridTemplateRows: imageUrl ? "auto 200px 1fr auto" : "auto 1fr 1fr auto",
              gap: 8,
              height: "100%",
            }}
          >
            <div
              style={{
                border: "none",
                borderRadius: 6,
                padding: 8,
                backgroundImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                color: "#ffffff",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                fontSize: 16,
                lineHeight: 1,
              }}
            >
          {title}
            </div>
            <div
              style={{
                border: "none",
                borderRadius: 6,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${title} image`}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 6, display: "block" }}
                />
              ) : null}
            </div>
            <div
              style={{
                border: "none",
                borderRadius: 6,
                padding: 0,
                color: "#000",
              }}
            >
              {thirdContent || null}
        </div>
        <div
          style={{
                border: "none",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: 0,
            gap: 0,
          }}
        >
          <button
            type="button"
            onClick={onBook}
            style={{
              appearance: "none",
              border: "none",
              backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
              color: "#ffffff",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 16,
              lineHeight: 1,
              fontWeight: 400,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>Book</span>
            <span
              aria-hidden
              className={`arrow-dot ${isExpanded ? "up" : "down"}`}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [expandedOne, setExpandedOne] = useState(false);
  const [expandedTwo, setExpandedTwo] = useState(false);
  const [expandedThree, setExpandedThree] = useState(false);
  const [bookedByBike, setBookedByBike] = useState<Record<string, Set<string>> | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/availability?all=1");
        const json = await res.json().catch(() => ({}));
        const booked = (json as any)?.bookedByBike || {};
        const map: Record<string, Set<string>> = {};
        for (const k in booked) {
          map[k] = new Set(booked[k]);
        }
        if (!cancelled) setBookedByBike(map);
      } catch {
        if (!cancelled) setBookedByBike(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [selectedDateOne, setSelectedDateOne] = useState<string | null>(null);
  const [selectedDateTwo, setSelectedDateTwo] = useState<string | null>(null);
  const [selectedDateThree, setSelectedDateThree] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [statusOne, setStatusOne] = useState<null | { type: "error" | "success"; message: string }>(null);
  const [statusTwo, setStatusTwo] = useState<null | { type: "error" | "success"; message: string }>(null);
  const [statusThree, setStatusThree] = useState<null | { type: "error" | "success"; message: string }>(null);
  const [showBikes, setShowBikes] = useState(false);
  const [showBikers, setShowBikers] = useState(false);
  const [bikers, setBikers] = useState<Array<{ email: string; favourite_bike: string; booking_count: number }>>([]);
  const [bikersLoading, setBikersLoading] = useState(false);

  const resetBookingState = () => {
    setExpandedOne(false);
    setExpandedTwo(false);
    setExpandedThree(false);
    setSelectedDateOne(null);
    setSelectedDateTwo(null);
    setSelectedDateThree(null);
    setStatusOne(null);
    setStatusTwo(null);
    setStatusThree(null);
  };

  function friendlyBikeName(id: string) {
    const key = String(id || "").toLowerCase();
    if (key === "bike-one" || key === "1") return "beige city";
    if (key === "bike-two" || key === "2") return "blue mountain";
    if (key === "bike-three" || key === "3") return "grey city";
    return key;
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 16,
        overflowX: "hidden",
      }}
    >
      <main style={{ display: "grid", gap: 16 }}>
        {/* bookings preloaded in useEffect */}
        {/* Transparent container with two black-bordered rectangles */}
        <section
          aria-label="top panel"
          style={{
            width: 350,
            backgroundColor: "transparent",
            border: "none",
            borderRadius: 8,
            padding: 0,
            boxSizing: "border-box",
            position: "sticky",
            top: 0,
            zIndex: 10,
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 8,
            }}
          >
            <div
              style={{
                border: "none",
                borderRadius: 6,
                minHeight: 64,
                backgroundColor: "transparent",
                padding: 10,
                color: "#000",
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 36, letterSpacing: 0.2 }}>
                Stanford Bike
                <br />
                Registry
              </div>
            </div>
            <div
              style={{
                border: "none",
                borderRadius: 6,
                minHeight: 44,
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                padding: 10,
                color: "#000",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const next = !showBikes;
                  setShowBikes(next);
                  setShowAbout(false);
                  setShowBikers(false);
                  resetBookingState();
                }}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                view bikes
              </button>
              <button
                type="button"
                onClick={async () => {
                  const next = !showBikers;
                  setShowBikers(next);
                  setShowBikes(false);
                  setShowAbout(false);
                  resetBookingState();
                  if (next) {
                    if (bikers.length === 0) {
                      try {
                        setBikersLoading(true);
                        const res = await fetch("/api/bikers");
                        const json = await res.json();
                        setBikers(Array.isArray(json?.topBikers) ? json.topBikers : []);
                      } catch {
                        setBikers([]);
                      } finally {
                        setBikersLoading(false);
                      }
                    } else {
                      setBikersLoading(false);
                    }
                  } else {
                    setBikersLoading(false);
                  }
                }}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                top bikers
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAbout((v) => !v);
                  setShowBikes(false);
                  setShowBikers(false);
                  resetBookingState();
                }}
                style={{
                  appearance: "none",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 14,
                }}
              >
                about
              </button>
            </div>
          </div>
        </section>

        {showBikes ? (
        <div style={{ display: "grid", gap: 16 }}>
        {/* Card One */}
          <Card
            title="Beige City Bike"
            onBook={() => setExpandedOne((v) => !v)}
            imageUrl="/images/creamcitybike.jpg"
            isExpanded={expandedOne}
            thirdContent={
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Make &amp; Model</div>
                    <div>Schwinn Gateway 700c/28"</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Size</div>
                    <div>M</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Serial #</div>
                    <div style={{ color: "#000" }}>SNFSD24E47497</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Police ID</div>
                    <div style={{ color: "#000" }}>110419</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Location</div>
                    <div>rains</div>
                  </div>
                </div>
              </div>
            }
          />
          {expandedOne ? (
            <section
              aria-label="booking panel"
              style={{
                width: 350,
                minHeight: 120,
                backgroundImage: "none",
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid #f0f0f0f0",
                borderRadius: 8,
                boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                padding: 12,
                boxSizing: "border-box",
                color: "#000000",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Calendar
                  bike="bike-one"
                  bookedExternal={bookedByBike?.["bike-one"]}
                  onSelectDate={(d) => setSelectedDateOne(d.toISOString().slice(0, 10))}
                  onMonthChange={() => setSelectedDateOne(null)}
                />
                {selectedDateOne ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`email-one`} style={{ opacity: 0.95 }}>
                      Enter your email for {selectedDateOne}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        className="booking-email-input"
                        id={`email-one`}
                        type="email"
                        placeholder="you@stanford.edu"
                        style={{
                          appearance: "none",
                          width: "100%",
                          boxSizing: "border-box",
                          borderRadius: 6,
                          border: "none",
                          padding: "8px 10px",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          color: "rgba(0,0,0,0.45)",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setStatusOne(null);
                          const email = (document.getElementById("email-one") as HTMLInputElement)?.value || "";
                          if (!/@(?:[a-z0-9-]+\.)*stanford\.edu$/i.test(email)) {
                            setStatusOne({ type: "error", message: "Please use a stanford.edu email" });
                            return;
                          }
                          try {
                            const res = await fetch("/api/book", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ bike: "bike-one", email, day: selectedDateOne }),
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setStatusOne({ type: "error", message: json?.error || "Booking failed" });
                            } else {
                              setStatusOne({ type: "success", message: "Booking successful! Check your email for details on your bike" });
                            }
                          } catch {
                            setStatusOne({ type: "error", message: "Network error. Please try again." });
                          }
                        }}
                        style={{
                          appearance: "none",
                          border: "none",
                          backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
                          color: "#ffffff",
                          borderRadius: 6,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                    {statusOne ? (
                      <div
                        style={{
                          marginTop: 8,
                          color: statusOne.type === "error" ? "#ef4444" : "#10b981",
                          fontSize: 13,
                        }}
                      >
                        {statusOne.message}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
        ) : null}

        {showAbout ? (
          <section aria-label="about panel" style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                width: 350,
                minHeight: 80,
                border: "none",
                borderRadius: 8,
                backgroundImage: "none",
                backgroundColor: "transparent",
                padding: 12,
                boxSizing: "border-box",
                color: "#000000",
                whiteSpace: "pre-wrap",
                lineHeight: 1.4,
                boxShadow: "none",
                fontStyle: "italic",
                fontSize: 15,
              }}
            >
              {`At a banquet honoring the contestants, the host rose amid thunderous applause to toast not only Carconade but also the invention of the hour: "To the velocipede, gentlemen, that ingenious and charming machine, by now a faithful friend and inseparable companion to the solitary and weary traveler. To that useful invention, bequeathed by science to a stunned and grateful world. Yes, gentlemen, let us drink to this carriage of the future. To its perfection, to its success, and to its long and useful existence."`}
              <div style={{ marginTop: 6, fontSize: 15, fontStyle: "normal" }}>— Bicycle: The History</div>
            </div>
            <div
              style={{
                width: 350,
                backgroundImage: "none",
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: 8,
                boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                padding: 12,
                boxSizing: "border-box",
                color: "#000",
              }}
            >
              <div
                style={{
                  border: "none",
                borderRadius: 6,
                  padding: 8,
                  backgroundImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                  color: "#ffffff",
                  textAlign: "left",
                  marginBottom: 8,
                }}
              >
                An ongoing series of campus curiosities
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ marginLeft: 10, color: "#000", fontWeight: 400 }}>
                  <a
                    href="https://stanfordlabregistry.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    Stanford Lab Registry
                    </a>
                  </div>
                <div style={{ marginLeft: 10, color: "#000", fontWeight: 400 }}>
                  <a
                    href="https://chat.whatsapp.com/Cl0sBkB9wivHKanOJNHAIN?mode=ems_share_c"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    SU&nbsp;Buffet&nbsp;Response&nbsp;Team
                  </a>
                </div>
                <div style={{ marginLeft: 10, color: "#000", fontWeight: 400 }}>
                  <a
                    href="https://stanfordbikeregistry.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: "inherit",
                      textDecoration: "underline",
                    }}
                  >
                    Stanford&nbsp;Bike&nbsp;Registry
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {showBikes ? (
        <div style={{ display: "grid", gap: 16 }}>
        {/* Card Two */}
          <Card
            title="Blue Mountain Bike"
            onBook={() => setExpandedTwo((v) => !v)}
            imageUrl="/images/bluemountainbike.jpg"
            isExpanded={expandedTwo}
            thirdContent={
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Make &amp; Model</div>
                    <div>Marin Bolinad Ridge 1 29"</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Size</div>
                    <div>L</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Serial #</div>
                    <div>C21067624</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Police ID</div>
                    <div>110591</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Location</div>
                    <div>rains</div>
                  </div>
                </div>
              </div>
            }
          />
          {expandedTwo ? (
            <section
              aria-label="booking panel"
              style={{
                width: 350,
                minHeight: 120,
                backgroundImage: "none",
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid #f0f0f0f0",
                borderRadius: 8,
                boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                padding: 12,
                boxSizing: "border-box",
                color: "#000000",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Calendar
                  bike="bike-two"
                  bookedExternal={bookedByBike?.["bike-two"]}
                  onSelectDate={(d) => setSelectedDateTwo(d.toISOString().slice(0, 10))}
                  onMonthChange={() => setSelectedDateTwo(null)}
                />
                {selectedDateTwo ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`email-two`} style={{ opacity: 0.95 }}>
                      Enter your email for {selectedDateTwo}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        className="booking-email-input"
                        id={`email-two`}
                        type="email"
                        placeholder="you@stanford.edu"
                        style={{
                          appearance: "none",
                          width: "100%",
                          boxSizing: "border-box",
                          borderRadius: 6,
                          border: "none",
                          padding: "8px 10px",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          color: "rgba(0,0,0,0.45)",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setStatusTwo(null);
                          const email = (document.getElementById("email-two") as HTMLInputElement)?.value || "";
                          if (!/@(?:[a-z0-9-]+\.)*stanford\.edu$/i.test(email)) {
                            setStatusTwo({ type: "error", message: "Please use a stanford.edu email" });
                            return;
                          }
                          try {
                            const res = await fetch("/api/book", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ bike: "bike-two", email, day: selectedDateTwo }),
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setStatusTwo({ type: "error", message: json?.error || "Booking failed" });
                            } else {
                              setStatusTwo({ type: "success", message: "Booking successful! Check your email for details on your bike" });
                            }
                          } catch {
                            setStatusTwo({ type: "error", message: "Network error. Please try again." });
                          }
                        }}
                        style={{
                          appearance: "none",
                          border: "none",
                          backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
                          color: "#ffffff",
                          borderRadius: 6,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                    {statusTwo ? (
                      <div
                        style={{
                          marginTop: 8,
                          color: statusTwo.type === "error" ? "#ef4444" : "#10b981",
                          fontSize: 13,
                        }}
                      >
                        {statusTwo.message}
                      </div>
                    ) : null}
                  </div>
                ) : null}
          </div>
            </section>
          ) : null}
          {/* Card Three */}
          <Card
            title="Grey City Bike"
            onBook={() => setExpandedThree((v) => !v)}
            imageUrl="/images/greycitybike.jpg"
            isExpanded={expandedThree}
            thirdContent={
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "5fr 1fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Make &amp; Model</div>
                    <div>Jamis Coda Comp</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Size</div>
                    <div>S</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: 8 }}>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Serial #</div>
                    <div style={{ color: "#000" }}>WLH010545M</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Police ID</div>
                    <div style={{ color: "#000" }}>—</div>
                  </div>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 6, padding: "6px 8px" }}>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Location</div>
                    <div>cal train</div>
                  </div>
                </div>
              </div>
            }
          />
          {expandedThree ? (
            <section
              aria-label="booking panel"
              style={{
                width: 350,
                minHeight: 120,
                backgroundImage: "none",
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid #f0f0f0f0",
                borderRadius: 8,
                boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                padding: 12,
                boxSizing: "border-box",
                color: "#000000",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Calendar
                  bike="bike-three"
                  bookedExternal={bookedByBike?.["bike-three"]}
                  onSelectDate={(d) => setSelectedDateThree(d.toISOString().slice(0, 10))}
                  onMonthChange={() => setSelectedDateThree(null)}
                />
                {selectedDateThree ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`email-three`} style={{ opacity: 0.95 }}>
                      Enter your email for {selectedDateThree}
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
                      <input
                        className="booking-email-input"
                        id={`email-three`}
                        type="email"
                        placeholder="you@stanford.edu"
                        style={{
                          appearance: "none",
                          width: "100%",
                          boxSizing: "border-box",
                          borderRadius: 6,
                          border: "none",
                          padding: "8px 10px",
                          backgroundColor: "rgba(0,0,0,0.06)",
                          color: "rgba(0,0,0,0.45)",
                          outline: "none",
                          fontFamily: "inherit",
                        }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          setStatusThree(null);
                          const email = (document.getElementById("email-three") as HTMLInputElement)?.value || "";
                          if (!/@(?:[a-z0-9-]+\.)*stanford\.edu$/i.test(email)) {
                            setStatusThree({ type: "error", message: "Please use a stanford.edu email" });
                            return;
                          }
                          try {
                            const res = await fetch("/api/book", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ bike: "bike-three", email, day: selectedDateThree }),
                            });
                            const json = await res.json().catch(() => ({}));
                            if (!res.ok) {
                              setStatusThree({ type: "error", message: (json as any)?.error || "Booking failed" });
                            } else {
                              setStatusThree({ type: "success", message: "Booking successful! Check your email for details on your bike" });
                            }
                          } catch {
                            setStatusThree({ type: "error", message: "Network error. Please try again." });
                          }
                        }}
                        style={{
                          appearance: "none",
                          border: "none",
                          backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
                          color: "#ffffff",
                          borderRadius: 6,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Confirm
                      </button>
                    </div>
                    {statusThree ? (
                      <div
                        style={{
                          marginTop: 8,
                          color: statusThree.type === "error" ? "#ef4444" : "#10b981",
                          fontSize: 13,
                        }}
                      >
                        {statusThree.message}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
        ) : null}
        {showBikes ? (
        <div
          aria-label="spacer"
          style={{
            width: 350,
            minHeight: 300,
            backgroundColor: "transparent",
            border: "none",
            borderRadius: 8,
          }}
        />
        ) : null}

        {showBikers ? (
          <section aria-label="bikers panel" style={{ display: "grid", gap: 8 }}>
            {bikersLoading ? (
              <div
                style={{
                  width: 350,
                  border: "1px solid #f0f0f0f0",
                  borderRadius: 8,
                  backgroundImage: "none",
                  backgroundColor: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  boxSizing: "border-box",
                  boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                  overflow: "hidden",
                }}
              >
                <style>{`
                  @keyframes skeletonPulse {
                    0% { opacity: 0.55; }
                    50% { opacity: 0.9; }
                    100% { opacity: 0.55; }
                  }
                `}</style>
                {/* Header area with gradient bg and three white chips */}
                <div
                  style={{
                    position: "relative",
                    padding: 10,
                    borderBottom: "1px solid rgba(0,0,0,0.12)",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: "3fr 3fr 2fr",
                      alignItems: "center",
                      textAlign: "left",
                      columnGap: 8,
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                        height: 18,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                        height: 18,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "end",
                        maxWidth: "100%",
                        height: 18,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                  </div>
                </div>
                {/* Body rows with same grid, borders, and a gradient chip in first col */}
                {[...Array(6)].map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 3fr 2fr",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      textAlign: "left",
                      borderTop: "1px solid rgba(0,0,0,0.12)",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
                        color: "transparent",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                        height: 18,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        backgroundColor: "rgba(0,0,0,0.06)",
                        borderRadius: 6,
                        height: 16,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                    <span
                      style={{
                        justifySelf: "end",
                        textAlign: "right",
                        backgroundColor: "rgba(0,0,0,0.06)",
                        borderRadius: 6,
                        height: 16,
                        width: 32,
                        animation: "skeletonPulse 1200ms ease-in-out infinite",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : bikers.length === 0 ? (
              <div style={{ width: 350, color: "#000" }}>No bikers yet.</div>
            ) : (
              <div
                style={{
                  width: 350,
                  border: "1px solid #f0f0f0f0",
                  borderRadius: 8,
                  backgroundImage: "none",
                  backgroundColor: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  boxSizing: "border-box",
                  boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    padding: 10,
                    borderBottom: "1px solid #f0f0f0f0",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />
                  <div
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: "3fr 3fr 2fr",
                      alignItems: "center",
                      textAlign: "left",
                      columnGap: 8,
                      fontWeight: 600,
                      color: "#ffffff",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        color: "#000",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                      }}
                    >
                      biker
                    </span>
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        color: "#000",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                      }}
                    >
                      fav bike
                    </span>
                    <span
                      style={{
                        backgroundColor: "rgba(255,255,255,0.90)",
                        color: "#000",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "end",
                        maxWidth: "100%",
                      }}
                    >
                      bookings
                    </span>
                  </div>
                </div>
                {bikers.map((b, idx) => (
                  <div
                    key={b.email + idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "3fr 3fr 2fr",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      color: "#000",
                      textAlign: "left",
                      borderTop: idx ? "1px solid #f0f0f0f0" : "none",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        backgroundImage: "linear-gradient(75deg, #172554 0%, #435078 100%)",
                        color: "#ffffff",
                        borderRadius: 6,
                        padding: "4px 8px",
                        lineHeight: 1,
                        display: "inline-block",
                        justifySelf: "start",
                        maxWidth: "100%",
                      }}
                    >
                      {b.email}
                    </span>
                    <span>{friendlyBikeName(b.favourite_bike)}</span>
                    <span style={{ justifySelf: "end", textAlign: "right" }}>{b.booking_count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
        {showBikers ? (
          <div
            aria-label="spacer"
            style={{
              width: 350,
              minHeight: 300,
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 8,
            }}
          />
        ) : null}
      </main>
      {showAbout ? (
        <div
          aria-label="ver-natus-sticker"
          style={{
            position: "fixed",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 40,
            zIndex: 4,
            backgroundColor: "#e6e6e6",
            color: "#000000",
            fontSize: 14,
            padding: "2px 6px",
            borderRadius: 0,
            lineHeight: 1,
            boxShadow: "none",
            pointerEvents: "none",
          }}
        >
          Ver Natus
        </div>
      ) : null}
    </div>
  );
}


