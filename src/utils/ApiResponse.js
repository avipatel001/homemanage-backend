class ApiResponse {
  constructor(statusCode, responseContent, responseMessage = "Success") {
    this.statusCode = statusCode;
    this.responseContent = responseContent;
    this.responseMessage = responseMessage;
    this.success = statusCode < 400;
  }
}

export { ApiResponse };
