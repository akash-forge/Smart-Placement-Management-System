import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "STUDENT" | "COMPANY";
  avatarUrl: string;
  verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

// NOTE: persistence is handled entirely by redux-persist (see reduxStore/store.ts),
// so this slice no longer touches localStorage directly — that used to happen
// here AND in App.tsx AND in api/client.ts, three sources of truth for the
// same data. api/client.ts now reads the token straight from this store.
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    // verificationStatus is captured in Redux at login time and never
    // changes on its own — if an admin approves the account afterward in
    // the same browser session, the stored snapshot goes stale until this
    // runs. See VerificationBanner, which calls this on a periodic refresh.
    updateVerificationStatus(
      state,
      action: PayloadAction<"PENDING" | "VERIFIED" | "REJECTED">
    ) {
      if (state.user) {
        state.user.verificationStatus = action.payload;
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, setUser, logout, updateVerificationStatus } = authSlice.actions;
export default authSlice.reducer;
