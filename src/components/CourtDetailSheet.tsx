import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  MapPin,
  ChevronRight,
  Check,
  ChevronLeft,
  ChevronDown,
  Plus,
} from "lucide-react";
import type { Booking, Court } from "../contexts/BookingContext";
import { useBookings } from "../contexts/BookingContext";
import { useAuth } from "../contexts/AuthContext";
import { loadPublicVenueById, usePublicVenues } from "../contexts/PublicVenuesContext";
import type { PartnerVenue } from "../lib/partnerVenues";
import { courtPhotoStyle } from "../utils/venueAdapters";
import { VenueMap } from "./ui/VenueMap";
import { BILLING_LABEL } from "../utils/venueBuilderPresets";
import { calcBookingTotal } from "../utils/partnerBookingPrice";
import { BookingStepProgress } from "./court-sheet/BookingStepProgress";
import { MockPaymentStep } from "./court-sheet/MockPaymentStep";

const DURATIONS = [
  { label: "30 мин", value: 30 },
  { label: "1 час", value: 60 },
  { label: "1.5 часа", value: 90 },
  { label: "2 часа", value: 120 },
];

const UPCOMING_DATES = (() => {
  const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const months = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  const result = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    result.push({
      label: i === 0 ? "Сегодня" : i === 1 ? "Завтра" : days[d.getDay()],
      date: `${d.getDate()} ${months[d.getMonth()]}`,
      full: d.toLocaleDateString("ru-RU"),
      iso: d.toISOString().slice(0, 10),
    });
  }
  return result;
})();

type Step = "detail" | "booking" | "confirm" | "payment" | "success";

function priceUnit(court: Court): string {
  if (court.venueType === "loft") return "/ сессия";
  if (court.venueType === "pool") return "/ визит";
  return "/ час";
}

interface Props {
  court: Court;
  onClose: () => void;
}

