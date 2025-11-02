"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

type CalendarProps = {
  bike: string;
  onSelectDate: (date: Date) => void;
  onMonthChange?: () => void;
};

function Calendar({ bike, onSelectDate, onMonthChange }: CalendarProps) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [displayYear, setDisplayYear] = useState(now.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(now.getMonth()); // 0-11
  const [bookedSet, setBookedSet] = useState<Set<string>>(new Set());

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
    if (onMonthChange) onMonthChange();
  };

  const handleSelect = (day: number) => {
    const selected = new Date(displayYear, displayMonth, day);
    if (selected < startOfToday) return; // block past dates
    onSelectDate(selected);
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Fetch already-booked days on month/bike change
  useEffect(() => {
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
  }, [bike, displayYear, displayMonth]);

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
            border: "1px solid rgba(255,255,255,0.8)",
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#ffffff",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: atMin ? "not-allowed" : "pointer",
            opacity: atMin ? 0.5 : 1,
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
            border: "1px solid rgba(255,255,255,0.8)",
            backgroundColor: "rgba(255,255,255,0.08)",
            color: "#ffffff",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: atMax ? "not-allowed" : "pointer",
            opacity: atMax ? 0.5 : 1,
          }}
        >
          ›
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {weekdayLabels.map((w) => (
          <div key={w} style={{ textAlign: "center", opacity: 0.9, fontSize: 12 }}>{w}</div>
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
          return (
            <button
              key={day}
              type="button"
              onClick={() => !isPast && isAvailable && handleSelect(day)}
              disabled={isPast || !isAvailable}
              style={{
                height: 34,
                borderRadius: 6,
                border: isPast || !isAvailable ? "1px solid rgba(255,255,255,0.35)" : "1px solid rgba(255,255,255,0.75)",
                backgroundColor: isPast || !isAvailable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.12)",
                color: isPast || !isAvailable ? "rgba(255,255,255,0.45)" : "#ffffff",
                cursor: isPast || !isAvailable ? "not-allowed" : "pointer",
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

function Card({ title, onBook, imageUrl, thirdContent }: { title: string; onBook: () => void; imageUrl?: string; thirdContent?: ReactNode }) {
  return (
    <article
          style={{
            width: 350,
        minHeight: 160,
        backgroundImage: "none",
        backgroundColor: "rgba(255,255,255,0.25)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.9)",
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
              }}
            >
          {title}
            </div>
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.85)",
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
                border: "1px solid rgba(255,255,255,0.85)",
                borderRadius: 6,
                padding: 8,
                color: "#000",
              }}
            >
              {thirdContent || null}
            </div>
        <div
          style={{
                border: "1px solid rgba(255,255,255,0.85)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: 8,
            gap: 8,
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
            }}
          >
            book
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [expandedOne, setExpandedOne] = useState(false);
  const [expandedTwo, setExpandedTwo] = useState(false);
  const [selectedDateOne, setSelectedDateOne] = useState<string | null>(null);
  const [selectedDateTwo, setSelectedDateTwo] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [statusOne, setStatusOne] = useState<null | { type: "error" | "success"; message: string }>(null);
  const [statusTwo, setStatusTwo] = useState<null | { type: "error" | "success"; message: string }>(null);
  const [showBikes, setShowBikes] = useState(false);
  const [showBikers, setShowBikers] = useState(false);
  const [bikers, setBikers] = useState<Array<{ email: string; favourite_bike: string; booking_count: number }>>([]);
  const [bikersLoading, setBikersLoading] = useState(false);

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
              <div style={{ fontSize: 36, letterSpacing: 0.2 }}>Stanford Free Bike Registry</div>
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
                  setShowBikes((v) => !v);
                  setShowAbout(false);
                  setShowBikers(false);
                  setExpandedOne(false); setExpandedTwo(false);
                  setSelectedDateOne(null); setSelectedDateTwo(null);
                  setStatusOne(null); setStatusTwo(null);
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
                  setExpandedOne(false); setExpandedTwo(false);
                  setSelectedDateOne(null); setSelectedDateTwo(null);
                  setStatusOne(null); setStatusTwo(null);
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
                  setExpandedOne(false); setExpandedTwo(false);
                  setSelectedDateOne(null); setSelectedDateTwo(null);
                  setStatusOne(null); setStatusTwo(null);
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
          <Card title="BIKE ONE" onBook={() => setExpandedOne((v) => !v)} />
          {expandedOne ? (
            <section
              aria-label="booking panel"
              style={{
                width: 350,
                minHeight: 120,
                backgroundImage:
                  "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 6px 14px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.12)",
                padding: 12,
                boxSizing: "border-box",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Calendar
                  bike="bike-one"
                  onSelectDate={(d) => setSelectedDateOne(d.toISOString().slice(0, 10))}
                  onMonthChange={() => setSelectedDateOne(null)}
                />
                {selectedDateOne ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`email-one`} style={{ opacity: 0.95 }}>
                      Enter your email for {selectedDateOne}
                    </label>
                    <input
                      id={`email-one`}
                      type="email"
                      placeholder="you@example.com"
                      style={{
                        appearance: "none",
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.85)",
                        padding: "8px 10px",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        outline: "none",
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
                        backgroundColor: "#5f6a8e",
                        color: "#ffffff",
                        borderRadius: 6,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        marginTop: 6,
                      }}
                    >
                      Confirm booking
                    </button>
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
                border: "6px solid transparent",
                borderRadius: 8,
                borderImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%) 1",
                backgroundColor: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                  color: "#000000",
                padding: 12,
                boxSizing: "border-box",
                boxShadow: "none",
              }}
            >
              <div style={{ marginBottom: 8 }}>An ongoing series of campus curiosities:</div>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                <li>
                  Stanford Lab Regsitry (
                  <a href="https://stanfordlabregistry.com" target="_blank" rel="noreferrer" style={{ color: "inherit", textDecoration: "underline" }}>
                    stanfordlabregistry.com
                  </a>
                  )
                </li>
                <li>
                  SU Buffet Response Team (
                  <a href="#" style={{ color: "inherit", textDecoration: "underline" }}>
                    whatsapp link
                  </a>
                  )
                </li>
                <li>Stanford Free Bike Registry</li>
              </ul>
            </div>
            <div
              style={{
                width: 350,
                minHeight: 44,
                border: "none",
                borderRadius: 8,
                backgroundImage: "none",
                backgroundColor: "transparent",
                padding: 12,
                boxSizing: "border-box",
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                boxShadow: "none",
                fontSize: 15,
              }}
            >
              Ver Natus
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
            thirdContent={
              <div>
                <div>Make Model: Marin Bolinad Ridge 1 L 29"</div>
                <div>Some of the gears work, brakes work.</div>
                <div>Police ID: 110591</div>
                <div>Serial Number: C21067624</div>
              </div>
            }
          />
          {expandedTwo ? (
            <section
              aria-label="booking panel"
              style={{
                width: 350,
                minHeight: 120,
                backgroundImage:
                  "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                border: "none",
                borderRadius: 8,
                boxShadow: "0 6px 14px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.12)",
                padding: 12,
                boxSizing: "border-box",
                color: "#ffffff",
              }}
            >
              <div style={{ display: "grid", gap: 12 }}>
                <Calendar
                  bike="bike-two"
                  onSelectDate={(d) => setSelectedDateTwo(d.toISOString().slice(0, 10))}
                  onMonthChange={() => setSelectedDateTwo(null)}
                />
                {selectedDateTwo ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    <label htmlFor={`email-two`} style={{ opacity: 0.95 }}>
                      Enter your email for {selectedDateTwo}
                    </label>
                    <input
                      id={`email-two`}
                      type="email"
                      placeholder="you@example.com"
                      style={{
                        appearance: "none",
                        width: "100%",
                        boxSizing: "border-box",
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.85)",
                        padding: "8px 10px",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        outline: "none",
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
                        backgroundColor: "#5f6a8e",
                        color: "#ffffff",
                        borderRadius: 6,
                        padding: "8px 12px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        marginTop: 6,
                      }}
                    >
                      Confirm booking
                    </button>
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
        </div>
        ) : null}

        {showBikers ? (
          <section aria-label="bikers panel" style={{ display: "grid", gap: 8 }}>
            <div
              style={{
                width: 350,
                backgroundImage: "linear-gradient(75deg, #172554 0%, #a2acc3 100%)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.9)",
                borderRadius: 6,
                minHeight: 44,
                padding: 10,
                boxSizing: "border-box",
                boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
                display: "flex",
                alignItems: "center",
                textAlign: "left",
              }}
            >
              Name — fav bike — # of bookings
            </div>
            {bikersLoading ? (
              <div style={{ width: 350, color: "#000" }}>Loading…</div>
            ) : bikers.length === 0 ? (
              <div style={{ width: 350, color: "#000" }}>No bikers yet.</div>
            ) : (
              bikers.map((b, idx) => (
                <div
                  key={b.email + idx}
                  style={{
                    width: 350,
                    border: "1px solid rgba(255,255,255,0.9)",
                    borderRadius: 8,
                    backgroundImage: "none",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    padding: 6,
                    boxSizing: "border-box",
                    color: "#000",
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                    boxShadow: "-3px 3px 0 rgba(0,0,0,0.75)",
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
                    }}
                  >
                    {b.email}
                  </span>
                  <span>{b.favourite_bike}</span>
                  <span>#{b.booking_count}</span>
      </div>
              ))
            )}
          </section>
        ) : null}
      </main>
    </div>
  );
}


