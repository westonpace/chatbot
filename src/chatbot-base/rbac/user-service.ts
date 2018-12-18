export interface User {
  id: string;
  roles: string[];
}

export interface UserService {
  getCurrentUser(): Promise<User>;
}