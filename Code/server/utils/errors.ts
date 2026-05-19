export const ErrorCodes = {
  // Authentication (E0xx)
  NOT_AUTHENTICATED:         'E001',
  WRONG_CREDENTIALS:         'E002',
  EMAIL_TAKEN:               'E003',

  // Sessions (E1xx)
  SESSION_MISSING_FIELDS:    'E101',
  SESSION_SELF_SCHEDULE:     'E102',
  SESSION_SLOT_TAKEN:        'E103',
  SESSION_NOT_FOUND:         'E104',
  SESSION_NOT_PENDING:       'E105',
  SESSION_CANNOT_RESPOND:    'E106',
  SESSION_CANNOT_CANCEL:     'E107',
  SESSION_CANNOT_COMPLETE:   'E108',
  SESSION_CANNOT_RESCHEDULE: 'E109',

  // Offers (E2xx)
  OFFER_NOT_FOUND:           'E201',
  OFFER_DUPLICATE:           'E202',
  OFFER_LISTING_NOT_FOUND:   'E203',
  OFFER_FORBIDDEN:           'E204',

  // Payments (E3xx)
  PAYMENT_LISTING_NOT_FOUND: 'E301',
  PAYMENT_LOCKED:            'E302',

  // Profile (E4xx)
  PROFILE_WRONG_PASSWORD:    'E401',
  PROFILE_EMAIL_TAKEN:       'E402',
  PROFILE_NOT_FOUND:         'E403',

  // Generic (E5xx)
  FORBIDDEN:                 'E501',
  NOT_FOUND:                 'E502',
  BAD_REQUEST:               'E503',
  INTERNAL:                  'E999',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export class AppError extends Error {
  status: number;
  code: ErrorCode;

  constructor(message: string, status: number, code: ErrorCode) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}
