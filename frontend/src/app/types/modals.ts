// export type User = {
//     name: string;
//     email: string;
// };

export type VideoType = {
  id: string;
  url: string;
  title: string;
  sharedBy: string;
  likes: number;
  dislikes: number;
  description: string;
  youtube_id: string;
  owner_email: string;
};

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Auth {
  access_token: string;
  expires_in: number;
}

export interface UserDataToken {
  user?: User;
  auth: Auth;
  email: string;
}
