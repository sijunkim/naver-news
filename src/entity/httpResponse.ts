export class HttpResponse {
  constructor(status, data, message) {
    this.status = status;
    this.data = data;
    this.message = message;
  }

  status?: number;
  data?: any;
  message?: string;
}
