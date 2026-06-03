"""
PayDrift Scheduler — Hourly cron job to check overdue invoices and send reminders.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta
import logging

from database import AsyncSessionLocal, Invoice, User, Client, EmailLog, generate_id
from email_service import send_reminder_email, format_amount

logger = logging.getLogger("paydrift.scheduler")
scheduler = AsyncIOScheduler(timezone="UTC")


async def process_overdue_invoices():
    """Check all invoices, update overdue statuses, and queue reminder emails."""
    logger.info("Running overdue invoice check...")

    async with AsyncSessionLocal() as db:
        now = datetime.utcnow()

        # Update statuses: pending → overdue if past due date
        overdue_result = await db.execute(
            select(Invoice).where(
                Invoice.status == "pending",
                Invoice.due_date < now,
            )
        )
        overdue_invoices = overdue_result.scalars().all()

        updated_count = 0
        for inv in overdue_invoices:
            inv.status = "overdue"
            updated_count += 1

        if updated_count > 0:
            await db.commit()
            logger.info(f"Marked {updated_count} invoices as overdue")

        # Find invoices that need reminders
        reminder_result = await db.execute(
            select(Invoice).where(
                Invoice.status == "overdue",
            )
        )
        reminder_invoices = reminder_result.scalars().all()

        sent_count = 0
        for inv in reminder_invoices:
            level = inv.reminders_sent + 1
            if level > 5:
                continue  # Max 5 reminders

            # Check if we should send based on level (days overdue)
            days_overdue = (now - inv.due_date).days
            send_schedule = {1: 1, 2: 5, 3: 10, 4: 15, 5: 20}

            if days_overdue < send_schedule.get(level, 999):
                continue

            # Don't spam — check last reminder was not recent
            if inv.last_reminder_sent:
                hours_since = (now - inv.last_reminder_sent).total_seconds() / 3600
                if hours_since < 23:  # At least 23 hours between reminders
                    continue

            # Get client and user
            client_result = await db.execute(select(Client).where(Client.id == inv.client_id))
            client = client_result.scalar_one_or_none()
            if not client:
                continue

            user_result = await db.execute(select(User).where(User.id == inv.user_id))
            user = user_result.scalar_one_or_none()
            if not user or not user.email:
                continue

            # Skip free plan users (they have limited reminders)
            # Actually — send anyway, just rate limit

            try:
                await send_reminder_email(
                    user=user,
                    client=client,
                    invoice=inv,
                    reminder_level=level,
                    db=db,
                )
                inv.reminders_sent = level
                inv.last_reminder_sent = now
                await db.commit()
                sent_count += 1
                logger.info(f"Sent reminder {level} to {client.email} for invoice {inv.id}")
            except Exception as e:
                logger.error(f"Failed to send reminder for invoice {inv.id}: {e}")

        logger.info(f"Overdue check complete. Updated {updated_count}, sent {sent_count} reminders.")


def start_scheduler():
    scheduler.add_job(
        process_overdue_invoices,
        trigger=IntervalTrigger(hours=1),
        id="overdue_check",
        replace_existing=True,
        next_run_time=datetime.utcnow() + timedelta(minutes=2),  # First run in 2 min
    )
    scheduler.start()
    logger.info("Scheduler started — overdue check every hour")


def stop_scheduler():
    scheduler.shutdown(wait=False)
    logger.info("Scheduler stopped")