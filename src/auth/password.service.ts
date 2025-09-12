import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

@Injectable()
export class PasswordService {
  public hash(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  public compare(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }
}
