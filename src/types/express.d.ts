import { IUserPayload } from '../models/userModel';

declare global {
  namespace Express {
    interface Request {
      user?: IUserPayload;
    }
  }
}
