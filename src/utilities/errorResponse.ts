class ErrorResponse extends Error {
  statusCode: number;
  code?: number;
  errors?: any;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorResponse;
