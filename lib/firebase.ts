export * from "@/src/firebase";

export interface UserSessionData {
  uid: string;
  name: string;
  email: string | null;
  photo: string | null;
  isLoggedIn: boolean;
}
