export interface UserRegisteredEvent {
  user: {
    email: string;
    fullName: string;
  };
}
