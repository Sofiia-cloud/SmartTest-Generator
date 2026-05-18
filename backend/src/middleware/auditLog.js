import pool from "../models/db.js";

/**
 * Middleware для записи действий пользователя в таблицу audit_logs
 * @param {string} actionName - название действия
 * @param {function} getDetails - опциональная функция для извлечения деталей
 */
export const auditLog = (actionName, getDetails = null) => {
  return async (req, res, next) => {
    // Сохраняем оригинальный метод send
    const originalSend = res.send;

    res.send = function (body) {
      res.body = body;
      return originalSend.call(this, body);
    };

    res.on("finish", async () => {
      // Логируем только успешные запросы (статус 2xx)
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const userId = req.user?.id || null;
      const userEmail = req.user?.email || "anonymous";

      let details = "";
      if (getDetails) {
        try {
          details = await getDetails(req, res.body);
        } catch (err) {
          details = `Ошибка получения деталей: ${err.message}`;
        }
      } else {
        details = JSON.stringify({
          body: req.body,
          params: req.params,
          query: req.query,
        }).substring(0, 500);
      }

      const ipAddress =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        null;
      const userAgent = req.headers["user-agent"] || null;

      try {
        await pool.query(
          `INSERT INTO audit_logs (user_id, user_email, action, details, ip_address, user_agent)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            userEmail,
            actionName,
            details.substring(0, 1000),
            ipAddress,
            userAgent,
          ],
        );
        console.log(
          `[AUDIT] ${actionName} — ${userEmail} (${ipAddress || "IP unknown"})`,
        );
      } catch (err) {
        console.error("[AUDIT ERROR]", err.message);
      }
    });

    next();
  };
};
