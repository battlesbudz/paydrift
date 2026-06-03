"""
PayDrift Email Service — Reminder email templates + send via Resend.
"""
import os
import resend
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from database import User, Client, Invoice, EmailLog, generate_id

resend.api_key = os.getenv("RESEND_API_KEY")


def get_reminder_content(level: int, client_name: str, invoice_desc: str, amount_str: str, due_date_str: str):
    """Returns (subject, body_html) for a given reminder level (1-5)."""

    if level == 1:
        subject = f"Friendly nudge — {invoice_desc}"
        body = f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <div style="background: #F8F7FF; padding: 32px; border-radius: 12px;">
                <p style="margin: 0 0 16px;">Hi {client_name},</p>
                <p style="margin: 0 0 16px;">Just a friendly heads-up — invoice for <strong>{invoice_desc}</strong> (<strong>{amount_str}</strong>) was due on <strong>{due_date_str}</strong>.</p>
                <p style="margin: 0 0 24px;">No worries if it slipped through — payments can sometimes take a moment to process. Feel free to send confirmation once it's on its way!</p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">— Your friends at PayDrift</p>
            </div>
        </div>
        """

    elif level == 2:
        subject = f"Gentle reminder — {invoice_desc}"
        body = f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <div style="background: #F8F7FF; padding: 32px; border-radius: 12px;">
                <p style="margin: 0 0 16px;">Hi {client_name},</p>
                <p style="margin: 0 0 16px;">Checking in on the invoice for <strong>{invoice_desc}</strong> — <strong>{amount_str}</strong>, originally due <strong>{due_date_str}</strong>.</p>
                <p style="margin: 0 0 24px;">Happy to help with anything you need to get this processed on your end. Just reply and let me know if there are any questions!</p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">— Your friends at PayDrift</p>
            </div>
        </div>
        """

    elif level == 3:
        subject = f"Following up — {invoice_desc} ({amount_str})"
        body = f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <div style="background: #FFF7ED; border: 1px solid #FED7AA; padding: 32px; border-radius: 12px;">
                <p style="margin: 0 0 16px;">Hi {client_name},</p>
                <p style="margin: 0 0 16px;">I wanted to follow up on the outstanding invoice for <strong>{invoice_desc}</strong> — <strong>{amount_str}</strong>.</p>
                <p style="margin: 0 0 24px;">If there are any issues on your end or the payment is on its way, I'd really appreciate a quick update. Running a small business means keeping cash flow healthy, and these follow-ups aren't fun for me either 😅</p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">— Your friends at PayDrift</p>
            </div>
        </div>
        """

    elif level == 4:
        subject = f"Payment overdue — {invoice_desc}"
        body = f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <div style="background: #FEF2F2; border: 1px solid #FECACA; padding: 32px; border-radius: 12px;">
                <p style="margin: 0 0 16px;">Hi {client_name},</p>
                <p style="margin: 0 0 16px;">The invoice for <strong>{invoice_desc}</strong> — <strong>{amount_str}</strong> — was due on <strong>{due_date_str}</strong> and remains unpaid.</p>
                <p style="margin: 0 0 24px;">At this stage, I need to ask that we prioritize this to avoid any additional complications. If there is an issue preventing payment, please let me know immediately so we can resolve it.</p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">— Your friends at PayDrift</p>
            </div>
        </div>
        """

    else:  # level 5+
        subject = f"Final notice — {invoice_desc} (payment required)"
        body = f"""
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111827;">
            <div style="background: #FEF2F2; border: 2px solid #EF4444; padding: 32px; border-radius: 12px;">
                <p style="margin: 0 0 16px;">Hi {client_name},</p>
                <p style="margin: 0 0 16px;">This is a final notice regarding an unpaid invoice: <strong>{invoice_desc}</strong> — <strong>{amount_str}</strong>, originally due <strong>{due_date_str}</strong>.</p>
                <p style="margin: 0 0 16px;">I encourage you to process this payment within the next 5 business days to avoid further action.</p>
                <p style="margin: 0 0 24px;">If you've already sent payment or there's a dispute, please reply to this email urgently so we can address it.</p>
                <p style="margin: 0; color: #6B7280; font-size: 14px;">— Your friends at PayDrift</p>
            </div>
        </div>
        """

    return subject, body


def format_amount(cents: int, currency: str = "USD") -> str:
    amount = cents / 100
    symbols = {"USD": "$", "EUR": "€", "GBP": "£"}
    sym = symbols.get(currency, currency + " ")
    return f"{sym}{amount:,.2f}"


async def send_reminder_email(
    user: User,
    client: Client,
    invoice: Invoice,
    reminder_level: int,
    db: AsyncSession,
):
    amount_str = format_amount(invoice.amount, invoice.currency)
    due_str = invoice.due_date.strftime("%B %d, %Y")

    subject, body = get_reminder_content(
        reminder_level,
        client.name,
        invoice.description,
        amount_str,
        due_str,
    )

    # Log it
    email_log = EmailLog(
        id=generate_id(),
        user_id=user.id,
        to=client.email,
        subject=subject,
        body=body,
        status="pending",
    )
    db.add(email_log)
    await db.commit()
    await db.refresh(email_log)

    # Send via Resend
    from_address = f"PayDrift <{os.getenv('FROM_EMAIL', 'hello@paydrift.app')}>"

    try:
        response = resend.Emails.send({
            "from": from_address,
            "to": client.email,
            "subject": subject,
            "html": body,
        })
        email_log.status = "sent"
        email_log.resend_id = response.get("id")
        email_log.sent_at = datetime.utcnow()
    except Exception as e:
        email_log.status = "failed"
        print(f"Failed to send email: {e}")

    await db.commit()
    return email_log