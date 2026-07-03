export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export const successResponse = <T>(res: any, status: number, message: string, data?: T) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res: any, status: number, message: string, errors?: any) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
