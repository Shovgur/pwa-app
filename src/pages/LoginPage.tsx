import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Eye, EyeOff, LogIn, User, Handshake } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { usePartnerAuth } from "../contexts/PartnerAuthContext";
import { ParticleField } from "../components/ParticleField";
import { BackToSiteLink } from "../components/ui/BackToSiteLink";
import { AuthTransitionLoader } from "../components/ui/Loaders";
import { FieldError, errorInputStyle } from "../components/ui/FieldError";
import { useFieldErrors } from "../hooks/useFieldErrors";

const SPORTS = ["⚽", "🎾", "🏀", "🏐", "🏸", "🏊"];

type LoginMode = "client" | "partner";

const TABS: { id: LoginMode; label: string; icon: typeof User }[] = [
  { id: "client", label: "Я клиент", icon: User },
  { id: "partner", label: "Я партнёр", icon: Handshake },
];

const fieldInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 12,
  background: "#243354",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

export function LoginPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const initialLogin =
    (location.state as { login?: string } | null)?.login ??
    searchParams.get("login") ??
    "";

  const [mode, setMode] = useState<LoginMode>("client");
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  // ─── клиент ───
  const [login, setLogin] = useState(initialLogin);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { errors, handleInvalid, clearError } = useFieldErrors();
  const { login: authLogin, isLoading } = useAuth();

  // ─── партнёр ───
  const [partnerLogin, setPartnerLogin] = useState("");
  const [partnerPassword, setPartnerPassword] = useState("");
  const [showPartnerPass, setShowPartnerPass] = useState(false);
  const [partnerError, setPartnerError] = useState("");
  const {
    errors: partnerErrors,
    handleInvalid: handlePartnerInvalid,
    clearError: clearPartnerError,
  } = useFieldErrors();
  const { loginPartner, isLoading: isPartnerLoading } = usePartnerAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = await authLogin(login, password);
    if (result.success) {
      setRedirecting(true);
      navigate("/dashboard", { replace: true });
    } else setError(result.error ?? "Ошибка входа");
  }

  async function handlePartnerSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPartnerError("");
    const result = await loginPartner(partnerLogin, partnerPassword);
    if (result.success) {
      setRedirecting(true);
      navigate("/partner/dashboard", { replace: true });
    } else setPartnerError(result.error ?? "Ошибка входа");
  }

  const showLoader = isLoading || isPartnerLoading || redirecting;
  const loaderMessage = redirecting
    ? mode === "partner"
      ? "Открываем кабинет партнёра..."
      : "Открываем личный кабинет..."
    : mode === "partner"
      ? "Входим как партнёр..."
      : "Входим в аккаунт...";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background:
          "linear-gradient(160deg, #0a1628 0%, #0f1e35 50%, #0d1f2d 100%)",
      }}
    >
      <AnimatePresence>
        {showLoader && <AuthTransitionLoader message={loaderMessage} />}
      </AnimatePresence>
      <ParticleField />

      <div
        style={{
          position: "fixed",
          top: "calc(24px + env(safe-area-inset-top, 0px))",
          left: 24,
          zIndex: 50,
        }}
      >
        <BackToSiteLink />
      </div>

      {/* Орбы */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            top: "-10%",
            right: "-5%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 65%)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <motion.div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            bottom: "-10%",
            left: "-5%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 65%)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        />
      </div>

      {/* Левая панель — только на десктопе */}
      <div className="hidden lg:flex lg-panel-left">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "linear-gradient(135deg, #22c55e, #3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(34,197,94,0.3)",
              }}
            >
              <MapPin size={22} color="#fff" strokeWidth={2.5} />
            </div>
            <span
              className="logo-text"
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
              }}
            >
              BookinGo
            </span>
          </div>
          <h2
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: "#fff",
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Бронируйте
            <br />
            <span className="gradient-text">площадки</span>
            <br />
            для любого досуга
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: 16,
              lineHeight: 1.7,
              marginBottom: 48,
              maxWidth: 400,
            }}
          >
            Спорт, лофты, переговорные — бронируй за минуту и добавляй услуги
            прямо при заказе.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {SPORTS.map((s, i) => (
              <motion.div
                key={i}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              >
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Правая панель — форма */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 24px",
          paddingTop: "calc(80px + env(safe-area-inset-top, 0px))",
          position: "relative",
          zIndex: 10,
        }}
      >
        <motion.div
          style={{ width: "100%", maxWidth: 420 }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Лого — мобилка */}
          <div
            className="lg:hidden"
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 13,
                  background: "linear-gradient(135deg, #22c55e, #3b82f6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={20} color="#fff" strokeWidth={2.5} />
              </div>
              <span
                style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}
                className="logo-text"
              >
                BookinGo
              </span>
            </div>
            <p style={{ color: "#64748b", fontSize: 13 }}>
              Бронирование спортивных площадок
            </p>
          </div>

          {/* Карточка */}
          <div
            style={{
              background: "#1a2332",
              borderRadius: 24,
              padding: "32px 28px",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            }}
          >
            {/* Переключатель клиент / партнёр */}
            <div
              style={{
                position: "relative",
                display: "flex",
                padding: 4,
                borderRadius: 14,
                background: "#141c2e",
                border: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 24,
              }}
            >
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = mode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMode(tab.id)}
                    style={{
                      position: "relative",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      color: active ? "#fff" : "#64748b",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "color 0.2s",
                      zIndex: 1,
                    }}
                  >
                    {active && (
                      <motion.span
                        layoutId="login-tab-pill"
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 34,
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          borderRadius: 10,
                          background:
                            "linear-gradient(135deg, #22c55e, #16a34a)",
                          boxShadow: "0 4px 14px rgba(34,197,94,0.3)",
                          zIndex: -1,
                        }}
                      />
                    )}
                    <Icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {mode === "client" ? (
                <motion.div
                  key="client"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    Вход в аккаунт
                  </h2>
                  <p
                    style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}
                  >
                    Войдите чтобы управлять бронированиями
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                      >
                        EMAIL ИЛИ ТЕЛЕФОН
                      </label>
                      <input
                        type="text"
                        value={login}
                        onChange={(e) => {
                          setLogin(e.target.value);
                          clearError("login");
                        }}
                        onInvalid={handleInvalid("login")}
                        placeholder="example@mail.ru"
                        required
                        autoComplete="username"
                        style={{
                          ...fieldInputStyle,
                          ...errorInputStyle(Boolean(errors.login)),
                        }}
                      />
                      <FieldError message={errors.login} />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                      >
                        ПАРОЛЬ
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            clearError("password");
                          }}
                          onInvalid={handleInvalid("password")}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                          style={{
                            ...fieldInputStyle,
                            padding: "14px 48px 14px 16px",
                            ...errorInputStyle(Boolean(errors.password)),
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <FieldError message={errors.password} />
                      <div style={{ textAlign: "right", marginTop: 8 }}>
                        <Link
                          to={
                            login.includes("@")
                              ? `/forgot-password?email=${encodeURIComponent(login.trim())}`
                              : "/forgot-password"
                          }
                          style={{
                            color: "#64748b",
                            fontSize: 12,
                            textDecoration: "none",
                          }}
                        >
                          Забыли пароль?
                        </Link>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171",
                            fontSize: 13,
                            margin: 0,
                          }}
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: "100%",
                        padding: 15,
                        borderRadius: 12,
                        marginTop: 4,
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        border: "none",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: isLoading ? "default" : "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                        opacity: isLoading ? 0.8 : 1,
                      }}
                      whileHover={isLoading ? {} : { scale: 1.02 }}
                      whileTap={isLoading ? {} : { scale: 0.97 }}
                    >
                      {isLoading ? (
                        <motion.div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                          }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <>
                          <LogIn size={17} />
                          <span>Войти</span>
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 13,
                      marginTop: 20,
                    }}
                  >
                    Нет аккаунта?{" "}
                    <Link
                      to="/register"
                      style={{
                        color: "#22c55e",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Зарегистрироваться
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="partner"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    Кабинет партнёра
                  </h2>
                  <p
                    style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}
                  >
                    Войдите в личный кабинет партнёра
                  </p>

                  <form
                    onSubmit={handlePartnerSubmit}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 16,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                      >
                        ЛОГИН
                      </label>
                      <input
                        type="text"
                        value={partnerLogin}
                        onChange={(e) => {
                          setPartnerLogin(e.target.value);
                          clearPartnerError("login");
                        }}
                        onInvalid={handlePartnerInvalid("login")}
                        placeholder="Логин"
                        required
                        autoComplete="username"
                        style={{
                          ...fieldInputStyle,
                          ...errorInputStyle(Boolean(partnerErrors.login)),
                        }}
                      />
                      <FieldError message={partnerErrors.login} />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: 8,
                          letterSpacing: 0.5,
                        }}
                      >
                        ПАРОЛЬ
                      </label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPartnerPass ? "text" : "password"}
                          value={partnerPassword}
                          onChange={(e) => {
                            setPartnerPassword(e.target.value);
                            clearPartnerError("password");
                          }}
                          onInvalid={handlePartnerInvalid("password")}
                          placeholder="••••••••"
                          required
                          autoComplete="current-password"
                          style={{
                            ...fieldInputStyle,
                            padding: "14px 48px 14px 16px",
                            ...errorInputStyle(Boolean(partnerErrors.password)),
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPartnerPass(!showPartnerPass)}
                          style={{
                            position: "absolute",
                            right: 14,
                            top: "50%",
                            transform: "translateY(-50%)",
                            background: "none",
                            border: "none",
                            color: "#64748b",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          {showPartnerPass ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                      <FieldError message={partnerErrors.password} />
                    </div>

                    <AnimatePresence>
                      {partnerError && (
                        <motion.p
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171",
                            fontSize: 13,
                            margin: 0,
                          }}
                        >
                          {partnerError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={isPartnerLoading}
                      style={{
                        width: "100%",
                        padding: 15,
                        borderRadius: 12,
                        marginTop: 4,
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        border: "none",
                        color: "#fff",
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: isPartnerLoading ? "default" : "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        boxShadow: "0 8px 24px rgba(34,197,94,0.3)",
                        opacity: isPartnerLoading ? 0.8 : 1,
                      }}
                      whileHover={isPartnerLoading ? {} : { scale: 1.02 }}
                      whileTap={isPartnerLoading ? {} : { scale: 0.97 }}
                    >
                      {isPartnerLoading ? (
                        <motion.div
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTopColor: "#fff",
                          }}
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />
                      ) : (
                        <>
                          <Handshake size={17} />
                          <span>Войти как партнёр</span>
                        </>
                      )}
                    </motion.button>
                  </form>

                  <p
                    style={{
                      textAlign: "center",
                      color: "#64748b",
                      fontSize: 13,
                      marginTop: 20,
                    }}
                  >
                    Ещё не партнёр?{" "}
                    <Link
                      to="/partners"
                      style={{
                        color: "#22c55e",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Оставить заявку
                    </Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
