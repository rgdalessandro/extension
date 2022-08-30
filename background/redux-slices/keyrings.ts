import { createSlice } from "@reduxjs/toolkit"
import Emittery from "emittery"

import { setNewSelectedAccount, UIState } from "./ui"
import { createBackgroundAsyncThunk } from "./utils"
import { Keyring, KeyringMetadata } from "../services/keyring"

type KeyringsState = {
  keyrings: Keyring[]
  keyringMetadata: { [keyringId: string]: { source: "import" | "internal" } }
  isCurrentPasswordValid: boolean | null
  importing: false | "pending" | "done"
  status: "locked" | "unlocked" | "uninitialized"
  keyringToVerify: {
    id: string
    mnemonic: string[]
  } | null
}

export const initialState: KeyringsState = {
  keyrings: [],
  keyringMetadata: {},
  isCurrentPasswordValid: null,
  importing: false,
  status: "uninitialized",
  keyringToVerify: null,
}

export type Events = {
  createPassword: string
  changePassword: string
  unlockKeyrings: string
  generateNewKeyring: never
  deriveAddress: string
  importKeyring: ImportKeyring
}

export const emitter = new Emittery<Events>()

interface ImportKeyring {
  mnemonic: string
  source: "internal" | "import"
  path?: string
}

// Async thunk to bubble the importKeyring action from  store to emitter.
export const importKeyring = createBackgroundAsyncThunk(
  "keyrings/importKeyring",
  async ({ mnemonic, source, path }: ImportKeyring, { getState, dispatch }) => {
    await emitter.emit("importKeyring", { mnemonic, path, source })

    const { keyrings, ui } = getState() as {
      keyrings: KeyringsState
      ui: UIState
    }
    // Set the selected account as the first address of the last added keyring,
    // which will correspond to the last imported keyring, AKA this one. Note that
    // this does rely on the KeyringService's behavior of pushing new keyrings to
    // the end of the keyring list.
    dispatch(
      setNewSelectedAccount({
        address: keyrings.keyrings.slice(-1)[0].addresses[0],
        network: ui.selectedAccount.network,
      })
    )
  }
)

const keyringsSlice = createSlice({
  name: "keyrings",
  initialState,
  reducers: {
    keyringLocked: (state) => ({ ...state, status: "locked" }),
    keyringUnlocked: (state) => ({ ...state, status: "unlocked" }),
    updateKeyrings: (
      state,
      {
        payload: { keyrings, keyringMetadata },
      }: {
        payload: {
          keyrings: Keyring[]
          keyringMetadata: { [keyringId: string]: KeyringMetadata }
        }
      }
    ) => {
      // When the keyrings are locked, we receive updateKeyrings with an empty
      // list as the keyring service clears the in-memory keyrings. For UI
      // purposes, however, we want to continue tracking the keyring metadata,
      // so we ignore an empty list if the keyrings are locked.
      if (keyrings.length === 0 && state.status === "locked") {
        return state
      }

      return {
        ...state,
        keyrings,
        keyringMetadata,
      }
    },
    setKeyringToVerify: (state, { payload }) => ({
      ...state,
      keyringToVerify: payload,
    }),
    setIsCurrentPasswordValid: (
      state,
      { payload }: { payload: boolean | null }
    ) => ({
      ...state,
      isCurrentPasswordValid: payload,
    }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(importKeyring.pending, (state) => {
        return {
          ...state,
          importing: "pending",
        }
      })
      .addCase(importKeyring.fulfilled, (state) => {
        return {
          ...state,
          importing: "done",
          keyringToVerify: null,
        }
      })
  },
})

export const {
  updateKeyrings,
  keyringLocked,
  keyringUnlocked,
  setKeyringToVerify,
  setIsCurrentPasswordValid,
} = keyringsSlice.actions

export default keyringsSlice.reducer

// Async thunk to bubble the generateNewKeyring action from  store to emitter.
export const generateNewKeyring = createBackgroundAsyncThunk(
  "keyrings/generateNewKeyring",
  async () => {
    await emitter.emit("generateNewKeyring")
  }
)

export const deriveAddress = createBackgroundAsyncThunk(
  "keyrings/deriveAddress",
  async (id: string) => {
    await emitter.emit("deriveAddress", id)
  }
)

export const unlockKeyrings = createBackgroundAsyncThunk(
  "keyrings/unlockKeyrings",
  async (password: string) => {
    await emitter.emit("unlockKeyrings", password)
  }
)

export const createPassword = createBackgroundAsyncThunk(
  "keyrings/createPassword",
  async (password: string) => {
    await emitter.emit("createPassword", password)
  }
)

export const changePassword = createBackgroundAsyncThunk(
  "keyrings/changePassword",
  async (stringifiedPasswords: string) => {
    await emitter.emit("changePassword", stringifiedPasswords)
  }
)