/** На десктопе показываем модалку по центру экрана вместо мобильного bottom-sheet. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 860px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 860px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export function CourtDetailSheet({ court, onClose }: Props) {
  const { addBooking } = useBookings();
  const { user } = useAuth();
  const { getVenue } = usePublicVenues();
  const isDesktop = useIsDesktop();
  const sidePad = isDesktop ? "0 32px 28px" : "0 16px 24px";
  const [step, setStep] = useState<Step>("detail");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [selectedDate, setSelectedDate] = useState(UPCOMING_DATES[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[1]);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [requestCallback, setRequestCallback] = useState(true);
  const [partnerVenue, setPartnerVenue] = useState<PartnerVenue | null>(() =>
    court.partnerVenueId ? getVenue(court.partnerVenueId) ?? null : null,
  );
  const [newBooking, setNewBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (!court.partnerVenueId) return;
    const cached = getVenue(court.partnerVenueId);
    if (cached) {
      setPartnerVenue(cached);
      return;
    }
    let cancelled = false;
    void loadPublicVenueById(court.partnerVenueId).then((v) => {
      if (!cancelled && v) setPartnerVenue(v);
    });
    return () => { cancelled = true; };
  }, [court.partnerVenueId, getVenue]);

  const totalPrice = useMemo(
    () => calcBookingTotal(
      court.price,
      selectedDuration.value,
      partnerVenue,
      selectedPackageId,
      selectedExtras,
    ),
    [court.price, selectedDuration.value, partnerVenue, selectedPackageId, selectedExtras],
  );

  function toggleExtra(id: string) {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleStartBooking() {
    setStep("booking");
  }

  async function handlePay() {
    if (!selectedSlot || paying) return;
    setPaying(true);
    setPayError(null);
    try {
      await new Promise((r) => setTimeout(r, 1400));
      const booking = await addBooking(
        court,
        selectedDate.date,
        selectedSlot,
        selectedDuration.value,
        {
          isoDate: selectedDate.iso,
          price: totalPrice,
          paymentMethod: "online",
          requestCallback,
        },
      );
      setNewBooking(booking);
      setStep("success");
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Не удалось создать бронь");
    } finally {
      setPaying(false);
    }
  }

  return createPortal(
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        key="overlay"
        className="court-sheet-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet: снизу на мобиле, по центру экрана на десктопе */}
      <motion.div
        key="sheet"
        className="court-sheet"
        initial={isDesktop ? { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" } : { y: "100%" }}
        animate={isDesktop ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { y: 0 }}
        exit={isDesktop ? { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" } : { y: "100%" }}
        transition={isDesktop ? { duration: 0.2, ease: "easeOut" } : { type: "spring", damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle — только на мобиле */}
        {!isDesktop && (
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.15)",
              }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── DETAIL ─── */}
          {step === "detail" && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              {/* Скроллируемый контент */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                }}
              >
                {/* Фото */}
                <div
                  style={{
                    position: "relative",
                    margin: isDesktop ? "0 32px 16px" : "0 16px 16px",
                    height: isDesktop ? 260 : 200,
                    borderRadius: 20,
                    overflow: "hidden",
                  }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={photoIdx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        width: "100%",
                        height: "100%",
                        ...courtPhotoStyle(court, photoIdx),
                      }}
                    />
                  </AnimatePresence>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 64,
                        filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
                      }}
                    >
                      {court.emoji}
                    </span>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {court.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIdx(i)}
                        style={{
                          width: i === photoIdx ? 20 : 7,
                          height: 7,
                          borderRadius: 4,
                          background:
                            i === photoIdx
                              ? court.color
                              : "rgba(255,255,255,0.4)",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      border: "none",
                      cursor: "pointer",
                      background: "rgba(0,0,0,0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={16} color="#fff" />
                  </button>
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: court.available
                        ? "rgba(34,197,94,0.85)"
                        : "rgba(239,68,68,0.85)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 10,
                    }}
                  >
                    {court.available ? "● Свободно" : "● Занято"}
                  </div>
                </div>

                <div style={{ padding: sidePad }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 12,
                          color: court.color,
                          fontWeight: 600,
                          background: `${court.color}18`,
                          padding: "2px 8px",
                          borderRadius: 6,
                        }}
                      >
                        {court.sport}
                      </span>
                      <h2
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#f1f5f9",
                          marginTop: 6,
                        }}
                      >
                        {court.name}
                      </h2>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: court.color,
                        }}
                      >
                        {court.price.toLocaleString()} ₽
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {priceUnit(court)}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#f1f5f9",
                        }}
                      >
                        {court.rating}
                      </span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        ({court.reviews})
                      </span>
                    </div>
                    <div
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "#334155",
                      }}
                    />
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={13} color="#64748b" />
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {court.distance}
                      </span>
                    </div>
                  </div>

                  <p
                    style={{
                      fontSize: 14,
                      color: "#94a3b8",
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    {court.description}
                  </p>

                  <div style={{ marginBottom: 20 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: 10,
                      }}
                    >
                      Удобства
                    </h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {court.amenities.map((a) => (
                        <div
                          key={a}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10,
                            padding: "5px 10px",
                          }}
                        >
                          <Check size={11} color={court.color} />
                          <span style={{ fontSize: 12, color: "#cbd5e1" }}>
                            {a}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: 10,
                      }}
                    >
                      Расположение
                    </h3>
                    <VenueMap
                      address={partnerVenue?.address ?? court.address}
                      city={partnerVenue?.city ?? court.location}
                      lat={partnerVenue?.lat ?? court.lat}
                      lng={partnerVenue?.lng ?? court.lng}
                      height={180}
                      accentColor={court.color}
                    />
                  </div>

                  <div>
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: 10,
                      }}
                    >
                      Ближайшие слоты — сегодня
                    </h3>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {court.slots.slice(0, 4).map((slot) => (
                        <div
                          key={slot}
                          style={{
                            padding: "6px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            fontWeight: 600,
                            background: `${court.color}18`,
                            color: court.color,
                            border: `1px solid ${court.color}30`,
                          }}
                        >
                          {slot}
                        </div>
                      ))}
                      {court.slots.length > 4 && (
                        <div
                          style={{
                            padding: "6px 14px",
                            borderRadius: 10,
                            fontSize: 13,
                            color: "#64748b",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          +{court.slots.length - 4} ещё{" "}
                          <ChevronDown size={13} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Кнопка внизу контента */}
                  {court.available && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStartBooking}
                      style={{
                        width: "100%",
                        padding: "16px",
                        borderRadius: 16,
                        marginTop: 24,
                        background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`,
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 700,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: `0 8px 24px ${court.color}40`,
                      }}
                    >
                      Забронировать <ChevronRight size={18} />
                    </motion.button>
                  )}
                  {/* Отступ снизу — чтобы кнопка выскроллилась выше нижнего меню */}
                  <div style={{ height: 90 }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── BOOKING ─── */}
          {step === "booking" && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <div
                className="court-sheet-narrow"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  padding: isDesktop ? "0 32px 24px" : "0 16px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                    paddingTop: 4,
                  }}
                >
                  <button
                    onClick={() => setStep("detail")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      borderRadius: 10,
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronLeft size={18} color="#94a3b8" />
                  </button>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {court.name}
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#f1f5f9",
                      }}
                    >
                      Выбор времени
                    </div>
                  </div>
                </div>

                <BookingStepProgress current={0} />

                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Дата
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 4,
                    }}
                  >
                    {UPCOMING_DATES.map((d) => {
                      const active = selectedDate.date === d.date;
                      return (
                        <button
                          key={d.date}
                          onClick={() => setSelectedDate(d)}
                          style={{
                            flex: "0 0 auto",
                            padding: "10px 14px",
                            borderRadius: 14,
                            background: active
                              ? court.color
                              : "rgba(255,255,255,0.05)",
                            border: active
                              ? "none"
                              : "1px solid rgba(255,255,255,0.08)",
                            cursor: "pointer",
                            textAlign: "center",
                            minWidth: 64,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: active
                                ? "rgba(255,255,255,0.7)"
                                : "#64748b",
                              marginBottom: 2,
                            }}
                          >
                            {d.label}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: active ? "#fff" : "#f1f5f9",
                            }}
                          >
                            {d.date.split(" ")[0]}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: active
                                ? "rgba(255,255,255,0.7)"
                                : "#64748b",
                            }}
                          >
                            {d.date.split(" ")[1]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Время начала
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                    }}
                  >
                    {court.slots.map((slot) => {
                      const active = selectedSlot === slot;
                      return (
                        <motion.button
                          key={slot}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            padding: "10px 4px",
                            borderRadius: 12,
                            background: active
                              ? `${court.color}20`
                              : "rgba(255,255,255,0.04)",
                            border: active
                              ? `1.5px solid ${court.color}`
                              : "1px solid rgba(255,255,255,0.08)",
                            color: active ? court.color : "#94a3b8",
                            fontSize: 13,
                            fontWeight: active ? 700 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {slot}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {partnerVenue && partnerVenue.durationRules.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Пакеты
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {partnerVenue.durationRules.map((pkg) => {
                        const active = selectedPackageId === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                              if (active) {
                                setSelectedPackageId(null);
                              } else {
                                setSelectedPackageId(pkg.id);
                                const match = DURATIONS.find((d) => d.value === pkg.hours * 60);
                                if (match) setSelectedDuration(match);
                              }
                            }}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 14px",
                              borderRadius: 14,
                              border: active
                                ? `1.5px solid ${court.color}`
                                : "1px solid rgba(255,255,255,0.08)",
                              background: active
                                ? `${court.color}18`
                                : "rgba(255,255,255,0.04)",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "inherit",
                            }}
                          >
                            <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>
                              {pkg.label || `${pkg.hours} ч`}
                            </span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: court.color }}>
                              {pkg.price.toLocaleString("ru-RU")} ₽
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <h3
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#94a3b8",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Продолжительность
                  </h3>
                  <div style={{ display: "flex", gap: 8, opacity: selectedPackageId ? 0.45 : 1 }}>
                    {DURATIONS.map((d) => {
                      const active = selectedDuration.value === d.value;
                      return (
                        <motion.button
                          key={d.value}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => {
                            setSelectedPackageId(null);
                            setSelectedDuration(d);
                          }}
                          style={{
                            flex: 1,
                            padding: "10px 4px",
                            borderRadius: 12,
                            background: active
                              ? `${court.color}20`
                              : "rgba(255,255,255,0.04)",
                            border: active
                              ? `1.5px solid ${court.color}`
                              : "1px solid rgba(255,255,255,0.08)",
                            color: active ? court.color : "#94a3b8",
                            fontSize: 12,
                            fontWeight: active ? 700 : 400,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {d.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {partnerVenue && partnerVenue.extraServices.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#94a3b8",
                        marginBottom: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Доп. услуги
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {partnerVenue.extraServices.map((ex) => {
                        const active = selectedExtras.includes(ex.id);
                        return (
                          <button
                            key={ex.id}
                            type="button"
                            onClick={() => toggleExtra(ex.id)}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 12,
                              padding: "12px 14px",
                              borderRadius: 14,
                              border: active
                                ? `1.5px solid ${court.color}`
                                : "1px solid rgba(255,255,255,0.08)",
                              background: active
                                ? `${court.color}12`
                                : "rgba(255,255,255,0.04)",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "inherit",
                            }}
                          >
                            <div style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              flexShrink: 0,
                              marginTop: 1,
                              border: active
                                ? `2px solid ${court.color}`
                                : "2px solid rgba(255,255,255,0.2)",
                              background: active ? court.color : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}>
                              {active && <Check size={12} color="#fff" />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{ex.name}</div>
                              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                                {ex.description || BILLING_LABEL[ex.billing]} · {ex.price.toLocaleString("ru-RU")} ₽
                              </div>
                            </div>
                            {!active && <Plus size={16} color="#64748b" style={{ flexShrink: 0, marginTop: 2 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedSlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 16,
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        Дата и время
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#f1f5f9",
                          fontWeight: 600,
                        }}
                      >
                        {selectedDate.date}, {selectedSlot}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: 13, color: "#64748b" }}>
                        Продолжительность
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          color: "#f1f5f9",
                          fontWeight: 600,
                        }}
                      >
                        {selectedDuration.label}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 1,
                        background: "rgba(255,255,255,0.07)",
                        margin: "10px 0",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#f1f5f9",
                        }}
                      >
                        Итого
                      </span>
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: 800,
                          color: court.color,
                        }}
                      >
                        {totalPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  </motion.div>
                )}

              </div>

              <div className="court-sheet-footer">
                <div className="court-sheet-narrow">
                  <motion.button
                    whileTap={{ scale: selectedSlot ? 0.97 : 1 }}
                    onClick={() => selectedSlot && setStep("confirm")}
                    style={{
                      width: "100%",
                      padding: "16px",
                      borderRadius: 16,
                      background: selectedSlot
                        ? `linear-gradient(135deg, ${court.color}, ${court.color}bb)`
                        : "rgba(255,255,255,0.08)",
                      color: selectedSlot ? "#fff" : "#475569",
                      fontSize: 16,
                      fontWeight: 700,
                      border: "none",
                      cursor: selectedSlot ? "pointer" : "default",
                      transition: "all 0.2s",
                      boxShadow: selectedSlot
                        ? `0 8px 24px ${court.color}40`
                        : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {selectedSlot ? "Продолжить" : "Выберите время"}
                    {selectedSlot && <ChevronRight size={18} />}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── CONFIRM ─── */}
          {step === "confirm" && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <div
                className="court-sheet-narrow"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  padding: isDesktop ? "0 32px 24px" : "0 16px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 24,
                    paddingTop: 4,
                  }}
                >
                  <button
                    onClick={() => setStep("booking")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      borderRadius: 10,
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    <ChevronLeft size={18} color="#94a3b8" />
                  </button>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      Шаг 2 из 3
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#f1f5f9",
                      }}
                    >
                      Подтверждение
                    </div>
                  </div>
                </div>

                <BookingStepProgress current={1} />

                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 20,
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      ...courtPhotoStyle(court, 0),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                      flexShrink: 0,
                    }}
                  >
                    {court.emoji}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#f1f5f9",
                        marginBottom: 2,
                      }}
                    >
                      {court.name}
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <MapPin size={12} color="#64748b" />
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        {court.location}
                      </span>
                    </div>
                  </div>
                </div>

                {[
                  ["Дата", selectedDate.date],
                  ["Время", selectedSlot!],
                  ["Продолжительность", selectedDuration.label],
                  ["Адрес", court.address],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "#64748b" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#f1f5f9",
                      }}
                    >
                      {value}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 0 0",
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9" }}
                  >
                    К оплате
                  </span>
                  <span
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: court.color,
                    }}
                  >
                    {totalPrice.toLocaleString()} ₽
                  </span>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    marginTop: 18,
                    padding: "14px 16px",
                    borderRadius: 14,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.22)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={requestCallback}
                    onChange={(e) => setRequestCallback(e.target.checked)}
                    style={{ width: 18, height: 18, marginTop: 2, accentColor: "#22c55e" }}
                  />
                  <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.45 }}>
                    <strong style={{ color: "#f1f5f9" }}>Перезвонить для подтверждения</strong>
                    <br />
                    Менеджер свяжется по номеру {user?.phone ?? "из профиля"} перед визитом
                  </span>
                </label>

                {/* Кнопка внизу контента */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("payment")}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 16,
                    marginTop: 20,
                    background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: `0 8px 24px ${court.color}40`,
                  }}
                >
                  Перейти к оплате
                </motion.button>
                <div style={{ height: 90 }} />
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <MockPaymentStep
              court={court}
              totalPrice={totalPrice}
              paying={paying}
              error={payError}
              isDesktop={isDesktop}
              onBack={() => setStep("confirm")}
              onPay={handlePay}
            />
          )}

          {/* ─── SUCCESS ─── */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, type: "spring" }}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
                minHeight: 0,
              }}
            >
              <div
                className="court-sheet-narrow"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  padding: isDesktop ? "24px 32px 16px" : "24px 16px 16px",
                  textAlign: "center",
                }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.15,
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  style={{
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${court.color}, ${court.color}aa)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    boxShadow: `0 16px 40px ${court.color}50`,
                  }}
                >
                  <Check size={40} color="#fff" />
                </motion.div>

                <h2
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#f1f5f9",
                    marginBottom: 8,
                  }}
                >
                  Бронь подтверждена!
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: "#64748b",
                    marginBottom: 24,
                    lineHeight: 1.6,
                  }}
                >
                  {court.name} забронирован на {newBooking?.date} в{" "}
                  {newBooking?.time}
                </p>

                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 20,
                    padding: 20,
                    border: `1px solid ${court.color}30`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 32 }}>{court.emoji}</span>
                    <div style={{ textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#f1f5f9",
                        }}
                      >
                        {court.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {court.location}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    {[
                      ["📅 Дата", newBooking?.date],
                      ["⏰ Время", newBooking?.time],
                      ["⏱ Длительность", selectedDuration.label],
                      ["💳 Оплачено", `${totalPrice.toLocaleString()} ₽`],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "#475569",
                            marginBottom: 2,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#f1f5f9",
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Кнопка внизу контента */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onClose}
                  style={{
                    width: "100%",
                    padding: "16px",
                    borderRadius: 16,
                    marginTop: 20,
                    background: `linear-gradient(135deg, ${court.color}, ${court.color}bb)`,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: `0 8px 24px ${court.color}40`,
                  }}
                >
                  Отлично!
                </motion.button>
                <div style={{ height: 90 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
