"""
Alerting service for automated early flood warnings.
Creates official bulletins when risk crosses ALERT_THRESHOLD,
enforces a 6-hour deduplication window per zone, and dispatches SMTP emails if enabled.
"""

import smtplib
import logging
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.models.zone import Zone
from backend.app.models.alert import Alert
from backend.app.models.user import User

logger = logging.getLogger(__name__)

DEDUPLICATION_WINDOW_HOURS = 6

def check_and_create_alert_for_zone(
    db: Session,
    zone: Zone,
    probability: float,
    level: str,
    top_factors: list,
) -> bool:
    """
    Evaluates whether an alert should be issued for the zone.
    Returns True if an alert was newly created, False otherwise.
    """
    if probability < settings.ALERT_THRESHOLD and level not in ["high", "severe"]:
        return False

    # Check for recent alerts for this zone within the deduplication window
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=DEDUPLICATION_WINDOW_HOURS)
    recent_alert = (
        db.query(Alert)
        .filter(Alert.zone_id == zone.id, Alert.created_at >= cutoff)
        .first()
    )

    if recent_alert:
        logger.info(f"Skipping duplicate alert for {zone.name}; existing alert issued {recent_alert.created_at}")
        return False

    # Generate calm, specific advisory message
    factor_text = top_factors[0]["text"] if top_factors else "Rapid runoff and elevated river stage detected."
    action_text = (
        "Move vehicles and livestock to higher ground. Follow local tahsil evacuation directives."
        if level == "severe"
        else "Exercise caution near low-lying causeways and natural nullahs."
    )
    message = f"{level.capitalize()} flood risk in {zone.name}. {factor_text} {action_text}"

    new_alert = Alert(
        zone_id=zone.id,
        level=level,
        message=message,
        source="model",
        created_by="FloodWatch Autonomous Early Warning System",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_alert)
    db.commit()
    logger.info(f"NEW FLOOD ALERT ISSUED for {zone.name} ({level} risk, p={probability:.2f})")

    # Dispatch email notifications if SMTP is enabled
    if settings.ALERT_EMAIL_ENABLED and settings.SMTP_HOST:
        send_email_advisory(db, zone, level, message)

    return True

def send_email_advisory(db: Session, zone: Zone, level: str, message: str):
    """Sends email advisory to subscribed citizens and officials in the affected zone."""
    users_to_notify = (
        db.query(User)
        .filter(User.home_zone_id == zone.id, User.email_alerts.is_(True))
        .all()
    )
    recipients = [u.email for u in users_to_notify if u.email]
    if not recipients:
        logger.info(f"No email subscribers found for zone {zone.name}.")
        return

    subject = f"[FloodWatch Early Warning] {level.upper()} Risk Alert: {zone.name}"
    body = f"""Official Flood Early Warning Bulletin
---------------------------------------
Zone: {zone.name} ({zone.region})
Severity: {level.upper()}
Issued: {datetime.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

Advisory:
{message}

Decision-support tool. Follow official IMD/CWC and local authority instructions.
"""

    try:
        msg = MIMEMultipart()
        msg["From"] = settings.ALERT_FROM_EMAIL
        msg["To"] = ", ".join(recipients)
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.ALERT_FROM_EMAIL, recipients, msg.as_string())
            logger.info(f"Dispatched email advisory to {len(recipients)} recipients for {zone.name}")
    except Exception as e:
        logger.error(f"Failed to dispatch email advisory via SMTP: {e}")
