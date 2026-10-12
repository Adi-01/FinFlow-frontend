export class ApiError extends Error {
  statusCode: number;
  type?: string;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode: number, type?: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.type = type;
    this.code = code;
    this.details = details;
  }
}
