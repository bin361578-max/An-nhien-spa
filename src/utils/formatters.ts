import { Booking } from '../types';

/**
 * Format currency to Vietnamese Dong format (e.g., 350.000đ)
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
}

/**
 * Format date string (YYYY-MM-DD) to VN format (DD/MM/YYYY)
 */
export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Format ISO datetime string to VN standard
 */
export function formatDateTimeVN(isoStr: string): string {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Calculate hours between current time and booking appointment datetime
 */
export function getHoursUntilBooking(dateStr: string, timeSlot: string): number {
  try {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const appointmentDate = new Date(`${dateStr}T00:00:00`);
    appointmentDate.setHours(hours || 0, minutes || 0, 0, 0);

    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  } catch {
    return 0;
  }
}

/**
 * Reschedule validation rule:
 * Allowed only if requested at least 24 hours prior to appointment time.
 */
export function canRescheduleBooking(booking: Booking): {
  allowed: boolean;
  reason?: string;
  hoursLeft: number;
} {
  if (booking.status === 'cancelled') {
    return { allowed: false, reason: 'Lịch hẹn này đã bị hủy, không thể dời ngày.', hoursLeft: 0 };
  }
  if (booking.status === 'completed') {
    return { allowed: false, reason: 'Lịch hẹn đã hoàn thành.', hoursLeft: 0 };
  }

  const hoursLeft = getHoursUntilBooking(booking.date, booking.timeSlot);
  if (hoursLeft < 0) {
    return { allowed: false, reason: 'Giờ hẹn đã trôi qua trong quá khứ.', hoursLeft };
  }
  if (hoursLeft < 24) {
    return {
      allowed: false,
      reason: `Thời gian đến lịch hẹn còn ${hoursLeft.toFixed(1)} giờ (< 24 giờ). Theo quy định, không thể tự đổi lịch trực tuyến. Vui lòng liên hệ trực tiếp hotline spa.`,
      hoursLeft
    };
  }

  return { allowed: true, hoursLeft };
}

/**
 * Cancellation refund rule:
 * - >= 24 hours prior: 100% refund of deposit
 * - < 24 hours prior: 50% refund, 50% retained fee
 */
export function calculateCancellationRefund(booking: Booking): {
  refundAmount: number;
  retainedAmount: number;
  isFullRefund: boolean;
  hoursLeft: number;
} {
  const deposit = booking.depositAmount || 0;
  const hoursLeft = getHoursUntilBooking(booking.date, booking.timeSlot);

  if (hoursLeft >= 24) {
    return {
      refundAmount: deposit,
      retainedAmount: 0,
      isFullRefund: true,
      hoursLeft
    };
  } else {
    const half = Math.round(deposit / 2);
    return {
      refundAmount: half,
      retainedAmount: deposit - half,
      isFullRefund: false,
      hoursLeft: Math.max(0, hoursLeft)
    };
  }
}

export function generateBookingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AN-BK-${randomNum}`;
}

export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `AN-ORD-${randomNum}`;
}

export function generateCouponId(): string {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `CP-${randomNum}`;
}

export function generateMessageId(): string {
  return `MSG-${Date.now().toString(36).toUpperCase()}`;
}
